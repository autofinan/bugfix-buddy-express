-- Criar tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  duration TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS na tabela services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para services
CREATE POLICY "Users can view their own services"
  ON public.services FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own services"
  ON public.services FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own services"
  ON public.services FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own services"
  ON public.services FOR DELETE
  USING (auth.uid() = owner_id);

-- Adicionar colunas na tabela sale_items
ALTER TABLE public.sale_items 
ADD COLUMN IF NOT EXISTS item_type TEXT DEFAULT 'produto' CHECK (item_type IN ('produto', 'servico')),
ADD COLUMN IF NOT EXISTS service_id UUID REFERENCES public.services(id);

-- Trigger para auto-preencher owner_id em services
CREATE TRIGGER set_owner_id_services
  BEFORE INSERT ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.set_owner_id();

-- Trigger para atualizar updated_at em services
CREATE TRIGGER update_services_updated_at
  BEFORE UPDATE ON public.services
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();