
# Mirror do Banco de Dados (Supabase)
*Este arquivo serve como referência técnica para a estrutura atual do banco de dados.*

## Tabela: `public.plans`
| Coluna | Tipo | Restrição | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | - | - |
| name | TEXT | - | - | - |
| price | DECIMAL | - | 0 | - |
| text_credits | INTEGER | - | 50 | Créditos mensais de roteiro |
| image_credits | INTEGER | - | 20 | Créditos mensais de imagem |
| minutes_per_credit | INTEGER | - | 30 | Base de cálculo para consumo |
| max_duration_limit | INTEGER | - | 60 | Limite do slider no front |
| type | TEXT | - | 'pro' | - |

## Tabela: `public.profiles`
| Coluna | Tipo | Restrição | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | PK, FK | - | - |
| text_credits | INTEGER | - | 50 | Saldo atual de roteiros |
| image_credits | INTEGER | - | 20 | Saldo atual de imagens |
| plan_id | UUID | FK (plans.id) | - | ID do plano assinado |
| role | TEXT | - | 'free' | - |
| subscription_status | TEXT | - | 'active' | - |

## Tabela: `public.script_items`
| Coluna | Tipo | Restrição | Padrão | Descrição |
| :--- | :--- | :--- | :--- | :--- |
| id | UUID | PRIMARY KEY | - | - |
| project_id | UUID | FK | - | - |
| title | TEXT | - | - | - |
| script | TEXT | - | - | - |
| thumbnails | TEXT[] | - | '{}' | Lista de URLs do Supabase Storage |
| status | TEXT | - | 'pending' | Status do Roteiro |
| thumb_status | TEXT | - | 'pending' | Status da Imagem |

## Storage (Buckets)
### Bucket: `thumbnails`
- **ID**: `thumbnails`
- **Acesso**: Público (Public)
- **Objetivo**: Armazenar as imagens geradas para as capas dos vídeos.

## RPC (Remote Procedure Calls)
### `deduct_text_credits(user_id, amount)`
- **Objetivo**: Deduzir créditos de texto de forma atômica.

### `deduct_image_credits(user_id, amount)`
- **Objetivo**: Deduzir créditos de imagem.
