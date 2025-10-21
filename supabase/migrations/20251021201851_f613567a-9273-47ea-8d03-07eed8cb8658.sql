-- Create applications table for tracking spray applications
CREATE TABLE public.applications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  equipment_type TEXT NOT NULL CHECK (equipment_type IN ('trator', 'drone')),
  equipment_id UUID REFERENCES public.equipamentos(id),
  supply_id UUID NOT NULL REFERENCES public.supplies(id),
  planting_area_id UUID NOT NULL REFERENCES public.planting_areas(id),
  application_date DATE NOT NULL,
  start_time TIME,
  end_time TIME,
  area_applied NUMERIC NOT NULL CHECK (area_applied > 0),
  product_dosage NUMERIC NOT NULL CHECK (product_dosage > 0),
  total_product_used NUMERIC NOT NULL CHECK (total_product_used > 0),
  total_spray_volume NUMERIC NOT NULL CHECK (total_spray_volume > 0),
  weather_temperature NUMERIC,
  weather_humidity NUMERIC,
  weather_wind_speed NUMERIC,
  operator_id UUID REFERENCES public.operadores(id),
  observations TEXT,
  application_cost NUMERIC DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.applications ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Todos podem visualizar aplicações"
  ON public.applications
  FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar aplicações"
  ON public.applications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar aplicações"
  ON public.applications
  FOR UPDATE
  USING (true);

CREATE POLICY "Todos podem deletar aplicações"
  ON public.applications
  FOR DELETE
  USING (true);

-- Create trigger for updated_at
CREATE TRIGGER update_applications_updated_at
  BEFORE UPDATE ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to update supply stock after application
CREATE OR REPLACE FUNCTION public.update_supply_stock_after_application()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrease supply stock
  UPDATE public.supplies
  SET quantidade_estoque = quantidade_estoque - NEW.total_product_used
  WHERE id = NEW.supply_id;
  
  -- Create supply usage record
  INSERT INTO public.supply_usage (
    supply_id,
    planting_area_id,
    quantidade_usada,
    data_uso,
    responsavel,
    observacoes
  ) VALUES (
    NEW.supply_id,
    NEW.planting_area_id,
    NEW.total_product_used,
    NEW.application_date,
    (SELECT nome FROM public.operadores WHERE id = NEW.operator_id),
    'Aplicação registrada automaticamente - ' || COALESCE(NEW.observations, '')
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic stock update
CREATE TRIGGER trigger_update_supply_stock_after_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.update_supply_stock_after_application();

-- Create function to create financial transaction after application
CREATE OR REPLACE FUNCTION public.create_financial_transaction_after_application()
RETURNS TRIGGER AS $$
DECLARE
  v_supply_name TEXT;
  v_supply_price NUMERIC;
  v_total_cost NUMERIC;
BEGIN
  -- Get supply information
  SELECT nome, preco_unitario INTO v_supply_name, v_supply_price
  FROM public.supplies
  WHERE id = NEW.supply_id;
  
  -- Calculate total cost (product + application cost)
  v_total_cost := (NEW.total_product_used * v_supply_price) + COALESCE(NEW.application_cost, 0);
  
  -- Create financial transaction
  INSERT INTO public.financial_transactions (
    tipo,
    categoria,
    subcategoria,
    descricao,
    valor,
    data_transacao,
    status,
    observacoes
  ) VALUES (
    'despesa',
    'Insumos',
    'Aplicação',
    'Aplicação de ' || v_supply_name || ' - ' || NEW.area_applied || ' ha',
    v_total_cost,
    NEW.application_date,
    'pago',
    'Aplicação automática - Produto: ' || NEW.total_product_used || ' unidades, Custo operacional: R$ ' || COALESCE(NEW.application_cost, 0)
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic financial transaction
CREATE TRIGGER trigger_create_financial_transaction_after_application
  AFTER INSERT ON public.applications
  FOR EACH ROW
  EXECUTE FUNCTION public.create_financial_transaction_after_application();

-- Create index for better performance
CREATE INDEX idx_applications_date ON public.applications(application_date DESC);
CREATE INDEX idx_applications_supply ON public.applications(supply_id);
CREATE INDEX idx_applications_area ON public.applications(planting_area_id);