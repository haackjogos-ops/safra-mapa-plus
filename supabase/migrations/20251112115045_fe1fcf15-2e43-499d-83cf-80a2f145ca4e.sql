-- Criar função can_access_page
CREATE OR REPLACE FUNCTION public.can_access_page(_user_id UUID, _page_path TEXT)
RETURNS BOOLEAN
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  page_record RECORD;
  user_roles_array app_role[];
BEGIN
  -- Buscar informações da página
  SELECT is_public, allowed_roles INTO page_record
  FROM public.page_permissions
  WHERE page_path = _page_path;
  
  -- Se a página não existe nas permissões, negar acesso
  IF NOT FOUND THEN
    RETURN false;
  END IF;
  
  -- Se a página é pública, permitir acesso
  IF page_record.is_public THEN
    RETURN true;
  END IF;
  
  -- Se não há usuário logado, negar acesso
  IF _user_id IS NULL THEN
    RETURN false;
  END IF;
  
  -- Buscar roles do usuário
  SELECT ARRAY_AGG(role) INTO user_roles_array
  FROM public.user_roles
  WHERE user_id = _user_id;
  
  -- Se o usuário não tem roles, negar acesso
  IF user_roles_array IS NULL OR array_length(user_roles_array, 1) IS NULL THEN
    RETURN false;
  END IF;
  
  -- Verificar se alguma role do usuário está nas roles permitidas
  RETURN user_roles_array && page_record.allowed_roles;
END;
$$;