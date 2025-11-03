-- Adicionar coluna de email na tabela user_roles para facilitar exibição
ALTER TABLE user_roles ADD COLUMN IF NOT EXISTS email TEXT;

-- Atualizar a função do trigger para salvar o email também
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
    INSERT INTO public.user_roles (user_id, role, email)
    VALUES (NEW.id, 'owner', NEW.email)
    ON CONFLICT (user_id) DO UPDATE SET email = NEW.email;
  ELSE
    -- Caso contrário, torná-lo employee por padrão
    INSERT INTO public.user_roles (user_id, role, email)
    VALUES (NEW.id, 'employee', NEW.email)
    ON CONFLICT (user_id) DO UPDATE SET email = NEW.email;
  END IF;
  
  RETURN NEW;
END;
$$;