-- Fix security definer view by removing SECURITY DEFINER and using a standard view
DROP VIEW IF EXISTS public.sales_with_profit;

-- Create standard view for sales with profit calculations (without SECURITY DEFINER)
CREATE VIEW public.sales_with_profit AS
SELECT 
  s.*,
  COALESCE(SUM(si.total_price), 0) as total_revenue,
  COALESCE(SUM((si.unit_price - COALESCE(si.custo_unitario, 0)) * si.quantity), 0) as total_profit,
  CASE 
    WHEN COALESCE(SUM(si.total_price), 0) > 0 
    THEN (COALESCE(SUM((si.unit_price - COALESCE(si.custo_unitario, 0)) * si.quantity), 0) / COALESCE(SUM(si.total_price), 0)) * 100 
    ELSE 0 
  END as profit_margin_percentage
FROM public.sales s
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY s.id, s.date, s.total, s.payment_method, s.note, s.created_at;