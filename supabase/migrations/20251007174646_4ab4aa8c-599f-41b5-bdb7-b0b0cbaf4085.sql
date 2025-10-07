-- Security Fix: Update RLS policies for budgets table to prevent direct PII access
-- Remove the overly permissive policy and ensure customer data is only accessible via secure functions

-- Drop the existing permissive SELECT policy that allows direct column access
DROP POLICY IF EXISTS "Users can view their own budget metadata" ON public.budgets;

-- Create a restrictive policy that completely blocks direct SELECT access
-- Users must use the secure RPC functions (get_budget_details_secure, get_budgets_secure) to access data
CREATE POLICY "Block direct SELECT - use secure functions only"
ON public.budgets
FOR SELECT
TO authenticated
USING (false);

-- Ensure the deny policy for PII columns remains active
-- This policy is already in place: "Deny direct access to customer PII columns"

-- Add comment explaining the security model
COMMENT ON TABLE public.budgets IS 'Customer PII protected. Use get_budget_details_secure() or get_budgets_secure() RPC functions for data access. Direct SELECT queries are blocked by RLS.';

-- Verify that INSERT, UPDATE, DELETE policies remain functional for owners
-- These policies should already exist and allow owners to manage their own budgets