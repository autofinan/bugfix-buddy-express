-- Fix RLS policies for budgets table (handling existing policies)
-- The previous security fix was too restrictive and blocked all access including owners
-- This migration restores proper functionality while maintaining security for customer PII

DO $$
BEGIN
  -- Drop the overly restrictive policy if it exists
  DROP POLICY IF EXISTS "Block direct SELECT - use secure functions only" ON public.budgets;
  
  -- Drop the conflicting deny policy for customer PII columns
  DROP POLICY IF EXISTS "Deny direct access to customer PII columns" ON public.budgets;
  
  -- Drop existing policies to recreate them with correct definitions
  DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
  DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
  DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
  DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
  
  -- Create SELECT policy
  CREATE POLICY "Users can view their own budgets"
  ON public.budgets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);
  
  -- Create INSERT policy
  CREATE POLICY "Users can create their own budgets"
  ON public.budgets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);
  
  -- Create UPDATE policy
  CREATE POLICY "Users can update their own budgets"
  ON public.budgets
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);
  
  -- Create DELETE policy
  CREATE POLICY "Users can delete their own budgets"
  ON public.budgets
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id);
END $$;

-- Update table comment to reflect the corrected security model
COMMENT ON TABLE public.budgets IS 'Customer PII (customer_name, customer_email, customer_phone) should be handled carefully. Use validation functions before storing. Access is owner-restricted via RLS.';

-- Add column-level comments for customer PII fields
COMMENT ON COLUMN public.budgets.customer_name IS 'Customer name - validate before storing, owner-only access';
COMMENT ON COLUMN public.budgets.customer_email IS 'Customer email - validate before storing, owner-only access';
COMMENT ON COLUMN public.budgets.customer_phone IS 'Customer phone - validate before storing, owner-only access';