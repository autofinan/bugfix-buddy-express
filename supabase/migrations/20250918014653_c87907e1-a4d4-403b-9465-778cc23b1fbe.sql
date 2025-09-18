-- Enhanced security for budgets table and customer data protection

-- Create a function to mask customer PII for unauthorized access
CREATE OR REPLACE FUNCTION public.mask_customer_data(
  customer_name text,
  customer_email text, 
  customer_phone text,
  is_owner boolean
)
RETURNS TABLE(
  masked_name text,
  masked_email text,
  masked_phone text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF is_owner THEN
    -- Owner can see full data
    RETURN QUERY SELECT customer_name, customer_email, customer_phone;
  ELSE
    -- Non-owners see masked data
    RETURN QUERY SELECT 
      CASE 
        WHEN customer_name IS NOT NULL THEN '***PROTECTED***'
        ELSE NULL
      END,
      CASE 
        WHEN customer_email IS NOT NULL THEN '***@***.***'  
        ELSE NULL
      END,
      CASE
        WHEN customer_phone IS NOT NULL THEN '***-***-****'
        ELSE NULL
      END;
  END IF;
END;
$$;

-- Create secure function to get budget list with masked customer data
CREATE OR REPLACE FUNCTION public.get_budgets_secure(
  search_term text DEFAULT NULL,
  limit_count integer DEFAULT 50,
  offset_count integer DEFAULT 0
)
RETURNS TABLE(
  id uuid,
  subtotal numeric,
  discount_type text,
  discount_value numeric,
  total numeric,
  status budget_status,
  notes text,
  valid_until date,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  owner_id uuid,
  converted_sale_id uuid,
  customer_name_masked text,
  customer_email_masked text,
  customer_phone_masked text,
  has_customer_info boolean
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  RETURN QUERY
  SELECT 
    b.id,
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
    -- Always mask customer data in list view for security
    CASE 
      WHEN b.customer_name IS NOT NULL THEN 
        CASE WHEN b.owner_id = auth.uid() THEN LEFT(b.customer_name, 1) || '***' ELSE '***' END
      ELSE NULL
    END as customer_name_masked,
    CASE 
      WHEN b.customer_email IS NOT NULL THEN 
        CASE WHEN b.owner_id = auth.uid() THEN '***@' || SPLIT_PART(b.customer_email, '@', 2) ELSE '***@***.***' END
      ELSE NULL
    END as customer_email_masked,
    CASE
      WHEN b.customer_phone IS NOT NULL THEN '***-***-****'
      ELSE NULL
    END as customer_phone_masked,
    (b.customer_name IS NOT NULL OR b.customer_email IS NOT NULL OR b.customer_phone IS NOT NULL) as has_customer_info
  FROM budgets b
  WHERE b.owner_id = auth.uid()
  AND (
    search_term IS NULL 
    OR b.notes ILIKE '%' || search_term || '%'
    OR b.id::text ILIKE '%' || search_term || '%'
  )
  ORDER BY b.created_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$;

-- Enhanced function to get single budget with full customer data (only for owners)
CREATE OR REPLACE FUNCTION public.get_budget_details_secure(budget_id_param uuid)
RETURNS TABLE(
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
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  owner_id uuid,
  converted_sale_id uuid
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Ensure user is authenticated
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Authentication required';
  END IF;
  
  -- Log access attempt for audit purposes
  RAISE LOG 'Budget details accessed by user % for budget %', auth.uid(), budget_id_param;
  
  -- Return budget data only if user owns it
  RETURN QUERY
  SELECT 
    b.id,
    b.customer_name,
    b.customer_email,
    b.customer_phone,
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
    b.converted_sale_id
  FROM budgets b
  WHERE b.id = budget_id_param 
  AND b.owner_id = auth.uid();
  
  -- Raise exception if no budget found (either doesn't exist or user doesn't own it)
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Budget not found or access denied';
  END IF;
END;
$$;

-- Create audit log table for customer data access
CREATE TABLE IF NOT EXISTS public.customer_data_access_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  budget_id uuid NOT NULL,
  access_type text NOT NULL,
  accessed_at timestamp with time zone DEFAULT now(),
  ip_address inet,
  user_agent text
);

-- Enable RLS on audit log
ALTER TABLE public.customer_data_access_log ENABLE ROW LEVEL SECURITY;

-- Only allow users to see their own access logs
CREATE POLICY "Users can view their access logs" 
ON public.customer_data_access_log 
FOR SELECT 
USING (user_id = auth.uid());

-- System can insert access logs
CREATE POLICY "System can insert access logs" 
ON public.customer_data_access_log 
FOR INSERT 
WITH CHECK (true);

-- Add trigger to automatically set owner_id for audit logs
CREATE OR REPLACE FUNCTION public.set_audit_log_user_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.user_id IS NULL THEN
    NEW.user_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_audit_log_user_id_trigger
  BEFORE INSERT ON public.customer_data_access_log
  FOR EACH ROW
  EXECUTE FUNCTION public.set_audit_log_user_id();