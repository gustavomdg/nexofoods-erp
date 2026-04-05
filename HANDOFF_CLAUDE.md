# Handoff: Atualizações UX/UI (NexoFoods ERP)

Este documento resume todas as melhorias e correções feitas recentemente no projeto. Use isso como contexto antes de continuar o desenvolvimento.

## 🎨 Ajustes Globais e Tema
- **Fonte**: Resolvido o conflito entre Inter e Geist em `globals.css`. O projeto agora usa a fonte principal `Inter` uniformemente.
- **Paleta de Cores**: Unificamos os botões e destaques de `amber-500` para `orange-500` em toda a aplicação interna (para condizer com a Landing Page).
- **Animações (Landing Page)**: Adicionado o hook `useScrollAnimation` com `IntersectionObserver` em `page.tsx` da landing page. As seções (Hero, Metrics, Solutions, Testimonials) agora têm animações de fade-up sequenciais (`animate-fade-up`, `animate-fade-up-delay-1`, etc).

## 🧭 Navegação (Layout Interno)
- **Sidebar** (`sidebar.tsx`): 
  - Seções de menu agora estão agrupadas com categorias visíveis (Principal, Restaurante, Cadastros, Financeiro, Administração).
  - Removido o rótulo "MVP" (agora "v1.0").
  - Adicionada animação suave para a abertura da sidebar em dispositivos móveis (`sidebar-slide-in`).
- **Topbar** (`topbar.tsx`):
  - Refatorada para incluir **Breadcrumbs dinâmicos** gerados a partir do `pathname`, resolvendo o problema de falta de contexto/título na parte superior da página.

## 📊 Módulo Dashboard (`dashboard/page.tsx`)
- Adicionada saudação personalizada com base na hora do dia usando o nome do usuário ativo (via Clerk).
- Implementado um widget de **Alertas Financeiros**, mostrando de forma visual (com cores) as contas vencidas, contas que vencem hoje e as que vencem nos próximos 7 dias.

## 👥 Módulo Clientes (`clientes-view.tsx`)
- **UX**: Botão de "Buscar" redundante removido; implementado **debounce automático** de 400ms na entrada de busca.
- **UI**: Adicionado um Empty State claro com ícone e CTA ("Novo Cliente") caso a tabela esteja vazia.
- Paginação aprimorada (Exibindo "X–Y de Z").

## 💸 Módulo Contas a Pagar (`contas-pagar-view.tsx`)
- Atualizados os botões e abas ativas para usar o `orange-500`.
- Implementado Empty State com CTA para melhorar a imersão.
- Adicionadas descrições dinâmicas na contagem da paginação.

## ♿ Acessibilidade (a11y)
- Adicionados atributos estruturais nos modais (Clientes e Contas a Pagar): `role="dialog"`, `aria-modal="true"`, e `aria-labelledby`.
- Foram incluídas labels explícitas ou `aria-labels` nos botões de ação e modais do sistema.

***

### 🚀 Próximos Passos Sugeridos
A auditoria principal de UX/UI está 100% aplicada. O aplicativo já está visualmente atraente e responsivo.
Os próximos focos podem ser:
1. Criação dos módulos restantes (Fornecedores, Produtos, Mesas, Estoque) seguindo este novo padrão (orange-500, empty states, debounce).
2. Adição de filtros avançados nas tabelas (por data ou categoria).
3. Conectar corretamente os links reais aos `href`s configurados temporariamente.
