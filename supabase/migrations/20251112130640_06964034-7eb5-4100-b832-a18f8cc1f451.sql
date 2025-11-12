-- Permitir que admins vejam todos os perfis de usuários
CREATE POLICY "Admins e suporte podem ver todos os perfis"
ON public.profiles
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'suporte'));

-- Permitir que admins vejam todas as roles de usuários
CREATE POLICY "Admins e suporte podem ver todas as roles"
ON public.user_roles
FOR SELECT
USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'suporte'));