# Conexão do catálogo ao Supabase

## 1. Criar a estrutura

Abra o **SQL Editor** do projeto Supabase e execute todo o arquivo
[`supabase/schema.sql`](supabase/schema.sql).

Se quiser apagar a estrutura anterior e começar completamente do zero, execute
primeiro [`supabase/reset.sql`](supabase/reset.sql) e depois execute
[`supabase/schema.sql`](supabase/schema.sql). O reset apaga categorias e
produtos, mas mantém o bucket `catalog-images`.

O Supabase bloqueia a exclusão direta de arquivos do Storage por SQL. Para
remover também as fotos, esvazie o bucket `catalog-images` pelo painel Storage
ou pela Storage API antes de executar o reset. Se o bucket já estiver vazio,
ignore essa etapa.

O script cria:

- `categories`: categorias da vitrine;
- `products`: produtos vinculados às categorias;
- bucket público `catalog-images`, limitado a 1,5 MB por arquivo;
- políticas RLS para o catálogo ser lido e editado usando a chave pública.

## 2. Configurar o site

No arquivo `supabase-config.js`, preencha:

```js
window.FIOAFIO_SUPABASE_CONFIG = {
  url: "https://SEU-PROJETO.supabase.co",
  publishableKey: "SUA_CHAVE_PUBLICAVEL_OU_ANON",
  bucket: "catalog-images"
};
```

Use somente a chave pública/publishable no navegador. Nunca use a
`service_role` no site.

## 3. Primeiro acesso

Ao ativar o editor, digite somente a senha já configurada na interface. Não é
necessário criar usuário, e-mail ou conta no Supabase. O catálogo começa vazio:
categorias, produtos e fotos só aparecem depois de serem cadastrados no editor e
salvos no banco. Nenhum catálogo demonstrativo ou cópia local é enviado.

## Dados necessários para conectar

Envie somente:

- **Project URL** do Supabase;
- **Publishable key** (ou a chave `anon` em projetos antigos).

Esses dados ficam em `supabase-config.js`. A senha do editor continua sendo
validada apenas no front-end.
