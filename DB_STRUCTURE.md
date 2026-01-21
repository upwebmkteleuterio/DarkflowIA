
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
| max_duration_limit | INTEGER | Limite do slider (Minutos) |
| features | JSONB | Lista de benefícios (Array de strings) |
| type | TEXT | free, pro, adm |
| stripe_price_id | TEXT | ID do preço no Stripe para renovação |

## Tabela: `public.profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | PK (FK auth.users ON DELETE CASCADE) |
| display_name | TEXT | Nome de exibição |
| role | TEXT | free, pro, adm |
| text_credits | INTEGER | Saldo atual de roteiro |
| image_credits | INTEGER | Saldo atual de imagem |
| plan_id | UUID | FK public.plans |
| subscription_status | TEXT | active, trialing, past_due, canceled, free |
| avatar_url | TEXT | URL da imagem de perfil |
| stripe_customer_id | TEXT | ID do cliente no Stripe |
| stripe_subscription_id | TEXT | ID da assinatura ativa |
| current_period_end | TIMESTAMPTZ | Fim do período atual (Data de Renovação) |

## Tabela: `public.projects`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT | PK (Client-side generated ou UUID) |
| user_id | UUID | FK auth.users ON DELETE CASCADE |
| name | TEXT | Nome do projeto |
| niche | TEXT | Nicho/Tópico |
| base_theme | TEXT | Tema base/Descrição |
| target_audience | TEXT | Público Alvo |
| global_duration | INTEGER | Duração padrão do lote (min) |
| global_tone | TEXT | Tom de voz padrão |
| global_retention | TEXT | Estrutura de retenção padrão |
| script_mode | TEXT | auto, manual, winner |
| winner_template | TEXT | Template para modo vencedor |
| created_at | TIMESTAMPTZ | Data de criação |

## Tabela: `public.script_items`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT | PK |
| project_id | TEXT | FK public.projects ON DELETE CASCADE |
| title | TEXT | Título do vídeo |
| script | TEXT | Conteúdo da narração |
| status | TEXT | pending, generating, completed, failed |
| thumbnails | TEXT[] | Array de URLs (Supabase Storage) |
| thumb_status | TEXT | pending, generating, completed, failed |
| thumb_prompt | TEXT | Prompt usado para a imagem |
| thumb_mode | TEXT | auto, manual |
| description | TEXT | SEO: Descrição do YouTube |
| chapters | TEXT | SEO: Timestamps/Capítulos |
| tags | TEXT | SEO: Tags separadas por vígrama |
| voice_status | TEXT | pending, generating, completed, failed |
| voice_name | TEXT | Nome da voz Gemini usada |
| audio_url | TEXT | URL do arquivo .pcm/wav |
