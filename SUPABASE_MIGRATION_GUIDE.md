# 📊 Guia de Migração - Sistema de Categorias de Serviços

## 🔧 Instruções para executar no Supabase

### Passo 1: Acessar o SQL Editor do Supabase

1. Acesse o dashboard do seu projeto no [Supabase](https://supabase.com)
2. No menu lateral, clique em **"SQL Editor"**
3. Clique em **"New query"** para criar uma nova query

### Passo 2: Executar a Migração

Cole o conteúdo do arquivo de migração no editor SQL e execute:

```sql
/*
  # Create service_categories table

  ## New Tables

  1. `service_categories`
    - `id` (uuid, primary key) - Unique identifier
    - `owner_id` (uuid, foreign key) - User who owns this category
    - `name` (text) - Category name
    - `description` (text, nullable) - Category description
    - `color` (text) - Hex color for category badge
    - `icon` (text) - Lucide icon name
    - `is_default` (boolean) - Whether this is a default system category
    - `estimated_profit_margin` (numeric) - Estimated profit margin percentage
    - `created_at` (timestamp) - Creation timestamp
    - `updated_at` (timestamp) - Last update timestamp

  ## Security

  - Enable RLS on `service_categories` table
  - Add policies for authenticated users to manage their own categories
  - Users can only view/edit/delete their own categories
  - Default categories cannot be deleted
*/

-- Create service_categories table
CREATE TABLE IF NOT EXISTS service_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  color TEXT DEFAULT '#808080' NOT NULL,
  icon TEXT DEFAULT 'briefcase' NOT NULL,
  is_default BOOLEAN DEFAULT FALSE NOT NULL,
  estimated_profit_margin NUMERIC(5,2) DEFAULT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT valid_color CHECK (color ~ '^#[0-9A-Fa-f]{6}$'),
  CONSTRAINT valid_margin CHECK (estimated_profit_margin IS NULL OR (estimated_profit_margin >= 0 AND estimated_profit_margin <= 100))
);

-- Enable RLS
ALTER TABLE service_categories ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own categories
CREATE POLICY "Users can view their own service categories"
  ON service_categories
  FOR SELECT
  TO authenticated
  USING (auth.uid() = owner_id);

-- Policy: Users can create their own categories
CREATE POLICY "Users can create their own service categories"
  ON service_categories
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can update their own categories
CREATE POLICY "Users can update their own service categories"
  ON service_categories
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

-- Policy: Users can delete their own non-default categories
CREATE POLICY "Users can delete their own non-default service categories"
  ON service_categories
  FOR DELETE
  TO authenticated
  USING (auth.uid() = owner_id AND is_default = FALSE);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_service_categories_owner_id ON service_categories(owner_id);
CREATE INDEX IF NOT EXISTS idx_service_categories_is_default ON service_categories(is_default);

-- Add category_id column to services table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'services' AND column_name = 'category_id'
  ) THEN
    ALTER TABLE services ADD COLUMN category_id UUID REFERENCES service_categories(id) ON DELETE SET NULL;
    CREATE INDEX IF NOT EXISTS idx_services_category_id ON services(category_id);
  END IF;
END $$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_service_categories_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
DROP TRIGGER IF EXISTS update_service_categories_updated_at_trigger ON service_categories;
CREATE TRIGGER update_service_categories_updated_at_trigger
  BEFORE UPDATE ON service_categories
  FOR EACH ROW
  EXECUTE FUNCTION update_service_categories_updated_at();

-- Function to create default categories for new users
CREATE OR REPLACE FUNCTION create_default_service_categories(user_id UUID)
RETURNS VOID AS $$
BEGIN
  INSERT INTO service_categories (owner_id, name, description, color, icon, is_default, estimated_profit_margin)
  VALUES
    (user_id, 'Serviços Gerais', 'Serviços gerais e diversos', '#4B5563', 'wrench', TRUE, 30.00),
    (user_id, 'Design e Criação', 'Serviços de design gráfico e criação', '#2563EB', 'palette', TRUE, 40.00),
    (user_id, 'Consultoria', 'Serviços de consultoria e assessoria', '#10B981', 'briefcase', TRUE, 50.00),
    (user_id, 'Manutenção Técnica', 'Serviços de manutenção e reparos', '#F59E0B', 'tool', TRUE, 35.00)
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION create_default_service_categories(UUID) TO authenticated;
```

### Passo 3: Verificar a Migração

Após executar a query, verifique se tudo foi criado corretamente:

```sql
-- Verificar se a tabela foi criada
SELECT * FROM service_categories LIMIT 1;

-- Verificar se a coluna category_id foi adicionada à tabela services
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'services' AND column_name = 'category_id';
```

## ✅ Resultado Esperado

Após a execução bem-sucedida:

1. ✓ Tabela `service_categories` criada
2. ✓ Coluna `category_id` adicionada à tabela `services`
3. ✓ Políticas RLS configuradas
4. ✓ Função `create_default_service_categories` criada
5. ✓ Triggers para `updated_at` configurados

## 🔄 Categorias Padrão

As categorias padrão serão criadas automaticamente quando:
- Um usuário acessar a aba "Categorias" pela primeira vez
- Um usuário tentar cadastrar um serviço sem ter categorias

**Categorias padrão incluídas:**
1. 🔧 Serviços Gerais (cinza) - 30% margem
2. 🎨 Design e Criação (azul) - 40% margem
3. 💼 Consultoria (verde) - 50% margem
4. 🛠️ Manutenção Técnica (laranja) - 35% margem

## 🎯 Próximos Passos

Após executar a migração:
1. Acesse a aba **"Serviços"** no sistema
2. Clique na tab **"Categorias"**
3. As categorias padrão serão criadas automaticamente
4. Você pode criar, editar e personalizar suas próprias categorias
5. Ao cadastrar serviços, selecione a categoria desejada

## ⚠️ Observações Importantes

- ⚠️ Categorias marcadas como `is_default = true` **não podem ser excluídas**
- ⚠️ Se um serviço tiver uma categoria atribuída e a categoria for excluída, o campo `category_id` será definido como `NULL`
- ⚠️ Cada usuário tem suas próprias categorias isoladas (RLS ativo)
- ⚠️ As cores devem estar no formato hexadecimal `#RRGGBB`
- ⚠️ A margem de lucro deve estar entre 0 e 100%

## 🎨 Funcionalidades Disponíveis

### Na aba Categorias:
- ➕ Criar nova categoria com nome, cor, ícone e descrição
- ✏️ Editar categorias existentes
- 🗑️ Excluir categorias personalizadas
- 📊 Visualizar margem de lucro estimada
- 🎨 Escolher entre 10 cores populares ou cor personalizada
- 🔍 Selecionar entre 20 ícones populares

### No cadastro de Serviços:
- 📁 Selecionar categoria existente
- ➕ Criar nova categoria diretamente do formulário
- 👁️ Visualizar badges coloridos com ícones
- 📈 Ver margem de lucro sugerida ao lado da categoria

---

**Desenvolvido para MeuGestorPro** 🚀
