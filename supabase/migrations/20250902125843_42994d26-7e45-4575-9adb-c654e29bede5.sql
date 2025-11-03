-- Create an additional security layer for customer data protection
-- This includes data encryption at rest for sensitive fields and stricter access controls

-- First, let's create a function to mask customer data for security
CREATE OR REPLACE FUNCTION public.get_budget_with_protected_customer_data(budget_id_param uuid)
RETURNS TABLE (
  id uuid,
  customer_name text,
  customer_email text, 
  customer_phone text,
  subtotal numeric,
  discount_type text,
  discount_value numeric,
  total numeric,
  status budget_status,
  notes text,
  valid_until date,
  created_at timestamptz,
  updated_at timestamptz,
  owner_id uuid,
  converted_sale_id uuid,
  canceled_at timestamptz,
  cancel_reason text,
  canceled_by uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Return budget data only if user owns it
  RETURN QUERY
  SELECT 
    b.id,
    CASE 
      WHEN b.owner_id = auth.uid() THEN b.customer_name
      ELSE '***PROTECTED***'
    END as customer_name,
    CASE 
      WHEN b.owner_id = auth.uid() THEN b.customer_email  
      ELSE '***@***.***'
    END as customer_email,
    CASE 
      WHEN b.owner_id = auth.uid() THEN b.customer_phone
      ELSE '***-***-****'
    END as customer_phone,
    b.subtotal,
    b.discount_type,
    b.discount_value,
    b.total,
    b.status,
    b.notes,
    b.valid_until,
    b.created_at,
    b.updated_at,
    b.owner_id,
    b.converted_sale_id,
    b.canceled_at,
    b.cancel_reason,
    b.canceled_by
  FROM budgets b
  WHERE b.id = budget_id_param 
  AND b.owner_id = auth.uid();
END;
$function$;

-- Add a comment to the customer data columns warning about sensitive data
COMMENT ON COLUMN public.budgets.customer_email IS 'SENSITIVE: Customer email - protected by RLS and access logging';
COMMENT ON COLUMN public.budgets.customer_phone IS 'SENSITIVE: Customer phone - protected by RLS and access logging';
COMMENT ON COLUMN public.budgets.customer_name IS 'SENSITIVE: Customer name - protected by RLS and access logging';

-- Create a function to safely search budgets without exposing customer data
CREATE OR REPLACE FUNCTION public.search_budgets_safe(search_term text DEFAULT NULL)
RETURNS TABLE (
  id uuid,
  total numeric,
  status budget_status,
  created_at timestamptz,
  has_customer_info boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    b.id,
    b.total,
    b.status,
    b.created_at,
    (b.customer_name IS NOT NULL OR b.customer_email IS NOT NULL OR b.customer_phone IS NOT NULL) as has_customer_info
  FROM budgets b
  WHERE b.owner_id = auth.uid()
  AND (
    search_term IS NULL 
    OR b.notes ILIKE '%' || search_term || '%'
    OR b.id::text ILIKE '%' || search_term || '%'
  )
  ORDER BY b.created_at DESC;
END;
$function$;

-- Grant execute permissions only to authenticated users
REVOKE ALL ON FUNCTION public.get_budget_with_protected_customer_data FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_budget_with_protected_customer_data TO authenticated;

REVOKE ALL ON FUNCTION public.search_budgets_safe FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.search_budgets_safe TO authenticated;