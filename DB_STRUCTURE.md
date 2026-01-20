# Mirror do Banco de Dados (Supabase) - Versão Final (Sem Áudio)
*Referência técnica atualizada em Março/2025.*

## Tabela: `public.projects`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | TEXT | PK |
| user_id | UUID | FK |
| name | TEXT | Nome do projeto |
| niche | TEXT | Nicho |
| base_theme | TEXT | Tema base |
| target_audience | TEXT | Público Alvo (Salvamento automático fixado) |
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
| status | TEXT | pending, completed, etc |