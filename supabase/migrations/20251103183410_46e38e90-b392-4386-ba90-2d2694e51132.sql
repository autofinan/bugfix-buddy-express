-- Função que detecta se é o primeiro usuário e define como owner, ou employee para os demais
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Contar quantos usuários já existem na tabela user_roles
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- Se for o primeiro usuário, torná-lo owner
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'owner')
    ON CONFLICT (user_id) DO NOTHING;
  ELSE
    -- Caso contrário, torná-lo employee por padrão
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'employee')
    ON CONFLICT (user_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Remover trigger antigo se existir e criar novo
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Adicionar política para sistema inserir roles (se não existir)
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'user_roles' 
    AND policyname = 'System can insert roles during signup'
  ) THEN
    CREATE POLICY "System can insert roles during signup"
    ON user_roles FOR INSERT
    WITH CHECK (true);
  END IF;
END $$;