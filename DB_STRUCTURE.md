# Mirror do Banco de Dados (Supabase) - Versão Final
*Referência técnica atualizada em Março/2025.*

## 🔐 Configurações de Ambiente (Edge Functions Secrets)
| Nome do Secret | Origem | Descrição |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe (API Keys) | Chave secreta `sk_...` para chamadas de API. |
| `STRIPE_WEBHOOK_SECRET` | Stripe (Webhooks) | Chave `whsec_...` para validar webhooks. |
| `ABACATE_PAY_API_KEY` | Abacate Pay | Token Bearer para gerar PIX. |
| `SUPABASE_URL` | Supabase (API Settings) | URL do seu projeto. |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase (API Settings) | Chave de serviço (Master) para as funções. |

## 🛠️ Edge Functions Implantadas (Sincronizado com Dashboard)
1. **`abacate-pay-webhook`**: Confirmação automática via Abacate Pay.
2. **`check-pix-status`**: Valida manualmente o pagamento PIX.
3. **`create-checkout-session`**: Inicia checkout via Stripe (Cartão).
4. **`create-pix-payment`**: Gera QR Code PIX via Abacate Pay.
5. **`stripe-webhook`**: Processa renovações e eventos do Stripe.
6. **`create-portal-session`**: (NOVA) Gera o link para o usuário cancelar ou gerenciar o cartão no Stripe.

## 👤 Tabela: `public.profiles` (Colunas Adicionais)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| cellphone | TEXT | Telefone formatado para faturamento. |
| tax_id | TEXT | CPF/CNPJ para faturamento. |
| stripe_customer_id | TEXT | ID do cliente no Stripe (Necessário para o Portal). |

## 📊 Lógica de Automação
- O faturamento via PIX exige Nome, Celular e CPF salvos no perfil.
- O cancelamento de cartão é feito via Stripe Billing Portal, garantindo conformidade com leis de assinatura.