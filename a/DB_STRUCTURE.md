
# Mirror do Banco de Dados (Supabase) - Versão Final
*Referência técnica atualizada em Março/2025.*

## 👤 Tabela: `public.profiles`
| Coluna | Tipo | Descrição |
| :--- | :--- | :--- |
| id | UUID | Primary Key (Matches auth.users.id). |
| email | TEXT | Espelhamento do e-mail de autenticação. |
| display_name | TEXT | Nome público do usuário. |
| cellphone | TEXT | Telefone para faturamento. |
| tax_id | TEXT | CPF/CNPJ para faturamento. |
| stripe_customer_id | TEXT | ID do cliente no Stripe. |
| text_credits | INT | Saldo atual de créditos de texto. |
| image_credits | INT | Saldo atual de créditos de imagem. |
| plan_id | UUID | FK para a tabela plans. |
| role | TEXT | free, pro ou adm. |
| subscription_status | TEXT | active, trialing, past_due, canceled. |

## ⚙️ Triggers de Automação (SQL Corrigido)
A trigger abaixo garante a integridade dos dados ao criar um perfil, vinculando-o obrigatoriamente a um plano e espelhando o e-mail para facilitar consultas no frontend.

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  v_plan_id uuid;
  v_text int;
  v_img int;
BEGIN
  -- Busca o plano free configurado pelo ADM
  SELECT id, text_credits, image_credits INTO v_plan_id, v_text, v_img
  FROM public.plans WHERE type = 'free' LIMIT 1;

  INSERT INTO public.profiles (id, display_name, email, plan_id, text_credits, image_credits, role, subscription_status)
  VALUES (
    new.id, 
    COALESCE(new.raw_user_meta_data->>'display_name', 'Novo Criador'), 
    new.email, 
    v_plan_id, 
    v_text, 
    v_img, 
    'free', 
    'active'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    plan_id = COALESCE(profiles.plan_id, EXCLUDED.plan_id);

  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```
