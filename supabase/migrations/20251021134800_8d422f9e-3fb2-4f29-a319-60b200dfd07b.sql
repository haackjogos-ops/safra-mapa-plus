-- Criação da tabela de insumos
CREATE TABLE public.supplies (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  nome text NOT NULL,
  categoria text NOT NULL,
  quantidade_estoque numeric NOT NULL DEFAULT 0,
  unidade_medida text NOT NULL,
  preco_unitario numeric NOT NULL,
  fornecedor text,
  fornecedor_contato text,
  data_validade date,
  local_armazenamento text,
  estoque_minimo numeric DEFAULT 0,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criação da tabela de compras de insumos
CREATE TABLE public.supply_purchases (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supply_id uuid NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  data_compra date NOT NULL,
  quantidade numeric NOT NULL,
  preco_unitario numeric NOT NULL,
  valor_total numeric NOT NULL,
  fornecedor text NOT NULL,
  nota_fiscal text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Criação da tabela de uso de insumos
CREATE TABLE public.supply_usage (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  supply_id uuid NOT NULL REFERENCES public.supplies(id) ON DELETE CASCADE,
  safra_id integer,
  planting_area_id uuid REFERENCES public.planting_areas(id) ON DELETE SET NULL,
  quantidade_usada numeric NOT NULL,
  data_uso date NOT NULL,
  responsavel text,
  observacoes text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.supplies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_purchases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.supply_usage ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para supplies
CREATE POLICY "Todos podem visualizar insumos"
  ON public.supplies FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar insumos"
  ON public.supplies FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar insumos"
  ON public.supplies FOR UPDATE
  USING (true);

CREATE POLICY "Todos podem deletar insumos"
  ON public.supplies FOR DELETE
  USING (true);

-- Políticas RLS para supply_purchases
CREATE POLICY "Todos podem visualizar compras"
  ON public.supply_purchases FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar compras"
  ON public.supply_purchases FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar compras"
  ON public.supply_purchases FOR UPDATE
  USING (true);

CREATE POLICY "Todos podem deletar compras"
  ON public.supply_purchases FOR DELETE
  USING (true);

-- Políticas RLS para supply_usage
CREATE POLICY "Todos podem visualizar uso"
  ON public.supply_usage FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar uso"
  ON public.supply_usage FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar uso"
  ON public.supply_usage FOR UPDATE
  USING (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_supplies_updated_at
  BEFORE UPDATE ON public.supplies
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir dados de exemplo
INSERT INTO public.supplies (nome, categoria, quantidade_estoque, unidade_medida, preco_unitario, fornecedor, estoque_minimo)
VALUES 
  ('Fertilizante NPK 10-10-10', 'Fertilizante', 500, 'kg', 3.50, 'AgroFertil Ltda', 100),
  ('Semente de Soja BRS 232', 'Semente', 200, 'kg', 12.00, 'Sementes do Brasil', 50),
  ('Herbicida Glifosato', 'Defensivo', 150, 'litro', 25.00, 'DefensaAgro', 30),
  ('Adubo Orgânico', 'Fertilizante', 1000, 'kg', 2.00, 'Orgânicos Naturais', 200),
  ('Inseticida Deltametrina', 'Defensivo', 80, 'litro', 35.00, 'DefensaAgro', 20);