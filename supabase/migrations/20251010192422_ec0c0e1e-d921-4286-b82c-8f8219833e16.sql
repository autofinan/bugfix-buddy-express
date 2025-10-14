-- Criar tabela de planejamento financeiro
CREATE TABLE IF NOT EXISTS public.planejamento_financeiro (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL,
  mes_referencia TEXT NOT NULL,
  receita_total NUMERIC NOT NULL DEFAULT 0,
  custos NUMERIC NOT NULL DEFAULT 0,
  despesas NUMERIC NOT NULL DEFAULT 0,
  lucro_liquido NUMERIC NOT NULL DEFAULT 0,
  retirada_sugerida NUMERIC NOT NULL DEFAULT 0,
  reinvestimento_sugerido NUMERIC NOT NULL DEFAULT 0,
  impostos_sugerido NUMERIC NOT NULL DEFAULT 0,
  reserva_sugerida NUMERIC NOT NULL DEFAULT 0,
  criado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  atualizado_em TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id, mes_referencia)
);

-- Habilitar RLS
ALTER TABLE public.planejamento_financeiro ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can view their own financial planning"
  ON public.planejamento_financeiro
  FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "Users can create their own financial planning"
  ON public.planejamento_financeiro
  FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can update their own financial planning"
  ON public.planejamento_financeiro
  FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Users can delete their own financial planning"
  ON public.planejamento_financeiro
  FOR DELETE
  USING (auth.uid() = owner_id);

-- Trigger para atualizar atualizado_em
CREATE TRIGGER update_planejamento_financeiro_updated_at
  BEFORE UPDATE ON public.planejamento_financeiro
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger para definir owner_id automaticamente
CREATE TRIGGER set_owner_id_planejamento_financeiro
  BEFORE INSERT ON public.planejamento_financeiro
  FOR EACH ROW
  EXECUTE FUNCTION public.set_owner_id();