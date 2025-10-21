-- Criar tabela de propriedades
CREATE TABLE public.properties (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  endereco TEXT,
  area_total DECIMAL(10, 2),
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de áreas de plantio (polígonos)
CREATE TABLE public.planting_areas (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID REFERENCES public.properties(id) ON DELETE CASCADE NOT NULL,
  nome TEXT NOT NULL,
  cultura TEXT NOT NULL,
  area_hectares DECIMAL(10, 2),
  polygon_coords JSONB NOT NULL,
  cor TEXT NOT NULL DEFAULT '#22c55e',
  safra_id INTEGER,
  producao_historica JSONB,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de rotas
CREATE TABLE public.routes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  origem_property_id UUID REFERENCES public.properties(id),
  destino_property_id UUID REFERENCES public.properties(id),
  distancia_km DECIMAL(10, 2),
  tempo_estimado INTEGER,
  route_coords JSONB,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.planting_areas ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routes ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem visualizar propriedades"
  ON public.properties FOR SELECT USING (true);
CREATE POLICY "Todos podem criar propriedades"
  ON public.properties FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar propriedades"
  ON public.properties FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar propriedades"
  ON public.properties FOR DELETE USING (true);

CREATE POLICY "Todos podem visualizar áreas de plantio"
  ON public.planting_areas FOR SELECT USING (true);
CREATE POLICY "Todos podem criar áreas de plantio"
  ON public.planting_areas FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar áreas de plantio"
  ON public.planting_areas FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar áreas de plantio"
  ON public.planting_areas FOR DELETE USING (true);

CREATE POLICY "Todos podem visualizar rotas"
  ON public.routes FOR SELECT USING (true);
CREATE POLICY "Todos podem criar rotas"
  ON public.routes FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar rotas"
  ON public.routes FOR UPDATE USING (true);

-- Triggers
CREATE TRIGGER update_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_planting_areas_updated_at
  BEFORE UPDATE ON public.planting_areas
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Índices
CREATE INDEX idx_properties_coords ON public.properties(latitude, longitude);
CREATE INDEX idx_planting_areas_property ON public.planting_areas(property_id);
CREATE INDEX idx_planting_areas_cultura ON public.planting_areas(cultura);
CREATE INDEX idx_routes_origem ON public.routes(origem_property_id);
CREATE INDEX idx_routes_destino ON public.routes(destino_property_id);

-- Inserir propriedade exemplo
INSERT INTO public.properties (nome, endereco, area_total, latitude, longitude, observacoes) VALUES
  ('Fazenda Santa Clara', 'Estrada Rural, km 15', 430.00, -29.6883, -51.1281, 'Propriedade principal com 3 culturas ativas');

-- Inserir áreas de plantio exemplo
INSERT INTO public.planting_areas (property_id, nome, cultura, area_hectares, polygon_coords, cor, observacoes) VALUES
  (
    (SELECT id FROM public.properties LIMIT 1),
    'Talhão Norte - Soja',
    'Soja',
    150.00,
    '[{"lat": -29.6883, "lng": -51.1281}, {"lat": -29.6893, "lng": -51.1281}, {"lat": -29.6893, "lng": -51.1291}, {"lat": -29.6883, "lng": -51.1291}]'::jsonb,
    '#22c55e',
    'Área com irrigação por pivô central'
  ),
  (
    (SELECT id FROM public.properties LIMIT 1),
    'Talhão Sul - Milho',
    'Milho',
    200.00,
    '[{"lat": -29.6903, "lng": -51.1281}, {"lat": -29.6913, "lng": -51.1281}, {"lat": -29.6913, "lng": -51.1301}, {"lat": -29.6903, "lng": -51.1301}]'::jsonb,
    '#eab308',
    'Área com sistema de gotejamento'
  );