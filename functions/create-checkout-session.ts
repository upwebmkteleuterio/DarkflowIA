
// Esta função deve ser implantada no Supabase Edge Functions
// Comando: supabase functions deploy create-checkout-session

declare const Deno: any;

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log("[CHECKOUT] Iniciando nova requisição de sessão...");

  try {
    const { priceId, userId, returnUrl } = await req.json()
    console.log(`[CHECKOUT] Dados recebidos: UserID=${userId}, PriceID=${priceId}`);

    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!stripeKey || !supabaseUrl || !serviceKey) {
      console.error("[CHECKOUT] Erro: Faltam segredos (Secrets) no Supabase.");
      throw new Error("Configuração de servidor incompleta (Secrets).");
    }

    const stripe = new Stripe(stripeKey, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseClient = createClient(supabaseUrl, serviceKey)

    console.log("[CHECKOUT] Buscando perfil do usuário no banco...");
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error("[CHECKOUT] Erro ao buscar perfil:", profileError.message);
      throw profileError;
    }

    let customerId = profile?.stripe_customer_id
    console.log(`[CHECKOUT] Customer ID atual: ${customerId || 'Nenhum (será criado)'}`);

    if (!customerId) {
      console.log("[CHECKOUT] Criando novo cliente no Stripe...");
      const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(userId)
      if (userError) throw userError;

      const customer = await stripe.customers.create({
        email: userData.user?.email,
        metadata: { supabase_user_id: userId }
      })
      customerId = customer.id
      await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
      console.log(`[CHECKOUT] Novo cliente criado: ${customerId}`);
    }

    console.log("[CHECKOUT] Gerando sessão do Stripe Checkout...");
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}/#/plans?success=true`,
      cancel_url: `${returnUrl}/#/plans?canceled=true`,
      metadata: { userId, priceId } 
    })

    console.log("[CHECKOUT] Sessão criada com sucesso!");
    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    console.error("[CHECKOUT] ERRO CRÍTICO:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
