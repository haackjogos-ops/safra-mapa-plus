-- Funções administrativas para gerenciar roles

-- Função para adicionar role a um usuário
CREATE OR REPLACE FUNCTION public.admin_add_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é suporte ou admin
  IF NOT (has_role(auth.uid(), 'suporte') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas suporte pode adicionar roles.';
  END IF;
  
  -- Adicionar role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (_user_id, _role)
  ON CONFLICT (user_id, role) DO NOTHING;
  
  RETURN true;
END;
$$;

-- Função para remover role de um usuário
CREATE OR REPLACE FUNCTION public.admin_remove_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Verificar se o usuário atual é suporte ou admin
  IF NOT (has_role(auth.uid(), 'suporte') OR has_role(auth.uid(), 'admin')) THEN
    RAISE EXCEPTION 'Acesso negado. Apenas suporte pode remover roles.';
  END IF;
  
  -- Remover role
  DELETE FROM public.user_roles
  WHERE user_id = _user_id AND role = _role;
  
  RETURN true;
END;
$$;