-- Criar tabela de transações financeiras
CREATE TABLE public.financial_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  categoria TEXT NOT NULL,
  subcategoria TEXT,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  data_transacao DATE NOT NULL,
  data_vencimento DATE,
  data_pagamento DATE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'pago', 'atrasado', 'cancelado')),
  forma_pagamento TEXT,
  safra_id INTEGER,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de categorias financeiras
CREATE TABLE public.financial_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo TEXT NOT NULL CHECK (tipo IN ('receita', 'despesa')),
  nome TEXT NOT NULL,
  descricao TEXT,
  cor TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de orçamentos
CREATE TABLE public.budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id INTEGER,
  categoria TEXT NOT NULL,
  valor_previsto DECIMAL(12, 2) NOT NULL,
  valor_realizado DECIMAL(12, 2) DEFAULT 0,
  mes_referencia DATE NOT NULL,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de extratos bancários importados
CREATE TABLE public.bank_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  banco TEXT NOT NULL,
  conta TEXT NOT NULL,
  data_transacao DATE NOT NULL,
  descricao TEXT NOT NULL,
  valor DECIMAL(12, 2) NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('credito', 'debito')),
  saldo DECIMAL(12, 2),
  reconciliado BOOLEAN DEFAULT false,
  transaction_id UUID REFERENCES public.financial_transactions(id),
  arquivo_origem TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.financial_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bank_statements ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (acesso público por enquanto)
CREATE POLICY "Todos podem visualizar transações"
  ON public.financial_transactions FOR SELECT USING (true);
CREATE POLICY "Todos podem criar transações"
  ON public.financial_transactions FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar transações"
  ON public.financial_transactions FOR UPDATE USING (true);
CREATE POLICY "Todos podem deletar transações"
  ON public.financial_transactions FOR DELETE USING (true);

CREATE POLICY "Todos podem visualizar categorias"
  ON public.financial_categories FOR SELECT USING (true);
CREATE POLICY "Todos podem criar categorias"
  ON public.financial_categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar categorias"
  ON public.financial_categories FOR UPDATE USING (true);

CREATE POLICY "Todos podem visualizar orçamentos"
  ON public.budgets FOR SELECT USING (true);
CREATE POLICY "Todos podem criar orçamentos"
  ON public.budgets FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar orçamentos"
  ON public.budgets FOR UPDATE USING (true);

CREATE POLICY "Todos podem visualizar extratos"
  ON public.bank_statements FOR SELECT USING (true);
CREATE POLICY "Todos podem criar extratos"
  ON public.bank_statements FOR INSERT WITH CHECK (true);
CREATE POLICY "Todos podem atualizar extratos"
  ON public.bank_statements FOR UPDATE USING (true);

-- Triggers para updated_at
CREATE TRIGGER update_financial_transactions_updated_at
  BEFORE UPDATE ON public.financial_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at
  BEFORE UPDATE ON public.budgets
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Inserir categorias padrão
INSERT INTO public.financial_categories (tipo, nome, descricao, cor) VALUES
  ('despesa', 'Insumos', 'Sementes, fertilizantes, defensivos', '#ef4444'),
  ('despesa', 'Mão de Obra', 'Salários e encargos', '#f97316'),
  ('despesa', 'Equipamentos', 'Manutenção e combustível', '#eab308'),
  ('despesa', 'Irrigação', 'Energia e manutenção de sistemas', '#3b82f6'),
  ('despesa', 'Arrendamento', 'Aluguel de terras', '#8b5cf6'),
  ('despesa', 'Serviços', 'Consultoria, análises, terceirização', '#ec4899'),
  ('despesa', 'Impostos', 'Tributos e taxas', '#dc2626'),
  ('receita', 'Venda de Safra', 'Receita com venda de produtos', '#22c55e'),
  ('receita', 'Subsídios', 'Programas governamentais', '#10b981'),
  ('receita', 'Outras Receitas', 'Receitas diversas', '#14b8a6');

-- Índices
CREATE INDEX idx_financial_transactions_tipo ON public.financial_transactions(tipo);
CREATE INDEX idx_financial_transactions_categoria ON public.financial_transactions(categoria);
CREATE INDEX idx_financial_transactions_data ON public.financial_transactions(data_transacao);
CREATE INDEX idx_financial_transactions_safra ON public.financial_transactions(safra_id);
CREATE INDEX idx_bank_statements_reconciliado ON public.bank_statements(reconciliado);

-- Função para calcular saldo
CREATE OR REPLACE FUNCTION public.calculate_balance(start_date DATE, end_date DATE)
RETURNS TABLE(
  total_receitas DECIMAL,
  total_despesas DECIMAL,
  saldo DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE 0 END), 0) as total_receitas,
    COALESCE(SUM(CASE WHEN tipo = 'despesa' THEN valor ELSE 0 END), 0) as total_despesas,
    COALESCE(SUM(CASE WHEN tipo = 'receita' THEN valor ELSE -valor END), 0) as saldo
  FROM public.financial_transactions
  WHERE data_transacao BETWEEN start_date AND end_date
    AND status = 'pago';
END;
$$ LANGUAGE plpgsql;