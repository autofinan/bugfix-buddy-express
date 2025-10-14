-- Verificar e corrigir a função convert_budget_to_sale
-- O erro indica que 'pending' não é um valor válido para payment_method

-- Primeiro, vamos verificar quais valores são aceitos no check constraint
-- e corrigir a função para usar um valor válido

DROP FUNCTION IF EXISTS public.convert_budget_to_sale(uuid);

CREATE OR REPLACE FUNCTION public.convert_budget_to_sale(budget_id_param uuid)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
    budget_record RECORD;
    sale_id UUID;
    item_record RECORD;
BEGIN
    -- Verificar se o orçamento existe e pertence ao usuário
    SELECT * INTO budget_record 
    FROM public.budgets 
    WHERE id = budget_id_param AND owner_id = auth.uid() AND status = 'open';
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Orçamento não encontrado ou não pode ser convertido';
    END IF;
    
    -- Criar a venda com payment_method válido (usando 'cash' ao invés de 'pending')
    INSERT INTO public.sales (
        owner_id, 
        total, 
        subtotal,
        discount_type,
        discount_value,
        payment_method, 
        note,
        date
    ) VALUES (
        budget_record.owner_id,
        budget_record.total,
        budget_record.subtotal,
        budget_record.discount_type,
        budget_record.discount_value,
        'cash', -- Mudando de 'pending' para 'cash' que deve ser válido
        'Convertido do orçamento: ' || budget_record.id,
        now()
    ) RETURNING id INTO sale_id;
    
    -- Copiar itens do orçamento para sale_items
    FOR item_record IN 
        SELECT * FROM public.budget_items WHERE budget_id = budget_id_param
    LOOP
        INSERT INTO public.sale_items (
            sale_id,
            product_id,
            quantity,
            unit_price,
            total_price,
            owner_id,
            custo_unitario
        ) 
        SELECT 
            sale_id,
            item_record.product_id,
            item_record.quantity,
            item_record.unit_price,
            item_record.total_price,
            item_record.owner_id,
            COALESCE(p.cost_unitario, 0) -- Garantir que não seja NULL
        FROM public.products p 
        WHERE p.id = item_record.product_id;
        
        -- Atualizar estoque
        UPDATE public.products 
        SET stock = stock - item_record.quantity 
        WHERE id = item_record.product_id AND owner_id = auth.uid();
    END LOOP;
    
    -- Marcar orçamento como convertido
    UPDATE public.budgets 
    SET status = 'converted', converted_sale_id = sale_id, updated_at = now()
    WHERE id = budget_id_param;
    
    RETURN sale_id;
END;
$function$;