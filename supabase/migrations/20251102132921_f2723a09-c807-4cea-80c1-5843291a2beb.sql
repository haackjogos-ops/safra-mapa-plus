-- Migration: Sistema de Autenticação e Perfis

-- 1. Criar enum de roles
CREATE TYPE public.app_role AS ENUM ('agronomo', 'agricultor');

-- 2. Criar tabela de perfis
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  nome_completo TEXT NOT NULL,
  telefone TEXT,
  cidade TEXT,
  estado TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Criar tabela de roles
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- 4. Função has_role (SECURITY DEFINER para evitar recursão)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- 5. Criar tabela de relacionamento agrônomo-agricultor
CREATE TABLE public.agronomo_agricultor (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agronomo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agricultor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  ativo BOOLEAN DEFAULT true,
  data_vinculo TIMESTAMP WITH TIME ZONE DEFAULT now(),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(agronomo_id, agricultor_id)
);

ALTER TABLE public.agronomo_agricultor ENABLE ROW LEVEL SECURITY;

-- 6. Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, nome_completo, cidade, estado)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nome_completo', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'cidade', 'São Paulo'),
    COALESCE(NEW.raw_user_meta_data->>'estado', 'SP')
  );
  
  -- Se o usuário se cadastrou com role no metadata, adiciona
  IF NEW.raw_user_meta_data->>'role' IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, (NEW.raw_user_meta_data->>'role')::app_role);
  END IF;
  
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 7. RLS Policies para profiles
CREATE POLICY "Usuários podem ver próprio perfil"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Usuários podem atualizar próprio perfil"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Agrônomos podem ver perfis de seus agricultores"
  ON public.profiles FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agronomo') AND
    id IN (
      SELECT agricultor_id FROM public.agronomo_agricultor
      WHERE agronomo_id = auth.uid() AND ativo = true
    )
  );

-- 8. RLS Policies para user_roles
CREATE POLICY "Usuários podem ver próprias roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

-- 9. RLS Policies para agronomo_agricultor
CREATE POLICY "Agrônomos podem ver seus agricultores"
  ON public.agronomo_agricultor FOR SELECT
  USING (agronomo_id = auth.uid());

CREATE POLICY "Agricultores podem ver seu agrônomo"
  ON public.agronomo_agricultor FOR SELECT
  USING (agricultor_id = auth.uid());

CREATE POLICY "Agrônomos podem gerenciar vínculos"
  ON public.agronomo_agricultor FOR ALL
  USING (agronomo_id = auth.uid());