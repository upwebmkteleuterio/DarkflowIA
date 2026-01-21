
# Mirror do Banco de Dados (Supabase) - Versão Final
*Referência técnica atualizada em Março/2025.*

## Tabela: `public.plans`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | PK |
| name | TEXT | Nome do plano |
| price | NUMERIC | Valor mensal |
| text_credits | INTEGER | Créditos de roteiro |
| image_credits | INTEGER | Créditos de imagem |
| minutes_per_credit | INTEGER | Conversão tempo/crédito |
| max_duration_limit | INTEGER | Limite do slider |
| features | JSONB | Lista de benefícios |
| type | TEXT | free, pro, adm |

## Tabela: `public.profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | PK (FK auth.users) |
| display_name | TEXT | Nome de exibição |
| role | TEXT | free, pro, adm |
| text_credits | INTEGER | Saldo atual de roteiro |
| image_credits | INTEGER | Saldo atual de imagem |
| plan_id | UUID | FK public.plans |
| subscription_status | TEXT | active, trialing, etc |

## Tabela: `public.projects`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT | PK |
| user_id | UUID | FK |
| name | TEXT | Nome do projeto |
| niche | TEXT | Nicho |
| base_theme | TEXT | Tema base |
| target_audience | TEXT | Público Alvo |
| global_duration | INTEGER | Duração em minutos |
| global_tone | TEXT | Tom de voz |
| global_retention | TEXT | Estrutura de retenção |
| script_mode | TEXT | Modo: auto, manual, winner |
| winner_template | TEXT | Template para modo vencedor |
| created_at | TIMESTAMPTZ | Data |

## Tabela: `public.script_items`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT | PK |
| project_id | TEXT | FK |
| title | TEXT | Título |
| script | TEXT | Conteúdo do roteiro |
| status | TEXT | pending, completed, generating, failed |
| thumbnails | TEXT[] | Lista de URLs das imagens |
| thumb_status | TEXT | pending, completed, etc |
| description | TEXT | SEO Descrição |
| chapters | TEXT | SEO Capítulos |
| tags | TEXT | SEO Tags |
