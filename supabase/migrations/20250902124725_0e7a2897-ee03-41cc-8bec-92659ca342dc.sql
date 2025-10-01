-- Add additional security checks for customer data access
-- Create a security definer function to validate user ownership
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

-- Create a view that masks sensitive customer data for non-owners
CREATE OR REPLACE VIEW public.budgets_safe AS
SELECT 
  id,
  CASE 
    WHEN owner_id = auth.uid() THEN customer_name
    ELSE '*****'
  END as customer_name,
  CASE 
    WHEN owner_id = auth.uid() THEN customer_email
    ELSE '*****@*****.***'
  END as customer_email,
  CASE 
    WHEN owner_id = auth.uid() THEN customer_phone
    ELSE '*****'
  END as customer_phone,
  subtotal,
  discount_type,
  discount_value,
  total,
  status,
  notes,
  valid_until,
  created_at,
  updated_at,
  owner_id,
  converted_sale_id,
  canceled_at,
  cancel_reason,
  canceled_by
FROM budgets
WHERE owner_id = auth.uid();

-- Add RLS to the view
ALTER VIEW public.budgets_safe ENABLE ROW LEVEL SECURITY;

-- Create RLS policy for the safe view
CREATE POLICY "Users can only view their own budgets safely" 
ON public.budgets_safe 
FOR SELECT 
USING (owner_id = auth.uid());

-- Strengthen the existing RLS policies by adding auth validation
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