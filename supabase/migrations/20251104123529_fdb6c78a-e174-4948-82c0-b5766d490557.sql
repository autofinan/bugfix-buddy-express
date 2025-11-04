-- Ensure unique constraint on (user_id, role) exists for proper upserts
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'user_roles_user_id_role_key'
  ) THEN
    ALTER TABLE public.user_roles
    ADD CONSTRAINT user_roles_user_id_role_key UNIQUE (user_id, role);
  END IF;
END;
$$;

-- Update function to use matching conflict target and correct upsert semantics
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Count existing users in user_roles
  SELECT COUNT(*) INTO user_count FROM public.user_roles;
  
  -- First user becomes owner, others become employee
  IF user_count = 0 THEN
    INSERT INTO public.user_roles (user_id, role, email)
    VALUES (NEW.id, 'owner', NEW.email)
    ON CONFLICT (user_id, role) DO UPDATE SET email = EXCLUDED.email;
  ELSE
    INSERT INTO public.user_roles (user_id, role, email)
    VALUES (NEW.id, 'employee', NEW.email)
    ON CONFLICT (user_id, role) DO UPDATE SET email = EXCLUDED.email;
  END IF;
  
  RETURN NEW;
END;
$$;
