-- Criar tabela para safras
CREATE TABLE IF NOT EXISTS public.safras (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  cultura TEXT NOT NULL,
  variedade TEXT NOT NULL,
  area TEXT NOT NULL,
  data_plantio TEXT NOT NULL,
  previsao_colheita TEXT NOT NULL,
  fase TEXT NOT NULL DEFAULT 'Estabelecimento',
  progresso INTEGER NOT NULL DEFAULT 0,
  irrigacao TEXT NOT NULL,
  proxima_atividade TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.safras ENABLE ROW LEVEL SECURITY;

-- Criar políticas RLS
CREATE POLICY "Todos podem visualizar safras" 
ON public.safras 
FOR SELECT 
USING (true);

CREATE POLICY "Todos podem criar safras" 
ON public.safras 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Todos podem atualizar safras" 
ON public.safras 
FOR UPDATE 
USING (true);

CREATE POLICY "Todos podem deletar safras" 
ON public.safras 
FOR DELETE 
USING (true);

-- Trigger para atualizar updated_at
CREATE TRIGGER update_safras_updated_at
BEFORE UPDATE ON public.safras
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();