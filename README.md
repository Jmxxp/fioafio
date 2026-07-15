# Fio a Fio — vitrine de tecidos

Site estático em HTML, CSS e JavaScript para a Fio a Fio, em São João da Boa
Vista/SP.

## Como abrir

Abra o arquivo **index.html** em um navegador moderno. Não há instalação nem
etapa de build. Para persistência mais previsível das fotos, prefira servir a
pasta por HTTP/localhost ao publicar o projeto.

## Recursos

- catálogo por categorias, busca e cores;
- seleção de quantidade por metro, unidade ou rolo;
- carrinho persistente no navegador;
- solicitação de orçamento formatada automaticamente para o WhatsApp +55 19 99762-5253;
- editor local hierárquico: categorias e, dentro delas, seus produtos;
- criação, edição e exclusão com confirmações;
- upload de fotos JPG, PNG ou WebP com redimensionamento e otimização;
- backup e restauração em JSON, incluindo as fotos;
- Font Awesome 7.3.0 hospedado localmente, sem depender de CDN;
- layout responsivo, animações e suporte a redução de movimento.

## Sobre o editor

O editor salva o catálogo em `localStorage` e as fotos em `IndexedDB`. As
mudanças aparecem apenas no navegador/dispositivo onde foram feitas. Use
**Dados → Exportar backup** para manter uma cópia completa ou transferir o
catálogo com as fotos.

Para publicar alterações para todos os visitantes, uma próxima versão precisará
conectar a vitrine a um backend ou CMS com autenticação.

## Arquivos principais

- **index.html**: estrutura, conteúdo e metadados;
- **styles/legacy/**: estilos históricos preservados em ordem para evitar regressões;
- **styles/components/**: hero premium, compra mobile e fluxo de orçamento;
- **app.js**: catálogo, carrinho, WhatsApp e editor;
- **assets/hero-fio-a-fio.png**: imagem institucional da abertura;
- **assets/fioafiologo.svg**: logo oficial fornecida para o projeto;
- **assets/fontawesome/**: ícones e licença do Font Awesome hospedados localmente.
