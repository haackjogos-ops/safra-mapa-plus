-- Limpar todas as tabelas na ordem correta (respeitando foreign keys)

-- Primeiro, tabelas que dependem de outras
DELETE FROM public.task_notifications;
DELETE FROM public.checklist_items;
DELETE FROM public.supply_usage;
DELETE FROM public.supply_purchases;
DELETE FROM public.planned_purchases;
DELETE FROM public.applications;
DELETE FROM public.escala_trabalho;
DELETE FROM public.manutencoes;
DELETE FROM public.bank_statements;
DELETE FROM public.budgets;
DELETE FROM public.harvest_forecasts;
DELETE FROM public.financial_transactions;
DELETE FROM public.market_prices;

-- Depois, tabelas intermediárias
DELETE FROM public.planting_areas;
DELETE FROM public.tasks;
DELETE FROM public.supplies;
DELETE FROM public.operadores;
DELETE FROM public.equipamentos;
DELETE FROM public.routes;

-- Por último, tabelas principais
DELETE FROM public.properties;
DELETE FROM public.financial_categories;
DELETE FROM public.saved_reports;