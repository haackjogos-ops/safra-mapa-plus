-- Criar tabela access_logs para auditoria
CREATE TABLE IF NOT EXISTS public.access_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  page_path TEXT NOT NULL,
  action TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.access_logs ENABLE ROW LEVEL SECURITY;

-- Apenas suporte pode visualizar logs
CREATE POLICY "Apenas suporte pode visualizar logs"
  ON public.access_logs
  FOR SELECT
  USING (has_role(auth.uid(), 'suporte') OR has_role(auth.uid(), 'admin'));

-- Sistema pode inserir logs
CREATE POLICY "Sistema pode inserir logs"
  ON public.access_logs
  FOR INSERT
  WITH CHECK (true);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_access_logs_user_id ON public.access_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_access_logs_page_path ON public.access_logs(page_path);
CREATE INDEX IF NOT EXISTS idx_access_logs_created_at ON public.access_logs(created_at DESC);