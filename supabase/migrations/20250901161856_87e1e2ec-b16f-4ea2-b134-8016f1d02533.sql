-- Implementar melhorias no sistema POS: orçamentos, descontos e exclusão de vendas

-- 1. Criar enum para status de orçamentos
CREATE TYPE public.budget_status AS ENUM ('open', 'converted', 'canceled');

-- 2. Criar tabela de orçamentos
CREATE TABLE public.budgets (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID NOT NULL,
    customer_name TEXT,
    customer_email TEXT,
    customer_phone TEXT,
    subtotal NUMERIC NOT NULL DEFAULT 0,
    discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed')),
    discount_value NUMERIC DEFAULT 0,
    total NUMERIC NOT NULL DEFAULT 0,
    status budget_status NOT NULL DEFAULT 'open',
    notes TEXT,
    valid_until DATE,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    converted_sale_id UUID,
    canceled_by UUID,
    canceled_at TIMESTAMP WITH TIME ZONE,
    cancel_reason TEXT
);

-- 3. Criar tabela de itens de orçamento
CREATE TABLE public.budget_items (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    budget_id UUID NOT NULL,
    product_id UUID NOT NULL,
    quantity INTEGER NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC NOT NULL,
    total_price NUMERIC NOT NULL,
    owner_id UUID,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 4. Adicionar campos de desconto na tabela sales
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('percentage', 'fixed'));
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS subtotal NUMERIC;

-- 5. Adicionar campos de cancelamento na tabela sales (soft delete)
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS canceled BOOLEAN DEFAULT FALSE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS canceled_by UUID;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS canceled_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.sales ADD COLUMN IF NOT EXISTS cancel_reason TEXT;

-- 6. Criar tabela de limites de desconto por usuário
CREATE TABLE public.user_discount_limits (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL UNIQUE,
    max_discount_percentage NUMERIC NOT NULL DEFAULT 10 CHECK (max_discount_percentage >= 0 AND max_discount_percentage <= 100),
    owner_id UUID NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- 7. Habilitar RLS em todas as novas tabelas
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budget_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_discount_limits ENABLE ROW LEVEL SECURITY;

-- 8. Criar políticas RLS para budgets
CREATE POLICY "Users can view their own budgets" 
ON public.budgets 
FOR SELECT 
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own budgets" 
ON public.budgets 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own budgets" 
ON public.budgets 
FOR UPDATE 
USING (owner_id = auth.uid());

CREATE POLICY "Users can delete their own budgets" 
ON public.budgets 
FOR DELETE 
USING (owner_id = auth.uid());

-- 9. Criar políticas RLS para budget_items
CREATE POLICY "Users can view their budget items" 
ON public.budget_items 
FOR SELECT 
USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_items.budget_id AND b.owner_id = auth.uid()
));

CREATE POLICY "Users can create their budget items" 
ON public.budget_items 
FOR INSERT 
WITH CHECK (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_items.budget_id AND b.owner_id = auth.uid()
));

CREATE POLICY "Users can update their budget items" 
ON public.budget_items 
FOR UPDATE 
USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_items.budget_id AND b.owner_id = auth.uid()
));

CREATE POLICY "Users can delete their budget items" 
ON public.budget_items 
FOR DELETE 
USING (EXISTS (
    SELECT 1 FROM public.budgets b 
    WHERE b.id = budget_items.budget_id AND b.owner_id = auth.uid()
));

-- 10. Criar políticas RLS para user_discount_limits
CREATE POLICY "Users can view their discount limits" 
ON public.user_discount_limits 
FOR SELECT 
USING (owner_id = auth.uid());

CREATE POLICY "Users can create discount limits" 
ON public.user_discount_limits 
FOR INSERT 
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update discount limits" 
ON public.user_discount_limits 
FOR UPDATE 
USING (owner_id = auth.uid());

-- 11. Criar triggers para owner_id automático
CREATE TRIGGER set_owner_id_budgets
    BEFORE INSERT ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.set_owner_id();

CREATE TRIGGER set_owner_id_user_discount_limits
    BEFORE INSERT ON public.user_discount_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.set_owner_id();

-- 12. Criar função para definir owner_id em budget_items
CREATE OR REPLACE FUNCTION public.set_owner_id_budget_items()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM budgets WHERE id = NEW.budget_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER set_owner_id_budget_items
    BEFORE INSERT ON public.budget_items
    FOR EACH ROW
    EXECUTE FUNCTION public.set_owner_id_budget_items();

-- 13. Criar função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- 14. Criar triggers para updated_at
CREATE TRIGGER update_budgets_updated_at
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_discount_limits_updated_at
    BEFORE UPDATE ON public.user_discount_limits
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 15. Criar função para converter orçamento em venda
CREATE OR REPLACE FUNCTION public.convert_budget_to_sale(budget_id_param UUID)
RETURNS UUID AS $$
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
    
    -- Criar a venda
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
        'pending',
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
            p.cost_unitario
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
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 16. Criar função para cancelar venda (soft delete)
CREATE OR REPLACE FUNCTION public.cancel_sale(sale_id_param UUID, reason TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
DECLARE
    sale_record RECORD;
    item_record RECORD;
BEGIN
    -- Verificar se a venda existe e pertence ao usuário
    SELECT * INTO sale_record 
    FROM public.sales 
    WHERE id = sale_id_param AND owner_id = auth.uid() AND canceled = FALSE;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Venda não encontrada ou já cancelada';
    END IF;
    
    -- Reverter estoque
    FOR item_record IN 
        SELECT * FROM public.sale_items WHERE sale_id = sale_id_param
    LOOP
        UPDATE public.products 
        SET stock = stock + item_record.quantity 
        WHERE id = item_record.product_id AND owner_id = auth.uid();
    END LOOP;
    
    -- Marcar venda como cancelada
    UPDATE public.sales 
    SET 
        canceled = TRUE,
        canceled_by = auth.uid(),
        canceled_at = now(),
        cancel_reason = reason
    WHERE id = sale_id_param;
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;