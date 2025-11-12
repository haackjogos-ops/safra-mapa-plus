-- Atribuir roles 'suporte' e 'admin' para suporte@safracheia.app
DO $$
DECLARE
  support_user_id UUID;
BEGIN
  -- Buscar o user_id do suporte@safracheia.app
  SELECT id INTO support_user_id
  FROM auth.users
  WHERE email = 'suporte@safracheia.app';
  
  IF support_user_id IS NOT NULL THEN
    -- Adicionar role de suporte
    INSERT INTO public.user_roles (user_id, role)
    VALUES (support_user_id, 'suporte')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    -- Adicionar role de admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (support_user_id, 'admin')
    ON CONFLICT (user_id, role) DO NOTHING;
    
    RAISE NOTICE 'Roles suporte e admin adicionadas para suporte@safracheia.app (ID: %)', support_user_id;
  ELSE
    RAISE NOTICE 'Usuário suporte@safracheia.app não encontrado. Certifique-se de que o usuário está cadastrado.';
  END IF;
END $$;