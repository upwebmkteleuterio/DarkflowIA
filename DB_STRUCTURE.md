
# Estrutura do Banco de Dados (Espelho)

## Tabela: projects
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID / TEXT | Identificador único do projeto (Lote) |
| name | TEXT | Nome amigável do projeto |
| niche | TEXT | Nicho/Tópico central |
| baseTheme | TEXT | Contexto/Tema base para os roteiros |
| targetAudience | TEXT | Descrição do público alvo |
| createdAt | TIMESTAMP | Data de criação |
| globalTone | TEXT | Tom de voz padrão do lote |
| globalRetention | TEXT | Estrutura de retenção (AIDA, PAS, etc) |
| globalDuration | INTEGER | Duração alvo em minutos |
| scriptMode | TEXT | manual | winner | auto |
| winnerTemplate | TEXT | Roteiro de referência para o modo vencedor |
| positiveInstructions | TEXT | Instruções do que DEVE ter nos roteiros |
| negativeInstructions | TEXT | Instruções do que NÃO deve ter |

## Tabela: script_items (Relacionada a projects)
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID / TEXT | Identificador único do vídeo |
| project_id | UUID / TEXT | FK para o projeto pai |
| title | TEXT | Título individual do vídeo |
| script | TEXT | Conteúdo completo do roteiro |
| status | TEXT | pending | generating | completed | failed |
| thumbStatus | TEXT | pending | generating | completed | failed |
| thumbPrompt | TEXT | Prompt customizado para a thumbnail |
| thumbMode | TEXT | auto | manual |
| thumbnails | JSON / ARRAY | Lista de URLs das imagens geradas |
| description | TEXT | Metadados: Descrição SEO |
| chapters | TEXT | Metadados: Timestamps/Capítulos |
| tags | TEXT | Metadados: Lista de Tags virais |
| error | TEXT | Mensagem de erro em caso de falha |
