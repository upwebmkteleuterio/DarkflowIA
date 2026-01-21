
# Mirror do Banco de Dados (Supabase) - Versão Final
*Referência técnica atualizada em Março/2025.*

## 🔐 Configurações de Ambiente (Edge Functions Secrets)
Para o sistema de pagamentos funcionar, os seguintes segredos devem estar no Supabase:
| Nome do Secret | Origem | Descrição |
| :--- | :--- | :--- |
| `STRIPE_SECRET_KEY` | Stripe (API Keys) | Chave secreta `sk_...` para criar sessões de checkout. |
| `STRIPE_WEBHOOK_SECRET` | Stripe (Webhooks) | Chave `whsec_...` para validar notificações de pagamento. |

## 👤 Tabela: `public.profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | PK (Vinculado ao auth.users) |
| display_name | TEXT | Nome público do usuário |
| role | TEXT | free, pro, adm |
| text_credits | INTEGER | Saldo de créditos de roteiro (Atualmente usado como saldo total) |
| image_credits | INTEGER | Saldo de créditos de imagem |
| subscription_status | TEXT | active, trialing, past_due, canceled |
| stripe_customer_id | TEXT | ID do cliente no Stripe |
| plan_id | UUID | FK para a tabela plans |
| current_period_end | TIMESTAMP | Data de expiração/renovação da assinatura |

## 📊 Tabela: `public.plans`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | PK |
| name | TEXT | Nome do plano (Ex: Free, Profissional, Agência) |
| price | NUMERIC | Valor mensal |
| text_credits | INTEGER | Créditos de roteiro incluídos |
| image_credits | INTEGER | Créditos de imagem incluídos |
| minutes_per_credit | INTEGER | Conversão tempo/crédito |
| max_duration_limit | INTEGER | Limite do slider (Minutos) |
| features | JSONB | Lista de benefícios (Array de strings) |
| type | TEXT | free, pro, adm |
| stripe_price_id | TEXT | ID do preço no Stripe |

### Mapeamento de Dados Atual (Sincronizado com Stripe):
- **Free**: (R$ 0) -> `stripe_price_id`: `NULL`
- **Profissional**: (R$ 99) -> `stripe_price_id`: `price_1Ss7WtBCuxUguEEAxw7LeQxc`
- **Agência**: (R$ 249) -> `stripe_price_id`: `price_1Ss7X4BCuxUguEEAkgfmsOyp`
