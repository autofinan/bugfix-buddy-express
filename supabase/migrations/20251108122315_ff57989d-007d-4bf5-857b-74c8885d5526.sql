-- Criar tabela de cupons de desconto
CREATE TABLE IF NOT EXISTS public.discount_coupons (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id uuid NOT NULL,
  code text NOT NULL,
  discount_type text NOT NULL CHECK (discount_type IN ('percentage', 'fixed')),
  discount_value numeric NOT NULL CHECK (discount_value > 0),
  valid_from date NOT NULL DEFAULT CURRENT_DATE,
  valid_until date NOT NULL,
  is_active boolean NOT NULL DEFAULT true,
  max_uses integer DEFAULT NULL,
  current_uses integer NOT NULL DEFAULT 0,
  min_purchase_amount numeric DEFAULT 0,
  description text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(owner_id, code)
);

-- Enable RLS
ALTER TABLE public.discount_coupons ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own coupons"
ON public.discount_coupons
FOR SELECT
USING (owner_id = auth.uid());

CREATE POLICY "Users can create their own coupons"
ON public.discount_coupons
FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own coupons"
ON public.discount_coupons
FOR UPDATE
USING (owner_id = auth.uid())
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can delete their own coupons"
ON public.discount_coupons
FOR DELETE
USING (owner_id = auth.uid());

-- Índices
CREATE INDEX idx_discount_coupons_owner ON discount_coupons(owner_id);
CREATE INDEX idx_discount_coupons_code ON discount_coupons(owner_id, code);
CREATE INDEX idx_discount_coupons_active ON discount_coupons(is_active);

-- Trigger para updated_at
CREATE TRIGGER update_discount_coupons_updated_at
BEFORE UPDATE ON public.discount_coupons
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Função para validar cupom
CREATE OR REPLACE FUNCTION validate_coupon(
  p_owner_id uuid,
  p_code text,
  p_purchase_amount numeric DEFAULT 0
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_coupon record;
  v_result json;
BEGIN
  -- Buscar cupom
  SELECT * INTO v_coupon
  FROM discount_coupons
  WHERE owner_id = p_owner_id
    AND UPPER(TRIM(code)) = UPPER(TRIM(p_code))
    AND is_active = true
  LIMIT 1;

  -- Validações
  IF v_coupon IS NULL THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Cupom inválido ou não encontrado'
    );
  END IF;

  IF CURRENT_DATE < v_coupon.valid_from THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Este cupom ainda não está válido'
    );
  END IF;

  IF CURRENT_DATE > v_coupon.valid_until THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Este cupom expirou'
    );
  END IF;

  IF v_coupon.max_uses IS NOT NULL AND v_coupon.current_uses >= v_coupon.max_uses THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Este cupom atingiu o limite de usos'
    );
  END IF;

  IF p_purchase_amount < v_coupon.min_purchase_amount THEN
    RETURN json_build_object(
      'valid', false,
      'message', 'Valor mínimo de compra: R$ ' || v_coupon.min_purchase_amount::text
    );
  END IF;

  -- Cupom válido
  RETURN json_build_object(
    'valid', true,
    'message', 'Cupom aplicado com sucesso!',
    'coupon', json_build_object(
      'id', v_coupon.id,
      'code', v_coupon.code,
      'discount_type', v_coupon.discount_type,
      'discount_value', v_coupon.discount_value,
      'description', v_coupon.description
    )
  );
END;
$$;

-- Função para incrementar uso do cupom
CREATE OR REPLACE FUNCTION increment_coupon_usage(p_coupon_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE discount_coupons
  SET current_uses = current_uses + 1
  WHERE id = p_coupon_id;
END;
$$;

-- Funções RPC para configurações da loja
CREATE OR REPLACE FUNCTION get_store_settings()
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  SELECT row_to_json(t)
  INTO v_result
  FROM (
    SELECT 
      store_name,
      cnpj,
      phone,
      address,
      logo_url,
      primary_color,
      accent_color,
      max_discount_percentage
    FROM store_settings
    WHERE owner_id = auth.uid()
    LIMIT 1
  ) t;

  RETURN COALESCE(v_result, '{}'::json);
END;
$$;

CREATE OR REPLACE FUNCTION upsert_store_settings(
  p_store_name text,
  p_cnpj text,
  p_phone text,
  p_address text,
  p_logo_url text,
  p_primary_color text,
  p_accent_color text,
  p_max_discount_percentage numeric
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_result json;
BEGIN
  INSERT INTO store_settings (
    owner_id,
    store_name,
    cnpj,
    phone,
    address,
    logo_url,
    primary_color,
    accent_color,
    max_discount_percentage
  )
  VALUES (
    auth.uid(),
    p_store_name,
    p_cnpj,
    p_phone,
    p_address,
    p_logo_url,
    p_primary_color,
    p_accent_color,
    p_max_discount_percentage
  )
  ON CONFLICT (owner_id)
  DO UPDATE SET
    store_name = EXCLUDED.store_name,
    cnpj = EXCLUDED.cnpj,
    phone = EXCLUDED.phone,
    address = EXCLUDED.address,
    logo_url = EXCLUDED.logo_url,
    primary_color = EXCLUDED.primary_color,
    accent_color = EXCLUDED.accent_color,
    max_discount_percentage = EXCLUDED.max_discount_percentage,
    updated_at = now()
  RETURNING row_to_json(store_settings.*) INTO v_result;

  RETURN v_result;
END;
$$;