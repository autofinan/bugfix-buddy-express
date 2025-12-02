-- Add missing columns to products table  
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text UNIQUE,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS cost numeric,
ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;