-- Fix critical security issues

-- 1. Enable RLS on backup tables (if they still exist and don't have RLS)
ALTER TABLE IF EXISTS public._backup_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public._backup_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public._backup_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public._backup_sales ENABLE ROW LEVEL SECURITY;

-- 2. Add owner_id to sales_with_profit view and recreate it with proper security
DROP VIEW IF EXISTS public.sales_with_profit;

-- Create a secure function instead of a view to calculate sales with profit
CREATE OR REPLACE FUNCTION public.get_sales_with_profit()
RETURNS TABLE (
  id uuid,
  date timestamp with time zone,
  total numeric,
  payment_method text,
  note text,
  created_at timestamp with time zone,
  total_revenue numeric,
  total_profit numeric,
  profit_margin_percentage numeric,
  owner_id uuid
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
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
    s.owner_id
  FROM sales s
  WHERE s.owner_id = auth.uid();
$$;

-- 3. Fix the search_path issue in existing functions
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$;

-- 4. Create triggers to automatically set owner_id on all tables
CREATE OR REPLACE TRIGGER set_owner_id_products
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

CREATE OR REPLACE TRIGGER set_owner_id_categories  
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

CREATE OR REPLACE TRIGGER set_owner_id_sales
  BEFORE INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

-- 5. Create a function to set owner_id for sale_items and inventory_movements based on related records
CREATE OR REPLACE FUNCTION public.set_owner_id_sale_items()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM sales WHERE id = NEW.sale_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.set_owner_id_inventory_movements()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM products WHERE id = NEW.product_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE OR REPLACE TRIGGER set_owner_id_sale_items
  BEFORE INSERT ON public.sale_items
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id_sale_items();

CREATE OR REPLACE TRIGGER set_owner_id_inventory_movements
  BEFORE INSERT ON public.inventory_movements
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id_inventory_movements();

-- 6. Update existing data to assign to current authenticated users (if any data exists without owner_id)
-- This is safe because we're only setting NULL owner_ids and the RLS policies will prevent unauthorized access

-- Note: In a real scenario, you'd need to determine which user should own existing data
-- For now, we'll leave this for manual assignment or skip if no data exists