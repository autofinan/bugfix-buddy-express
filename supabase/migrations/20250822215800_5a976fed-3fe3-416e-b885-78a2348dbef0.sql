-- Fix products table - add primary key constraint
ALTER TABLE public.products ADD CONSTRAINT products_pkey PRIMARY KEY (id);

-- Add missing columns to categories table
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS slug text UNIQUE;

-- Add missing columns to products table  
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS sku text UNIQUE,
ADD COLUMN IF NOT EXISTS barcode text,
ADD COLUMN IF NOT EXISTS cost numeric,
ADD COLUMN IF NOT EXISTS min_stock integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS image_url text,
ADD COLUMN IF NOT EXISTS is_active boolean DEFAULT true;

-- Update created_at column if it doesn't exist properly
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'products' AND column_name = 'created_at' 
                   AND data_type = 'timestamp with time zone') THEN
        ALTER TABLE public.products ADD COLUMN created_at timestamp with time zone DEFAULT now();
    END IF;
END $$;

-- Create sales table
CREATE TABLE IF NOT EXISTS public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date timestamp with time zone NOT NULL DEFAULT now(),
    total numeric NOT NULL,
    payment_method text NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
    note text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create sale_items table
CREATE TABLE IF NOT EXISTS public.sale_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid NOT NULL REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    qty integer NOT NULL CHECK (qty > 0),
    unit_price numeric NOT NULL,
    subtotal numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create inventory_movements table
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id bigint NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('entrada', 'saida', 'ajuste', 'venda')),
    qty integer NOT NULL,
    note text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;

-- Create policies for public access
CREATE POLICY "Allow all operations on categories" ON public.categories FOR ALL USING (true);
CREATE POLICY "Allow all operations on products" ON public.products FOR ALL USING (true);
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true);
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true);
CREATE POLICY "Allow all operations on inventory_movements" ON public.inventory_movements FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_products_sku ON public.products(sku);
CREATE INDEX IF NOT EXISTS idx_products_barcode ON public.products(barcode);
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products(name);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_sale ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product ON public.sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product ON public.inventory_movements(product_id);