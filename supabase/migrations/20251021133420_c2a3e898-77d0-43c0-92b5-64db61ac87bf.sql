-- Criar tabela de relatórios salvos
CREATE TABLE public.saved_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  tipo TEXT NOT NULL CHECK (tipo IN ('safras', 'financeiro', 'insumos', 'comparativo', 'previsao')),
  configuracao JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de preços de mercado
CREATE TABLE public.market_prices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  cultura TEXT NOT NULL,
  preco_medio DECIMAL(10, 2) NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'kg',
  data_referencia DATE NOT NULL,
  fonte TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de previsões de colheita
CREATE TABLE public.harvest_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id INTEGER NOT NULL,
  producao_estimada DECIMAL(10, 2) NOT NULL,
  unidade TEXT NOT NULL DEFAULT 'toneladas',
  custo_total_estimado DECIMAL(12, 2),
  receita_estimada DECIMAL(12, 2),
  lucro_estimado DECIMAL(12, 2),
  data_previsao DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.saved_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.harvest_forecasts ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Todos podem visualizar relatórios salvos"
  ON public.saved_reports FOR SELECT USING (true);
CREATE POLICY "Todos podem criar relatórios salvos"
  ON public.saved_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar relatórios salvos"
  ON public.saved_reports FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar relatórios salvos"
  ON public.saved_reports FOR DELETE USING (true);

CREATE POLICY "Todos podem visualizar preços de mercado"
  ON public.market_prices FOR SELECT USING (true);
CREATE POLICY "Todos podem criar preços de mercado"
  ON public.market_prices FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar preços de mercado"
  ON public.market_prices FOR UPDATE USING (true);

CREATE POLICY "Todos podem visualizar previsões"
  ON public.harvest_forecasts FOR SELECT USING (true);
CREATE POLICY "Todos podem criar previsões"
  ON public.harvest_forecasts FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar previsões"
  ON public.harvest_forecasts FOR UPDATE USING (true);

-- Triggers
CREATE TRIGGER update_saved_reports_updated_at
  BEFORE UPDATE ON public.saved_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_harvest_forecasts_updated_at
  BEFORE UPDATE ON public.harvest_forecasts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir preços de mercado exemplo
INSERT INTO public.market_prices (cultura, preco_medio, unidade, data_referencia, fonte) VALUES
  ('Soja', 150.00, 'saca 60kg', CURRENT_DATE, 'CEPEA'),
  ('Milho', 85.00, 'saca 60kg', CURRENT_DATE, 'CEPEA'),
  ('Arroz', 120.00, 'saca 50kg', CURRENT_DATE, 'CEPEA'),
  ('Fumo', 12.50, 'kg', CURRENT_DATE, 'Estimativa'),
  ('Mandioca', 0.45, 'kg', CURRENT_DATE, 'CONAB'),
  ('Banana', 2.80, 'kg', CURRENT_DATE, 'CEAGESP');

-- Índices
CREATE INDEX idx_saved_reports_tipo ON public.saved_reports(tipo);
CREATE INDEX idx_market_prices_cultura ON public.market_prices(cultura);
CREATE INDEX idx_market_prices_data ON public.market_prices(data_referencia);
CREATE INDEX idx_harvest_forecasts_safra ON public.harvest_forecasts(safra_id);

-- Função para calcular comparativo anual
CREATE OR REPLACE FUNCTION public.get_annual_comparison(year_start INTEGER, year_end INTEGER)
RETURNS TABLE(
  ano INTEGER,
  total_receitas DECIMAL,
  total_despesas DECIMAL,
  lucro DECIMAL,
  num_transacoes BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(YEAR FROM data_transacao)::INTEGER as ano,
    COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE -valor END), 0) as lucro,
    COUNT(*) as num_transacoes
  FROM public.financial_transactions
  WHERE EXTRACT(YEAR FROM data_transacao) BETWEEN year_start AND year_end
  GROUP BY EXTRACT(YEAR FROM data_transacao)
  ORDER BY ano;
END;
$$ LANGUAGE plpgsql;

-- Função para calcular comparativo trimestral
CREATE OR REPLACE FUNCTION public.get_quarterly_comparison(year_param INTEGER)
RETURNS TABLE(
  trimestre INTEGER,
  total_receitas DECIMAL,
  total_despesas DECIMAL,
  lucro DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(QUARTER FROM data_transacao)::INTEGER as trimestre,
    COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo = 'despesa' AND status = 'pago' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo = 'receita' AND status = 'pago' THEN valor ELSE -valor END), 0) as lucro
  FROM public.financial_transactions
  WHERE EXTRACT(YEAR FROM data_transacao) = year_param
  GROUP BY EXTRACT(QUARTER FROM data_transacao)
  ORDER BY trimestre;
END;
$$ LANGUAGE plpgsql;