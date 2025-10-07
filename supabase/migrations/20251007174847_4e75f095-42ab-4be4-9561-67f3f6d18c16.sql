-- Security Fix: Ensure RLS policies properly block direct PII access
-- Check if the restrictive policy already exists, if not create it

DO $$
BEGIN
  -- Drop the overly permissive policy if it exists
  DROP POLICY IF EXISTS "Users can view their own budget metadata" ON public.budgets;
  
  -- Only create the blocking policy if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE schemaname = 'public' 
    AND tablename = 'budgets' 
    AND policyname = 'Block direct SELECT - use secure functions only'
  ) THEN
    CREATE POLICY "Block direct SELECT - use secure functions only"
    ON public.budgets
    FOR SELECT
    TO authenticated
    USING (false);
  END IF;
END $$;

-- Add comment explaining the security model
COMMENT ON TABLE public.budgets IS 'Customer PII protected. Use get_budget_details_secure() or get_budgets_secure() RPC functions for data access. Direct SELECT queries are blocked by RLS.';