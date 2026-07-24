begin;

alter table public.products
  add column if not exists description text;

update public.products
set description = ''
where description is null;

update public.products
set description = left(description, 300)
where char_length(description) > 300;

alter table public.products
  alter column description set default '',
  alter column description set not null;

alter table public.products
  drop constraint if exists products_description_check;

alter table public.products
  add constraint products_description_check
  check (char_length(description) <= 300);

commit;
