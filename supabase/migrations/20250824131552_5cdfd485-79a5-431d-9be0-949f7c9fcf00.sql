-- Fix ID types to UUID for all tables
ALTER TABLE public.categories ALTER COLUMN id SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE public.products ALTER COLUMN id SET DATA TYPE uuid USING gen_random_uuid();
ALTER TABLE public.products ALTER COLUMN category_id SET DATA TYPE uuid;

-- Recreate sales table with proper UUID
DROP TABLE IF EXISTS public.sales;
CREATE TABLE public.sales (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    date timestamp with time zone NOT NULL DEFAULT now(),
    total numeric NOT NULL,
    payment_method text NOT NULL CHECK (payment_method IN ('pix', 'cartao', 'dinheiro')),
    note text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on sales
ALTER TABLE public.sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sales" ON public.sales FOR ALL USING (true);

-- Create sale_items table for tracking individual items in sales
CREATE TABLE IF NOT EXISTS public.sale_items (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id uuid REFERENCES public.sales(id) ON DELETE CASCADE,
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    quantity integer NOT NULL,
    unit_price numeric NOT NULL,
    total_price numeric NOT NULL,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on sale_items
ALTER TABLE public.sale_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on sale_items" ON public.sale_items FOR ALL USING (true);

-- Create inventory_movements table for stock tracking
CREATE TABLE IF NOT EXISTS public.inventory_movements (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id uuid REFERENCES public.products(id) ON DELETE CASCADE,
    type text NOT NULL CHECK (type IN ('in', 'out', 'adjustment')),
    quantity integer NOT NULL,
    reason text,
    created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on inventory_movements
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow all operations on inventory_movements" ON public.inventory_movements FOR ALL USING (true);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_sale_items_sale_id ON public.sale_items(sale_id);
CREATE INDEX IF NOT EXISTS idx_sale_items_product_id ON public.sale_items(product_id);
CREATE INDEX IF NOT EXISTS idx_sales_date ON public.sales(date);
CREATE INDEX IF NOT EXISTS idx_sales_payment_method ON public.sales(payment_method);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_product_id ON public.inventory_movements(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_type ON public.inventory_movements(type);
CREATE INDEX IF NOT EXISTS idx_inventory_movements_created_at ON public.inventory_movements(created_at);