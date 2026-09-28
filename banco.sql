-- ==========================================================
-- Banco de dados - CRUD de times (Supabase / PostgreSQL)
-- Execute este arquivo no SQL Editor do Supabase.
-- A tabela "times" já existia no Lab R e foi ampliada aqui.
-- ==========================================================

-- 1) Acrescenta campos à tabela existente.
alter table public.times
  add column if not exists estadio text,
  add column if not exists titulos integer default 0,
  add column if not exists ativo boolean not null default true;

-- 2) Ativa Row Level Security.
alter table public.times enable row level security;

-- 3) Recria as quatro políticas usadas pelo aplicativo público.
-- Como o app não possui login, a chave publicável acessa como "anon".
drop policy if exists "times_select_anon" on public.times;
drop policy if exists "times_insert_anon" on public.times;
drop policy if exists "times_update_anon" on public.times;
drop policy if exists "times_delete_anon" on public.times;

create policy "times_select_anon"
on public.times
for select
to anon
using (true);

create policy "times_insert_anon"
on public.times
for insert
to anon
with check (true);

create policy "times_update_anon"
on public.times
for update
to anon
using (true)
with check (true);

create policy "times_delete_anon"
on public.times
for delete
to anon
using (true);

-- 4) Registros de exemplo.
insert into public.times (nome, cidade, fundacao, estadio, titulos, ativo)
values
  ('Cruzeiro', 'Belo Horizonte', 1921, 'Mineirão', 4, true),
  ('Atlético-MG', 'Belo Horizonte', 1908, 'Arena MRV', 3, true),
  ('América-MG', 'Belo Horizonte', 1912, 'Independência', 16, true);

-- Teste sugerido no navegador após executar este SQL:
-- https://SEU-PROJETO.supabase.co/rest/v1/times?select=*&apikey=SUA_CHAVE_PUBLICAVEL
