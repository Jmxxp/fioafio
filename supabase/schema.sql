-- Fio a Fio: catálogo compartilhado e Storage sem autenticação por e-mail.
-- A senha e o estado do modo editor são controlados somente pela interface.
-- Execute este arquivo completo no SQL Editor do Supabase.

begin;

create table if not exists public.categories (
  id text primary key,
  name text not null check (char_length(name) between 1 and 60),
  description text not null default '' check (char_length(description) <= 180),
  image_path text,
  image_url text,
  image_alt text not null default '' check (char_length(image_alt) <= 120),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint categories_id_format check (id ~ '^[A-Za-z0-9_-]{1,100}$')
);

create table if not exists public.products (
  id text primary key,
  category_id text not null references public.categories(id) on update cascade on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  description text not null default '' check (char_length(description) <= 300),
  unit text not null default 'metro' check (unit in ('metro', 'unidade', 'rolo')),
  min_quantity numeric(10,2) not null default 0.50 check (min_quantity > 0),
  quantity_step numeric(10,2) not null default 0.50 check (quantity_step > 0),
  image_path text,
  image_url text,
  image_alt text not null default '' check (char_length(image_alt) <= 120),
  sort_order integer not null default 0,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint products_id_format check (id ~ '^[A-Za-z0-9_-]{1,100}$')
);

create index if not exists categories_active_sort_idx
  on public.categories (active, sort_order);

create index if not exists products_category_sort_idx
  on public.products (category_id, sort_order);

create index if not exists products_active_idx
  on public.products (active);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists categories_set_updated_at on public.categories;
create trigger categories_set_updated_at
before update on public.categories
for each row execute function public.set_updated_at();

drop trigger if exists products_set_updated_at on public.products;
create trigger products_set_updated_at
before update on public.products
for each row execute function public.set_updated_at();

alter table public.categories enable row level security;
alter table public.products enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.categories, public.products to anon, authenticated;

drop policy if exists "catalogo publico mostra categorias ativas" on public.categories;
drop policy if exists "admins gerenciam categorias" on public.categories;
drop policy if exists "editor publico cria categorias" on public.categories;
drop policy if exists "editor publico atualiza categorias" on public.categories;
drop policy if exists "editor publico exclui categorias" on public.categories;
drop policy if exists "catalogo publico gerencia categorias" on public.categories;
create policy "catalogo publico gerencia categorias"
on public.categories
for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "catalogo publico mostra produtos ativos" on public.products;
drop policy if exists "admins gerenciam produtos" on public.products;
drop policy if exists "editor publico cria produtos" on public.products;
drop policy if exists "editor publico atualiza produtos" on public.products;
drop policy if exists "editor publico exclui produtos" on public.products;
drop policy if exists "catalogo publico gerencia produtos" on public.products;
create policy "catalogo publico gerencia produtos"
on public.products
for all
to anon, authenticated
using (true)
with check (true);

insert into storage.buckets (
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
)
values (
  'catalog-images',
  'catalog-images',
  true,
  1572864,
  array['image/jpeg', 'image/png', 'image/webp']
)
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "imagens do catalogo sao publicas" on storage.objects;
create policy "imagens do catalogo sao publicas"
on storage.objects
for select
to anon, authenticated
using (bucket_id = 'catalog-images');

drop policy if exists "admins enviam imagens do catalogo" on storage.objects;
drop policy if exists "editor publico envia imagens do catalogo" on storage.objects;
create policy "editor publico envia imagens do catalogo"
on storage.objects
for insert
to anon, authenticated
with check (
  bucket_id = 'catalog-images'
  and (storage.foldername(name))[1] in ('categories', 'products')
);

drop policy if exists "admins atualizam imagens do catalogo" on storage.objects;
drop policy if exists "editor publico atualiza imagens do catalogo" on storage.objects;
create policy "editor publico atualiza imagens do catalogo"
on storage.objects
for update
to anon, authenticated
using (
  bucket_id = 'catalog-images'
)
with check (
  bucket_id = 'catalog-images'
  and (storage.foldername(name))[1] in ('categories', 'products')
);

drop policy if exists "admins excluem imagens do catalogo" on storage.objects;
drop policy if exists "editor publico exclui imagens do catalogo" on storage.objects;
create policy "editor publico exclui imagens do catalogo"
on storage.objects
for delete
to anon, authenticated
using (
  bucket_id = 'catalog-images'
);

commit;
