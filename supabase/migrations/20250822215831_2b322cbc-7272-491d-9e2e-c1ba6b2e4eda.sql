-- Function to search products by text (name, sku, barcode)
CREATE OR REPLACE FUNCTION search_products(search_text text)
RETURNS TABLE(
    id bigint,
    name text,
    sku text,
    barcode text,
    price numeric,
    stock integer,
    category_name text
) 
LANGUAGE sql STABLE
AS $$
    SELECT 
        p.id,
        p.name,
        p.sku,
        p.barcode,
        p.price,
        p.stock,
        c.name as category_name
    FROM products p
    LEFT JOIN categories c ON p.category_id = c.id
    WHERE p.is_active = true
    AND (
        p.name ILIKE '%' || search_text || '%' OR
        p.sku ILIKE '%' || search_text || '%' OR
        p.barcode ILIKE '%' || search_text || '%'
    )
    ORDER BY p.name;
$$;

-- Function to insert products in batch
CREATE OR REPLACE FUNCTION insert_products_batch(products_data jsonb)
RETURNS TABLE(success boolean, message text, product_id bigint)
LANGUAGE plpgsql
AS $$
DECLARE
    product_record jsonb;
    category_id_val bigint;
    new_product_id bigint;
BEGIN
    FOR product_record IN SELECT * FROM jsonb_array_elements(products_data)
    LOOP
        -- Get or create category
        SELECT id INTO category_id_val 
        FROM categories 
        WHERE name = (product_record->>'category');
        
        IF category_id_val IS NULL THEN
            INSERT INTO categories (name, slug) 
            VALUES (
                product_record->>'category',
                lower(replace(product_record->>'category', ' ', '-'))
            )
            RETURNING id INTO category_id_val;
        END IF;
        
        -- Insert product
        BEGIN
            INSERT INTO products (
                name, sku, barcode, category_id, price, cost, 
                stock, min_stock, image_url, is_active
            ) VALUES (
                product_record->>'name',
                product_record->>'sku',
                NULLIF(product_record->>'barcode', ''),
                category_id_val,
                (product_record->>'price')::numeric,
                (product_record->>'cost')::numeric,
                (product_record->>'stock')::integer,
                (product_record->>'min_stock')::integer,
                NULLIF(product_record->>'image_url', ''),
                true
            )
            RETURNING id INTO new_product_id;
            
            RETURN QUERY SELECT true, 'Success'::text, new_product_id;
            
        EXCEPTION WHEN OTHERS THEN
            RETURN QUERY SELECT false, SQLERRM::text, NULL::bigint;
        END;
    END LOOP;
END;
$$;

-- Function to process sale and update stock
CREATE OR REPLACE FUNCTION process_sale(
    sale_total numeric,
    payment_method_val text,
    sale_note text,
    items jsonb
)
RETURNS TABLE(success boolean, message text, sale_id uuid)
LANGUAGE plpgsql
AS $$
DECLARE
    new_sale_id uuid;
    item_record jsonb;
    current_stock integer;
BEGIN
    -- Create sale
    INSERT INTO sales (total, payment_method, note)
    VALUES (sale_total, payment_method_val, sale_note)
    RETURNING id INTO new_sale_id;
    
    -- Process each item
    FOR item_record IN SELECT * FROM jsonb_array_elements(items)
    LOOP
        -- Check stock availability
        SELECT stock INTO current_stock 
        FROM products 
        WHERE id = (item_record->>'product_id')::bigint;
        
        IF current_stock < (item_record->>'qty')::integer THEN
            RETURN QUERY SELECT false, 'Estoque insuficiente para produto ID: ' || (item_record->>'product_id'), new_sale_id;
            RETURN;
        END IF;
        
        -- Insert sale item
        INSERT INTO sale_items (sale_id, product_id, qty, unit_price, subtotal)
        VALUES (
            new_sale_id,
            (item_record->>'product_id')::bigint,
            (item_record->>'qty')::integer,
            (item_record->>'unit_price')::numeric,
            (item_record->>'subtotal')::numeric
        );
        
        -- Update product stock
        UPDATE products 
        SET stock = stock - (item_record->>'qty')::integer
        WHERE id = (item_record->>'product_id')::bigint;
        
        -- Record inventory movement
        INSERT INTO inventory_movements (product_id, type, qty, note)
        VALUES (
            (item_record->>'product_id')::bigint,
            'venda',
            -(item_record->>'qty')::integer,
            'Venda ID: ' || new_sale_id
        );
    END LOOP;
    
    RETURN QUERY SELECT true, 'Venda processada com sucesso'::text, new_sale_id;
END;
$$;