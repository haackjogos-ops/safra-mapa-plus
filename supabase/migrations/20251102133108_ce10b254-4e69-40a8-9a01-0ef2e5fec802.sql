-- Migration: Sistema de Recomendações

-- Criar tabela de recomendações
CREATE TABLE public.recomendacoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agronomo_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  agricultor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  safra_id UUID REFERENCES public.safras(id) ON DELETE SET NULL,
  foto_id UUID REFERENCES public.lavoura_fotos(id) ON DELETE SET NULL,
  tipo TEXT NOT NULL CHECK (tipo IN (
    'aplicacao_defensivo',
    'adubacao',
    'irrigacao',
    'colheita',
    'plantio',
    'poda',
    'analise_solo',
    'outro'
  )),
  titulo TEXT NOT NULL,
  descricao TEXT NOT NULL,
  prioridade TEXT DEFAULT 'media' CHECK (prioridade IN ('baixa', 'media', 'alta', 'urgente')),
  produto_recomendado TEXT,
  dosagem TEXT,
  area_aplicacao TEXT,
  data_recomendacao TIMESTAMP WITH TIME ZONE DEFAULT now(),
  data_prevista_execucao DATE,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendente' CHECK (status IN (
    'pendente',
    'visualizada',
    'em_andamento',
    'concluida',
    'cancelada'
  )),
  observacoes_agricultor TEXT,
  custo_estimado NUMERIC,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.recomendacoes ENABLE ROW LEVEL SECURITY;

-- RLS Policies para recomendacoes
CREATE POLICY "Agrônomos podem criar recomendações"
  ON public.recomendacoes FOR INSERT
  WITH CHECK (
    public.has_role(auth.uid(), 'agronomo') AND
    auth.uid() = agronomo_id
  );

CREATE POLICY "Agricultores podem ver suas recomendações"
  ON public.recomendacoes FOR SELECT
  USING (auth.uid() = agricultor_id);

CREATE POLICY "Agrônomos podem ver recomendações que criaram"
  ON public.recomendacoes FOR SELECT
  USING (auth.uid() = agronomo_id);

CREATE POLICY "Agricultores podem atualizar status e observações"
  ON public.recomendacoes FOR UPDATE
  USING (auth.uid() = agricultor_id);

CREATE POLICY "Agrônomos podem atualizar suas recomendações"
  ON public.recomendacoes FOR UPDATE
  USING (auth.uid() = agronomo_id);