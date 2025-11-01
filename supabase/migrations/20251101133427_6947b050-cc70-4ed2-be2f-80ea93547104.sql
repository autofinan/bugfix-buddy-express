-- Adicionar RLS policies para service_categories
ALTER TABLE public.service_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service categories"
ON public.service_categories
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own service categories"
ON public.service_categories
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own service categories"
ON public.service_categories
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own service categories"
ON public.service_categories
FOR DELETE
USING (owner_id = auth.uid() AND is_default = false);

-- Criar função para criar categorias padrão
CREATE OR REPLACE FUNCTION public.create_default_service_categories(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.service_categories (owner_id, name, description, color, icon, is_default, estimated_profit_margin)
  VALUES
    (user_id, 'Manutenção', 'Serviços de manutenção e reparo', '#3b82f6', 'Wrench', true, 40),
    (user_id, 'Instalação', 'Serviços de instalação', '#10b981', 'Settings', true, 35),
    (user_id, 'Consultoria', 'Serviços de consultoria', '#8b5cf6', 'MessageSquare', true, 60),
    (user_id, 'Treinamento', 'Serviços de treinamento', '#f59e0b', 'GraduationCap', true, 50)
  ON CONFLICT DO NOTHING;
END;
$$;

-- Adicionar campo category_id na tabela services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS category_id uuid REFERENCES public.service_categories(id) ON DELETE SET NULL;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_services_category_id ON public.services(category_id);

-- Criar tabela para variações de serviços
CREATE TABLE IF NOT EXISTS public.service_variations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  service_id uuid NOT NULL REFERENCES public.services(id) ON DELETE CASCADE,
  name text NOT NULL,
  part_cost numeric NOT NULL DEFAULT 0,
  labor_cost numeric NOT NULL DEFAULT 0,
  total_price numeric GENERATED ALWAYS AS (part_cost + labor_cost) STORED,
  is_active boolean DEFAULT true,
  owner_id uuid NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Adicionar RLS para service_variations
ALTER TABLE public.service_variations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own service variations"
ON public.service_variations
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own service variations"
ON public.service_variations
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own service variations"
ON public.service_variations
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own service variations"
ON public.service_variations
FOR DELETE
USING (owner_id = auth.uid());

-- Adicionar campo service_type na tabela services
ALTER TABLE public.services
ADD COLUMN IF NOT EXISTS service_type text DEFAULT 'fixed' CHECK (service_type IN ('fixed', 'variable'));

-- Trigger para atualizar updated_at
CREATE TRIGGER update_service_variations_updated_at
BEFORE UPDATE ON public.service_variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para definir owner_id automaticamente
CREATE OR REPLACE FUNCTION public.set_owner_id_service_variations()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.owner_id IS NULL THEN
    NEW.owner_id := (SELECT owner_id FROM services WHERE id = NEW.service_id);
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER set_owner_id_service_variations_trigger
BEFORE INSERT ON public.service_variations
FOR EACH ROW
EXECUTE FUNCTION public.set_owner_id_service_variations();