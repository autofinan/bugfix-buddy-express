-- Adicionar coluna created_by na tabela user_roles para rastrear quem criou cada funcionário
ALTER TABLE user_roles 
ADD COLUMN IF NOT EXISTS created_by uuid REFERENCES auth.users(id);

-- Criar índice para performance nas consultas
CREATE INDEX IF NOT EXISTS idx_user_roles_created_by ON user_roles(created_by);

-- Atualizar registros existentes de owners (eles são criados por si mesmos)
UPDATE user_roles 
SET created_by = user_id 
WHERE role = 'owner' AND created_by IS NULL;