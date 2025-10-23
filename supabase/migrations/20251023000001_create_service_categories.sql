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
