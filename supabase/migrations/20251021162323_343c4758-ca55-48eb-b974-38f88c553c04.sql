-- Criar tabela de equipamentos
CREATE TABLE public.equipamentos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  tipo TEXT NOT NULL, -- trator, colheitadeira, pulverizador, etc
  marca TEXT,
  modelo TEXT,
  ano_fabricacao INTEGER,
  numero_serie TEXT,
  placa TEXT,
  status TEXT NOT NULL DEFAULT 'disponivel', -- disponivel, em_uso, manutencao, inativo
  valor_aquisicao NUMERIC,
  data_aquisicao DATE,
  horimetro_atual NUMERIC DEFAULT 0,
  hodometro_atual NUMERIC DEFAULT 0,
  capacidade TEXT,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de operadores
CREATE TABLE public.operadores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  cpf TEXT,
  telefone TEXT,
  email TEXT,
  data_admissao DATE,
  cnh_categoria TEXT,
  cnh_numero TEXT,
  cnh_validade DATE,
  especializacao TEXT[], -- tipos de equipamentos que pode operar
  status TEXT NOT NULL DEFAULT 'ativo', -- ativo, inativo, afastado
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de manutenções
CREATE TABLE public.manutencoes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  tipo TEXT NOT NULL, -- preventiva, corretiva, preditiva
  data_manutencao DATE NOT NULL,
  horimetro NUMERIC,
  hodometro NUMERIC,
  descricao TEXT NOT NULL,
  responsavel TEXT,
  custo NUMERIC,
  pecas_trocadas TEXT[],
  status TEXT NOT NULL DEFAULT 'pendente', -- pendente, em_andamento, concluida, cancelada
  proxima_manutencao DATE,
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Criar tabela de escala de trabalho
CREATE TABLE public.escala_trabalho (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  equipamento_id UUID NOT NULL REFERENCES public.equipamentos(id) ON DELETE CASCADE,
  operador_id UUID NOT NULL REFERENCES public.operadores(id) ON DELETE CASCADE,
  data_inicio TIMESTAMP WITH TIME ZONE NOT NULL,
  data_fim TIMESTAMP WITH TIME ZONE,
  horimetro_inicio NUMERIC,
  horimetro_fim NUMERIC,
  hodometro_inicio NUMERIC,
  hodometro_fim NUMERIC,
  area_trabalhada NUMERIC,
  planting_area_id UUID REFERENCES public.planting_areas(id),
  atividade TEXT, -- plantio, colheita, pulverizacao, etc
  observacoes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Habilitar RLS
ALTER TABLE public.equipamentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.operadores ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manutencoes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escala_trabalho ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para equipamentos
CREATE POLICY "Todos podem visualizar equipamentos"
  ON public.equipamentos FOR SELECT USING (true);

CREATE POLICY "Todos podem criar equipamentos"
  ON public.equipamentos FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar equipamentos"
  ON public.equipamentos FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar equipamentos"
  ON public.equipamentos FOR DELETE USING (true);

-- Políticas RLS para operadores
CREATE POLICY "Todos podem visualizar operadores"
  ON public.operadores FOR SELECT USING (true);

CREATE POLICY "Todos podem criar operadores"
  ON public.operadores FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar operadores"
  ON public.operadores FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar operadores"
  ON public.operadores FOR DELETE USING (true);

-- Políticas RLS para manutenções
CREATE POLICY "Todos podem visualizar manutenções"
  ON public.manutencoes FOR SELECT USING (true);

CREATE POLICY "Todos podem criar manutenções"
  ON public.manutencoes FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar manutenções"
  ON public.manutencoes FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar manutenções"
  ON public.manutencoes FOR DELETE USING (true);

-- Políticas RLS para escala de trabalho
CREATE POLICY "Todos podem visualizar escala"
  ON public.escala_trabalho FOR SELECT USING (true);

CREATE POLICY "Todos podem criar escala"
  ON public.escala_trabalho FOR INSERT WITH CHECK (true);

CREATE POLICY "Todos podem atualizar escala"
  ON public.escala_trabalho FOR UPDATE USING (true);

CREATE POLICY "Todos podem deletar escala"
  ON public.escala_trabalho FOR DELETE USING (true);

-- Triggers para atualizar updated_at
CREATE TRIGGER update_equipamentos_updated_at
  BEFORE UPDATE ON public.equipamentos
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_operadores_updated_at
  BEFORE UPDATE ON public.operadores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_manutencoes_updated_at
  BEFORE UPDATE ON public.manutencoes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_escala_trabalho_updated_at
  BEFORE UPDATE ON public.escala_trabalho
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();