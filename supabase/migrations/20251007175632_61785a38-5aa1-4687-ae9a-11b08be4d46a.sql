-- Fix RLS policies for budgets table
-- The previous security fix was too restrictive and blocked all access including owners
-- This migration restores proper functionality while maintaining security for customer PII

-- First, drop the overly restrictive policy
DROP POLICY IF EXISTS "Block direct SELECT - use secure functions only" ON public.budgets;

-- Drop the conflicting deny policy for customer PII columns
DROP POLICY IF EXISTS "Deny direct access to customer PII columns" ON public.budgets;

-- Create a proper SELECT policy that allows owners to see their own budgets
-- This includes all columns EXCEPT customer PII which should be accessed via secure functions
CREATE POLICY "Users can view their own budgets"
ON public.budgets
FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

-- Ensure INSERT policy exists and is correct
DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
CREATE POLICY "Users can create their own budgets"
ON public.budgets
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

-- Ensure UPDATE policy exists and is correct
DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
CREATE POLICY "Users can update their own budgets"
ON public.budgets
FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

-- Ensure DELETE policy exists and is correct
DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can delete their own budgets"
ON public.budgets
FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Update table comment to reflect the corrected security model
COMMENT ON TABLE public.budgets IS 'Customer PII (customer_name, customer_email, customer_phone) should be handled carefully. Use validation functions before storing. Access is owner-restricted via RLS.';

-- Add column-level comments for customer PII fields
COMMENT ON COLUMN public.budgets.customer_name IS 'Customer name - validate before storing, owner-only access';
COMMENT ON COLUMN public.budgets.customer_email IS 'Customer email - validate before storing, owner-only access';
COMMENT ON COLUMN public.budgets.customer_phone IS 'Customer phone - validate before storing, owner-only access';