-- Add custo_unitario column to sale_items table for profit calculation
ALTER TABLE public.sale_items ADD COLUMN IF NOT EXISTS custo_unitario numeric;

-- Update existing sale_items with cost from products table
UPDATE public.sale_items 
SET custo_unitario = p.cost 
FROM public.products p 
WHERE public.sale_items.product_id = p.id 
AND public.sale_items.custo_unitario IS NULL;

-- Create function to calculate profit
CREATE OR REPLACE FUNCTION public.calculate_sale_profit(
  sale_price numeric,
  unit_cost numeric,
  quantity integer
) RETURNS numeric AS $$
BEGIN
  RETURN COALESCE((sale_price - COALESCE(unit_cost, 0)) * quantity, 0);
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Create view for sales with profit calculations
CREATE OR REPLACE VIEW public.sales_with_profit AS
SELECT 
  s.*,
  COALESCE(SUM(si.total_price), 0) as total_revenue,
  COALESCE(SUM(public.calculate_sale_profit(si.unit_price, si.custo_unitario, si.quantity)), 0) as total_profit,
  CASE 
    WHEN COALESCE(SUM(si.total_price), 0) > 0 
    THEN (COALESCE(SUM(public.calculate_sale_profit(si.unit_price, si.custo_unitario, si.quantity)), 0) / COALESCE(SUM(si.total_price), 0)) * 100 
    ELSE 0 
  END as profit_margin_percentage
FROM public.sales s
LEFT JOIN public.sale_items si ON s.id = si.sale_id
GROUP BY s.id, s.date, s.total, s.payment_method, s.note, s.created_at;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id_product_id ON public.sale_items(sale_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date_created_at ON public.sales(date, created_at);