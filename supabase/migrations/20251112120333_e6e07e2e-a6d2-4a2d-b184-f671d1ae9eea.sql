-- Adicionar role 'admin' para ptairone@hotmail.com
INSERT INTO public.user_roles (user_id, role)
VALUES ('8cb884ba-eb9b-413e-9021-7c6763ec04bc', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;