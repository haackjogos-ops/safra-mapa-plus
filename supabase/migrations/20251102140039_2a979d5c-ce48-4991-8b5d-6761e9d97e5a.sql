-- Adicionar valores 'suporte' e 'admin' ao enum app_role
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'suporte';
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'admin';