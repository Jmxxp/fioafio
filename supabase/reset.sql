-- ATENÇÃO: este script apaga somente o catálogo Fio a Fio deste projeto.
-- Ele remove categorias, produtos e a estrutura administrativa criada pelas
-- versões anteriores deste projeto.
--
-- O Supabase não permite apagar storage.objects ou storage.buckets diretamente
-- por SQL. Para remover também as fotos, esvazie o bucket catalog-images pelo
-- painel Storage ou pela Storage API. O bucket é mantido e reutilizado.
-- Execute no SQL Editor antes de supabase/schema.sql para começar do zero.

begin;

drop policy if exists "imagens do catalogo sao publicas" on storage.objects;
drop policy if exists "admins enviam imagens do catalogo" on storage.objects;
drop policy if exists "admins atualizam imagens do catalogo" on storage.objects;
drop policy if exists "admins excluem imagens do catalogo" on storage.objects;
drop policy if exists "editor publico envia imagens do catalogo" on storage.objects;
drop policy if exists "editor publico atualiza imagens do catalogo" on storage.objects;
drop policy if exists "editor publico exclui imagens do catalogo" on storage.objects;

drop table if exists public.products cascade;
drop table if exists public.categories cascade;
drop table if exists public.admin_users cascade;
drop function if exists public.set_updated_at() cascade;

do $$
begin
  if to_regprocedure('private.is_admin()') is not null then
    execute 'drop function private.is_admin() cascade';
  end if;
end;
$$;

commit;
