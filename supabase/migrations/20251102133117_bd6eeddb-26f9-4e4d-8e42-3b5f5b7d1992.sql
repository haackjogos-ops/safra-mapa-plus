-- Migration: Sistema de Notificações

-- Criar tabela de notificações
CREATE TABLE public.notificacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'nova_foto',
    'nova_recomendacao',
    'recomendacao_atualizada',
    'vinculo_pendente',
    'vinculo_aceito',
    'mensagem'
  )),
  titulo TEXT NOT NULL,
  mensagem TEXT NOT NULL,
  link TEXT,
  lida BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.notificacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para notificacoes
CREATE POLICY "Usuários veem próprias notificações"
  ON public.notificacoes FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem marcar como lida"
  ON public.notificacoes FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger: Notificar agrônomo quando foto é enviada
CREATE OR REPLACE FUNCTION notify_agronomo_nova_foto()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, link)
  SELECT
    agronomo_id,
    'nova_foto',
    'Nova foto recebida',
    'Um agricultor enviou uma nova foto para análise',
    '/agronomo/consultoria'
  FROM public.agronomo_agricultor
  WHERE agricultor_id = NEW.agricultor_id AND ativo = true;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_foto_created
  AFTER INSERT ON public.lavoura_fotos
  FOR EACH ROW
  EXECUTE FUNCTION notify_agronomo_nova_foto();

-- Trigger: Notificar agricultor quando recomendação é criada
CREATE OR REPLACE FUNCTION notify_agricultor_nova_recomendacao()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notificacoes (user_id, tipo, titulo, mensagem, link)
  VALUES (
    NEW.agricultor_id,
    'nova_recomendacao',
    'Nova recomendação do agrônomo',
    NEW.titulo,
    '/agricultor'
  );
  
  -- Atualiza status da foto relacionada
  IF NEW.foto_id IS NOT NULL THEN
    UPDATE public.lavoura_fotos
    SET status = 'respondida'
    WHERE id = NEW.foto_id;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_recomendacao_created
  AFTER INSERT ON public.recomendacoes
  FOR EACH ROW
  EXECUTE FUNCTION notify_agricultor_nova_recomendacao();