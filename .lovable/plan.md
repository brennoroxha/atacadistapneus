A loja online "ConstruMais" será atualizada com as páginas e funcionalidades necessárias para conformidade com o Google Shopping e a LGPD.

### Páginas e Funcionalidades a Implementar:

1.  **Páginas de Políticas (Conformidade Google Shopping & LGPD):**
    *   **Devolução e Reembolso (`/refund-policy`):** Detalhando o direito de arrependimento (7 dias) e processos de troca.
    *   **Política de Envio (`/shipping-policy`):** Prazos, custos e métodos de entrega (Correios/Sedex).
    *   **FAQ (`/faq`):** Mais de 20 perguntas frequentes com Schema `FAQPage` para SEO.
    *   **Atualização de Privacidade e Termos:** Reforçar a conformidade com LGPD e CDC.

2.  **Componentes de Consentimento e Segurança:**
    *   **Banner de Cookies:** Consentimento para LGPD.
    *   **Selos de Segurança no Footer:** SSL e PCI-DSS.

3.  **Melhorias de SEO e Estrutura de Dados:**
    *   Implementação de JSON-LD Schema em todas as páginas essenciais (WebSite, FAQPage).
    *   Criação de um Sitemap XML básico via API route.

4.  **Ajustes de UI/UX:**
    *   Inclusão de links de conformidade no Footer.
    *   Refinamento do Header para melhor acessibilidade.

### Detalhes Técnicos:
*   **Rotas:** Novas rotas no TanStack Router (`src/routes/*.tsx`).
*   **Schema.org:** Injeção de scripts JSON-LD usando o componente `HeadContent` do TanStack Router.
*   **Sitemap:** Rota de API em `src/routes/api/public/sitemap.ts`.
*   **Cookies:** Gerenciamento de estado local para o banner de consentimento.

Vou prosseguir com a implementação dessas atualizações para garantir que a loja esteja pronta para o Google Merchant Center e em total conformidade legal.
