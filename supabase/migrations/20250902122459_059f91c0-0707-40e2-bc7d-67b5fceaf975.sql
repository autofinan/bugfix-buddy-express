-- Update the get_sales_with_profit function to include missing fields
CREATE OR REPLACE FUNCTION public.get_sales_with_profit()
 RETURNS TABLE(
   id uuid, 
   date timestamp with time zone, 
   total numeric, 
   payment_method text, 
   note text, 
   created_at timestamp with time zone, 
   total_revenue numeric, 
   total_profit numeric, 
   profit_margin_percentage numeric, 
   owner_id uuid,
   canceled boolean,
   subtotal numeric,
   discount_type text,
   discount_value numeric,
   canceled_at timestamp with time zone,
   cancel_reason text
 )
 LANGUAGE sql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
  SELECT 
    s.id,
    s.date,
    s.total,
    s.payment_method,
    s.note,
    s.created_at,
    s.total as total_revenue,
    COALESCE(
      s.total - (
        SELECT COALESCE(SUM(si.quantity * COALESCE(si.custo_unitario, 0)), 0)
        FROM sale_items si 
        WHERE si.sale_id = s.id
      ), 
      s.total
    ) as total_profit,
    CASE 
      WHEN s.total > 0 THEN 
        ROUND(
          (COALESCE(
            s.total - (
              SELECT COALESCE(SUM(si.quantity * COALESCE(si.custo_unitario, 0)), 0)
              FROM sale_items si 
              WHERE si.sale_id = s.id
            ), 
            s.total
          ) / s.total) * 100, 
          2
        )
      ELSE 0 
    END as profit_margin_percentage,
    s.owner_id,
    COALESCE(s.canceled, false) as canceled,
    COALESCE(s.subtotal, s.total) as subtotal,
    s.discount_type,
    COALESCE(s.discount_value, 0) as discount_value,
    s.canceled_at,
    s.cancel_reason
  FROM sales s
  WHERE s.owner_id = auth.uid();
$function$