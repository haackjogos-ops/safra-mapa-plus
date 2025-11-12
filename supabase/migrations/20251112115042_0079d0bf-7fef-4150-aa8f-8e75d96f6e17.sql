-- Criar tabela page_permissions
CREATE TABLE IF NOT EXISTS public.page_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  page_path TEXT NOT NULL UNIQUE,
  page_name TEXT NOT NULL,
  description TEXT,
  allowed_roles app_role[] NOT NULL DEFAULT '{}',
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Inserir permissões iniciais para todas as páginas
INSERT INTO public.page_permissions (page_path, page_name, description, allowed_roles, is_public) VALUES
  ('/', 'Dashboard', 'Dashboard principal', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/dashboard', 'Dashboard', 'Dashboard principal', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/propriedades', 'Mapas', 'Gestão de propriedades e mapas', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/safras', 'Safras', 'Gestão de safras', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/tarefas', 'Tarefas', 'Gestão de tarefas', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/insumos', 'Insumos', 'Gestão de insumos', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/equipamentos', 'Equipamentos', 'Gestão de equipamentos', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/financeiro', 'Financeiro', 'Gestão financeira', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/relatorios', 'Relatórios', 'Relatórios gerenciais', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/clima', 'Clima', 'Informações climáticas', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/agronomo', 'Agrônomo', 'Área do agrônomo', ARRAY['agronomo', 'suporte', 'admin']::app_role[], false),
  ('/consultoria', 'Consultoria', 'Consultoria agrícola', ARRAY['agronomo', 'agricultor', 'suporte', 'admin']::app_role[], false),
  ('/agricultor', 'Dashboard Agricultor', 'Dashboard do agricultor', ARRAY['agricultor', 'suporte', 'admin']::app_role[], false),
  ('/admin', 'Administração', 'Painel administrativo', ARRAY['suporte', 'admin']::app_role[], false),
  ('/auth', 'Autenticação', 'Página de login/cadastro', '{}', true),
  ('/403', 'Acesso Negado', 'Página de acesso negado', '{}', true)
ON CONFLICT (page_path) DO NOTHING;

-- Habilitar RLS
ALTER TABLE public.page_permissions ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem visualizar permissões"
  ON public.page_permissions
  FOR SELECT
  USING (true);

CREATE POLICY "Apenas suporte pode gerenciar permissões"
  ON public.page_permissions
  FOR ALL
  USING (has_role(auth.uid(), 'suporte') OR has_role(auth.uid(), 'admin'));