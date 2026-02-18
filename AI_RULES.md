# AI Rules & Tech Stack - DarkFlow

## Tech Stack
- **Framework:** React 19 com TypeScript.
- **Roteamento:** React Router 7 utilizando `HashRouter` (para compatibilidade com ambientes de hospedagem estática).
- **Backend & Auth:** Supabase (Auth, PostgreSQL, Storage).
- **Estilização:** Tailwind CSS para layouts e designs responsivos.
- **Componentes UI:** Biblioteca shadcn/ui (Radix UI) para componentes acessíveis e consistentes.
- **Ícones:** Lucide React e Material Symbols (Google Fonts).
- **Gerenciamento de Estado:** React Context API (`AuthContext` para sessão e `BatchContext` para processos em lote).
- **Integração AI:** Google Gemini API (modelos Flash e Pro via `@google/genai`).
- **Pagamentos:** Stripe e AbacatePay integrados via Supabase Edge Functions.

## Regras de Desenvolvimento
- **Rotas:** Mantenha todas as definições de rotas centralizadas no arquivo `src/App.tsx`.
- **Organização de Arquivos:** 
  - Páginas principais em `src/pages/`.
  - Componentes reutilizáveis em `src/components/`.
  - Lógica extraída em hooks customizados em `src/hooks/`.
- **Estilização:** Utilize exclusivamente classes utilitárias do Tailwind CSS. Evite criar arquivos CSS externos.
- **Componentes UI:** Verifique sempre se um componente já existe na pasta `ui` do shadcn antes de criar um novo do zero.
- **Segurança:** Nunca exponha chaves de API sensíveis no frontend. Operações críticas (como pagamentos ou segredos) devem ser processadas via Supabase Edge Functions.
- **Tipagem:** O uso de TypeScript é obrigatório. Evite o uso de `any` para garantir a integridade dos dados, especialmente nos modelos definidos em `src/types.ts`.
- **Autenticação:** Utilize sempre o hook `useAuth` para acessar o perfil e o status da sessão do usuário.