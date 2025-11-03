-- Fix all critical security issues identified in the security review

-- Remove conflicting permissive RLS policies that could override restrictive ones
-- Keep only owner-based policies for proper data isolation

-- Categories table - remove permissive policies, keep owner-based
DROP POLICY IF EXISTS "Authenticated users can view categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can insert categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can update categories" ON public.categories;
DROP POLICY IF EXISTS "Authenticated users can delete categories" ON public.categories;

-- Products table - remove permissive policies, keep owner-based
DROP POLICY IF EXISTS "Authenticated users can insert products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can update products" ON public.products;
DROP POLICY IF EXISTS "Authenticated users can delete products" ON public.products;

-- Sales table - remove permissive policies, keep owner-based
DROP POLICY IF EXISTS "Authenticated users can view sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can insert sales" ON public.sales;
DROP POLICY IF EXISTS "Authenticated users can update sales" ON public.sales;

-- Sale items table - remove permissive policies, keep owner-based
DROP POLICY IF EXISTS "Authenticated users can view sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can insert sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can update sale_items" ON public.sale_items;
DROP POLICY IF EXISTS "Authenticated users can delete sale_items" ON public.sale_items;

-- Inventory movements table - remove permissive policies, keep owner-based
DROP POLICY IF EXISTS "Authenticated users can view inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can insert inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can update inventory_movements" ON public.inventory_movements;
DROP POLICY IF EXISTS "Authenticated users can delete inventory_movements" ON public.inventory_movements;

-- Ensure all tables have RLS enabled
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Add missing triggers for automatic owner_id setting
CREATE OR REPLACE FUNCTION public.set_owner_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Add triggers for automatic owner_id setting on INSERT
DROP TRIGGER IF EXISTS set_owner_id_categories ON public.categories;
CREATE TRIGGER set_owner_id_categories
  BEFORE INSERT ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

DROP TRIGGER IF EXISTS set_owner_id_products ON public.products;
CREATE TRIGGER set_owner_id_products
  BEFORE INSERT ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

DROP TRIGGER IF EXISTS set_owner_id_sales ON public.sales;
CREATE TRIGGER set_owner_id_sales
  BEFORE INSERT ON public.sales
  FOR EACH ROW EXECUTE FUNCTION public.set_owner_id();

-- Update search_path for all existing functions to prevent potential security issues
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_owner_id_sale_items()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM sales WHERE id = NEW.sale_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE OR REPLACE FUNCTION public.set_owner_id_inventory_movements()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM products WHERE id = NEW.product_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Ensure backup tables are completely secure (they already have deny-all policies)
-- Verify all backup tables have RLS enabled
ALTER TABLE public._backup_inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public._backup_sales ENABLE ROW LEVEL SECURITY;