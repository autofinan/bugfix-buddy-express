-- Create a security definer function to validate user ownership and authentication
CREATE OR REPLACE FUNCTION public.validate_budget_owner(budget_id_param uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RETURN false;
  END IF;
  
  -- Check if the budget belongs to the authenticated user
  RETURN EXISTS (
    SELECT 1 
    FROM budgets 
    WHERE id = budget_id_param 
    AND owner_id = auth.uid()
  );
END;
$function$;

-- Strengthen the existing RLS policies by adding explicit auth validation
-- This ensures that users must be authenticated AND own the budget
DROP POLICY IF EXISTS "Users can view their own budgets" ON public.budgets;
CREATE POLICY "Users can view their own budgets" 
ON public.budgets 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can create their own budgets" ON public.budgets;
CREATE POLICY "Users can create their own budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can update their own budgets" ON public.budgets;
CREATE POLICY "Users can update their own budgets" 
ON public.budgets 
FOR UPDATE 
USING (auth.uid() IS NOT NULL AND owner_id = auth.uid())
WITH CHECK (auth.uid() IS NOT NULL AND owner_id = auth.uid());

DROP POLICY IF EXISTS "Users can delete their own budgets" ON public.budgets;
CREATE POLICY "Users can delete their own budgets" 
ON public.budgets 
FOR DELETE 
USING (auth.uid() IS NOT NULL AND owner_id = auth.uid());

-- Add a constraint to ensure owner_id is never null for security
-- This prevents orphaned records that could bypass RLS
ALTER TABLE public.budgets 
ALTER COLUMN owner_id SET NOT NULL;

-- Create an audit function to log access to sensitive customer data
CREATE OR REPLACE FUNCTION public.log_customer_data_access()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Log when customer data is accessed (this is for audit purposes)
  -- In a real implementation, you might want to log to a separate audit table
  RAISE LOG 'Customer data accessed by user % for budget %', auth.uid(), NEW.id;
  RETURN NEW;
END;
$function$;

-- Create trigger for audit logging on SELECT operations would require a more complex setup
-- For now, we'll focus on the core security fixes