-- Limpar todos os dados das tabelas
-- A ordem é importante devido às foreign keys

-- Limpar tabelas de relatórios e análises
DELETE FROM public.harvest_forecasts;
DELETE FROM public.saved_reports;
DELETE FROM public.budgets;

-- Limpar dados de aplicações e uso de insumos
DELETE FROM public.applications;
DELETE FROM public.supply_usage;
DELETE FROM public.supply_purchases;
DELETE FROM public.planned_purchases;
DELETE FROM public.supplies;

-- Limpar dados de tarefas
DELETE FROM public.task_notifications;
DELETE FROM public.checklist_items;
DELETE FROM public.tasks;

-- Limpar dados de equipamentos
DELETE FROM public.escala_trabalho;
DELETE FROM public.manutencoes;
DELETE FROM public.equipamentos;
DELETE FROM public.operadores;

-- Limpar dados financeiros
DELETE FROM public.bank_statements;
DELETE FROM public.financial_transactions;
DELETE FROM public.financial_categories;

-- Limpar dados de propriedades e culturas
DELETE FROM public.planting_areas;
DELETE FROM public.properties;
DELETE FROM public.routes;

-- Limpar preços de mercado
DELETE FROM public.market_prices;