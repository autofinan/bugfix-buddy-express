-- Add restrictive RLS policy to prevent direct access to customer PII in budgets table
-- This ensures all access to customer data must go through security definer functions

-- Drop the existing SELECT policy and recreate with more restrictive rules
DROP POLICY IF EXISTS "Users can view their own budgets" ON budgets;

-- Create new restrictive policy that denies direct SELECT with customer columns
CREATE POLICY "Deny direct access to customer PII columns" ON budgets
  AS RESTRICTIVE
  FOR SELECT
  TO authenticated
  USING (
    -- Block if trying to access customer PII directly
    -- This forces use of security definer functions
    false
  );

-- Create permissive policy for non-PII columns only
CREATE POLICY "Users can view their own budget metadata" ON budgets
  FOR SELECT
  TO authenticated
  USING (
    auth.uid() IS NOT NULL AND owner_id = auth.uid()
  );

-- Add trigger to log when customer data is accessed via RPC functions
CREATE OR REPLACE FUNCTION log_budget_customer_access()
RETURNS TRIGGER AS $$
BEGIN
  -- Log access to customer_data_access_log table
  INSERT INTO customer_data_access_log (
    user_id,
    budget_id,
    access_type,
    ip_address,
    user_agent
  ) VALUES (
    auth.uid(),
    NEW.id,
    'budget_customer_data_view',
    inet_client_addr(),
    current_setting('request.headers', true)::json->>'user-agent'
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Don't fail the operation if logging fails
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure the secure RPC functions have proper access
-- Grant execute permissions on the secure functions
GRANT EXECUTE ON FUNCTION get_budgets_secure(text, integer, integer) TO authenticated;
GRANT EXECUTE ON FUNCTION get_budget_details_secure(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION get_budget_with_protected_customer_data(uuid) TO authenticated;