
// Função para processar o pagamento aprovado e liberar créditos
// Deploy: supabase functions deploy stripe-webhook

declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2022-11-15',
  httpClient: Stripe.createFetchHttpClient(),
})

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(
      body,
      signature!,
      Deno.env.get('STRIPE_WEBHOOK_SECRET') || ''
    );

    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;
      const userId = session.metadata.userId;
      // Captura segura via metadata que enviamos no create-checkout-session
      const priceId = session.metadata.priceId;

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // 1. Buscar detalhes do plano pelo Price ID do Stripe
      const { data: plan } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('stripe_price_id', priceId)
        .single();

      if (plan) {
        // 2. Atualizar o perfil do usuário com os novos créditos e o novo plano
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
        
        if (updateError) throw updateError;
        console.log(`[WEBHOOK] Sucesso: Créditos liberados para o usuário ${userId}`);
      } else {
        console.error(`[WEBHOOK] Erro: Plano não encontrado para o priceId ${priceId}`);
      }
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });
  } catch (err: any) {
    console.error(`[WEBHOOK] Erro Crítico: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }
})
