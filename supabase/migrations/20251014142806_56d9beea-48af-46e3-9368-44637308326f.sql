-- Garantir que a tabela store_settings tem todos os campos necessários
DO $$ 
BEGIN
  -- Adicionar coluna logo_url se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'logo_url') THEN
    ALTER TABLE store_settings ADD COLUMN logo_url TEXT;
  END IF;
  
  -- Adicionar coluna primary_color se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'primary_color') THEN
    ALTER TABLE store_settings ADD COLUMN primary_color TEXT DEFAULT '#3b82f6';
  END IF;
  
  -- Adicionar coluna accent_color se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'accent_color') THEN
    ALTER TABLE store_settings ADD COLUMN accent_color TEXT DEFAULT '#10b981';
  END IF;
  
  -- Adicionar coluna store_name se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'store_name') THEN
    ALTER TABLE store_settings ADD COLUMN store_name TEXT;
  END IF;
  
  -- Adicionar coluna cnpj se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'cnpj') THEN
    ALTER TABLE store_settings ADD COLUMN cnpj TEXT;
  END IF;
  
  -- Adicionar coluna phone se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'phone') THEN
    ALTER TABLE store_settings ADD COLUMN phone TEXT;
  END IF;
  
  -- Adicionar coluna address se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'address') THEN
    ALTER TABLE store_settings ADD COLUMN address TEXT;
  END IF;
  
  -- Adicionar coluna max_discount_percentage se não existir
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'store_settings' AND column_name = 'max_discount_percentage') THEN
    ALTER TABLE store_settings ADD COLUMN max_discount_percentage NUMERIC DEFAULT 10;
  END IF;
END $$;

-- Criar índice para melhor performance
CREATE INDEX IF NOT EXISTS idx_store_settings_owner ON store_settings(owner_id);

-- Comentários nas colunas
COMMENT ON COLUMN store_settings.logo_url IS 'URL da logo da loja armazenada no Supabase Storage';
COMMENT ON COLUMN store_settings.primary_color IS 'Cor principal da loja em formato hexadecimal';
COMMENT ON COLUMN store_settings.accent_color IS 'Cor secundária da loja em formato hexadecimal';
COMMENT ON COLUMN store_settings.max_discount_percentage IS 'Percentual máximo de desconto permitido nas vendas';