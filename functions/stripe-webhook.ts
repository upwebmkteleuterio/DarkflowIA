import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const WEBHOOK_SECRET = (globalThis as any).Deno.env.get('STRIPE_WEBHOOK_SECRET');
  
  console.log("--- WEBHOOK STRIPE RECEBIDO ---");

  try {
    const body = await req.text();
    const stripe = new Stripe((globalThis as any).Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const event = stripe.webhooks.constructEvent(body, signature!, WEBHOOK_SECRET || '');
    console.log(`[WEBHOOK] Evento verificado: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;
      const userId = session.metadata.userId;
      const priceId = session.metadata.priceId;

      console.log(`[WEBHOOK] PAGAMENTO APROVADO! User=${userId}, Price=${priceId}`);

      const supabaseClient = createClient(
        (globalThis as any).Deno.env.get('SUPABASE_URL') ?? '',
        (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Busca créditos configurados para este plano
      console.log("[WEBHOOK] Buscando configurações do plano...");
      const { data: plan, error: planError } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('stripe_price_id', priceId)
        .single();

      if (planError || !plan) {
        console.error(`[WEBHOOK] ERRO: Plano não encontrado para o Stripe Price ID: ${priceId}`);
        throw new Error("Plano não localizado no banco.");
      }

      console.log(`[WEBHOOK] Injetando ${plan.text_credits} créditos de texto e ${plan.image_credits} de imagem...`);
      const { error: updateError } = await supabaseClient
        .from('profiles')
        .update({
          plan_id: plan.id,
          text_credits: plan.text_credits,
          image_credits: plan.image_credits,
          subscription_status: 'active',
          role: plan.type === 'pro' ? 'pro' : (plan.type === 'adm' ? 'adm' : 'free')
        })
        .eq('id', userId);
      
      if (updateError) {
        console.error("[WEBHOOK] Erro ao atualizar créditos no banco:", updateError.message);
        throw updateError;
      }
      
      console.log("[WEBHOOK] SUCESSO TOTAL: Usuário atualizado.");
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    console.error(`[WEBHOOK ERROR]: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
})