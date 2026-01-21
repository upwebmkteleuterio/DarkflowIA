
// Função para processar o pagamento aprovado e liberar créditos
// Deploy: supabase functions deploy stripe-webhook

declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  console.log("[WEBHOOK] Notificação recebida do Stripe.");

  const signature = req.headers.get('stripe-signature');
  const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET');

  try {
    const body = await req.text();
    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    });

    const event = stripe.webhooks.constructEvent(body, signature!, webhookSecret || '');
    console.log(`[WEBHOOK] Evento verificado: ${event.type}`);

    if (event.type === 'checkout.session.completed') {
      const session: any = event.data.object;
      const userId = session.metadata.userId;
      const priceId = session.metadata.priceId;

      console.log(`[WEBHOOK] Processando Checkout Completo: User=${userId}, Price=${priceId}`);

      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: plan, error: planError } = await supabaseClient
        .from('plans')
        .select('*')
        .eq('stripe_price_id', priceId)
        .single();

      if (planError || !plan) {
        console.error(`[WEBHOOK] Plano não encontrado para o PriceID: ${priceId}`);
        throw new Error("Plano não localizado no banco.");
      }

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
      console.log(`[WEBHOOK] SUCESSO: Créditos injetados para o usuário ${userId}`);
    }

    return new Response(JSON.stringify({ received: true }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200 
    });
  } catch (err: any) {
    console.error(`[WEBHOOK] ERRO: ${err.message}`);
    return new Response(JSON.stringify({ error: err.message }), { 
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400 
    });
  }
})
