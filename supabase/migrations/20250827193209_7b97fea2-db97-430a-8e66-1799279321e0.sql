-- Add RLS policies for backup tables to make them secure

-- Create restrictive policies for backup tables (deny all access since these are backups)
CREATE POLICY "Deny all access to backup_inventory_movements" 
ON public._backup_inventory_movements 
FOR ALL 
USING (false);

CREATE POLICY "Deny all access to backup_products" 
ON public._backup_products 
FOR ALL 
USING (false);

CREATE POLICY "Deny all access to backup_sale_items" 
ON public._backup_sale_items 
FOR ALL 
USING (false);

CREATE POLICY "Deny all access to backup_sales" 
ON public._backup_sales 
FOR ALL 
USING (false);

-- Alternatively, we could drop the backup tables if they're not needed:
-- DROP TABLE IF EXISTS public._backup_inventory_movements;
-- DROP TABLE IF EXISTS public._backup_products;
-- DROP TABLE IF EXISTS public._backup_sale_items;
-- DROP TABLE IF EXISTS public._backup_sales;