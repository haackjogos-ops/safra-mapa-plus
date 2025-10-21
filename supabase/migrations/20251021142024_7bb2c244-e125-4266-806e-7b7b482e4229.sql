-- Criar tabela de compras planejadas
CREATE TABLE IF NOT EXISTS public.planned_purchases (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supply_id UUID NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  data_planejada DATE NOT NULL,
  quantidade NUMERIC NOT NULL,
  preco_estimado NUMERIC NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.planned_purchases ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Todos podem visualizar compras planejadas" 
ON public.planned_purchases 
FOR SELECT 
USING (true);

CREATE POLICY "Todos podem criar compras planejadas" 
ON public.planned_purchases 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Todos podem atualizar compras planejadas" 
ON public.planned_purchases 
FOR UPDATE 
USING (true);

CREATE POLICY "Todos podem deletar compras planejadas" 
ON public.planned_purchases 
FOR DELETE 
USING (true);

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_planned_purchases_updated_at
BEFORE UPDATE ON public.planned_purchases
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();