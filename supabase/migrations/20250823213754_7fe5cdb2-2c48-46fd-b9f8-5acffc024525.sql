-- Add slug column to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text;

-- Add unique constraint to categories slug if not exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_slug_key') THEN
        ALTER TABLE public.categories ADD CONSTRAINT categories_slug_key UNIQUE (slug);
    END IF;
END $$;

-- Create policies for categories and products
CREATE POLICY IF NOT EXISTS "Allow all operations on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY IF NOT EXISTS "Allow all operations on products" ON public.products FOR ALL USING (true);

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date timestamp with time zone NOT NULL DEFAULT now(),
    total numeric NOT NULL,
    payment_method text NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
    note text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS and create policy for sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY IF NOT EXISTS "Allow all operations on sales" ON public.sales FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);