-- Criar tabela de tarefas
CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  safra_id INTEGER,
  titulo TEXT NOT NULL,
  descricao TEXT,
  categoria TEXT NOT NULL,
  prioridade TEXT NOT NULL CHECK (prioridade IN ('baixa', 'media', 'alta')),
  data_prevista TIMESTAMP WITH TIME ZONE NOT NULL,
  data_conclusao TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'em_andamento', 'concluida', 'atrasada')),
  responsavel TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de checklist items
CREATE TABLE public.checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  titulo TEXT NOT NULL,
  concluido BOOLEAN NOT NULL DEFAULT false,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Criar tabela de notificações
CREATE TABLE public.task_notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID REFERENCES public.tasks(id) ON DELETE CASCADE NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('proxima', 'atrasada', 'lembrete')),
  enviada BOOLEAN NOT NULL DEFAULT false,
  data_envio TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.checklist_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_notifications ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para tasks (acesso público por enquanto)
CREATE POLICY "Todos podem visualizar tarefas"
  ON public.tasks
  FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar tarefas"
  ON public.tasks
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar tarefas"
  ON public.tasks
  FOR UPDATE
  USING (true);

CREATE POLICY "Todos podem deletar tarefas"
  ON public.tasks
  FOR DELETE
  USING (true);

-- Políticas RLS para checklist_items
CREATE POLICY "Todos podem visualizar checklist items"
  ON public.checklist_items
  FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar checklist items"
  ON public.checklist_items
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar checklist items"
  ON public.checklist_items
  FOR UPDATE
  USING (true);

CREATE POLICY "Todos podem deletar checklist items"
  ON public.checklist_items
  FOR DELETE
  USING (true);

-- Políticas RLS para task_notifications
CREATE POLICY "Todos podem visualizar notificações"
  ON public.task_notifications
  FOR SELECT
  USING (true);

CREATE POLICY "Todos podem criar notificações"
  ON public.task_notifications
  FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Todos podem atualizar notificações"
  ON public.task_notifications
  FOR UPDATE
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_tasks_updated_at
  BEFORE UPDATE ON public.tasks
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Função para atualizar status de tarefas atrasadas
CREATE OR REPLACE FUNCTION public.update_overdue_tasks()
RETURNS void AS $$
BEGIN
  UPDATE public.tasks
  SET status = 'atrasada'
  WHERE status != 'concluida'
    AND data_prevista < now()
    AND status != 'atrasada';
END;
$$ LANGUAGE plpgsql;

-- Índices para melhor performance
CREATE INDEX idx_tasks_safra_id ON public.tasks(safra_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_data_prevista ON public.tasks(data_prevista);
CREATE INDEX idx_checklist_items_task_id ON public.checklist_items(task_id);
CREATE INDEX idx_task_notifications_task_id ON public.task_notifications(task_id);