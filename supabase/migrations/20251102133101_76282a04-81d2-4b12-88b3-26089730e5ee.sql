-- Migration: Sistema de Upload de Fotos e Storage

-- 1. Criar bucket de fotos (se não existir)
INSERT INTO storage.buckets (id, name, public)
VALUES ('lavoura-fotos', 'lavoura-fotos', false)
ON CONFLICT (id) DO NOTHING;

-- 2. RLS para storage - Agricultores podem fazer upload
CREATE POLICY "Agricultores podem fazer upload"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'lavoura-fotos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 3. RLS para storage - Donos podem ver suas fotos
CREATE POLICY "Donos podem ver suas fotos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lavoura-fotos' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

-- 4. RLS para storage - Agrônomos podem ver fotos de seus agricultores
CREATE POLICY "Agrônomos podem ver fotos de seus agricultores"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'lavoura-fotos' AND
    (storage.foldername(name))[1] IN (
      SELECT agricultor_id::text FROM public.agronomo_agricultor
      WHERE agronomo_id = auth.uid() AND ativo = true
    )
  );

-- 5. Criar tabela de fotos
CREATE TABLE public.lavoura_fotos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agricultor_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  safra_id UUID REFERENCES public.safras(id) ON DELETE SET NULL,
  planting_area_id UUID REFERENCES public.planting_areas(id) ON DELETE SET NULL,
  foto_url TEXT NOT NULL,
  descricao TEXT,
  localizacao TEXT,
  latitude NUMERIC,
  longitude NUMERIC,
  status TEXT DEFAULT 'pendente' CHECK (status IN ('pendente', 'analisada', 'respondida')),
  data_envio TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.lavoura_fotos ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies para lavoura_fotos
CREATE POLICY "Agricultores podem criar fotos"
  ON public.lavoura_fotos FOR INSERT
  WITH CHECK (auth.uid() = agricultor_id);

CREATE POLICY "Agricultores podem ver suas fotos"
  ON public.lavoura_fotos FOR SELECT
  USING (auth.uid() = agricultor_id);

CREATE POLICY "Agrônomos podem ver fotos de seus agricultores"
  ON public.lavoura_fotos FOR SELECT
  USING (
    public.has_role(auth.uid(), 'agronomo') AND
    agricultor_id IN (
      SELECT agricultor_id FROM public.agronomo_agricultor
      WHERE agronomo_id = auth.uid() AND ativo = true
    )
  );

CREATE POLICY "Agrônomos podem atualizar status das fotos"
  ON public.lavoura_fotos FOR UPDATE
  USING (
    public.has_role(auth.uid(), 'agronomo') AND
    agricultor_id IN (
      SELECT agricultor_id FROM public.agronomo_agricultor
      WHERE agronomo_id = auth.uid() AND ativo = true
    )
  );