import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // 1. Lida com o CORS (Pré-vôo do navegador)
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  console.log("--- INICIANDO PROCESSAMENTO DE CHECKOUT ---");

  try {
    const { priceId, userId, returnUrl } = await req.json()
    console.log(`[CHECKOUT] Recebido: User=${userId}, PriceID=${priceId}`);

    // Access Deno through globalThis to resolve environment-specific type issues
    const STRIPE_KEY = (globalThis as any).Deno.env.get('STRIPE_SECRET_KEY');
    const SUPABASE_URL = (globalThis as any).Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = (globalThis as any).Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!STRIPE_KEY) {
      console.error("[ERROR] STRIPE_SECRET_KEY não encontrada nos Secrets!");
      throw new Error("Configuração ausente: STRIPE_SECRET_KEY");
    }

    const stripe = new Stripe(STRIPE_KEY, {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseClient = createClient(SUPABASE_URL || '', SERVICE_ROLE || '')

    // 3. Busca o perfil
    console.log("[CHECKOUT] Localizando perfil no banco de dados...");
    const { data: profile, error: profileError } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    if (profileError) {
      console.error("[ERROR] Perfil não encontrado no banco:", profileError.message);
      throw new Error(`Perfil não localizado: ${profileError.message}`);
    }

    let customerId = profile?.stripe_customer_id

    // 4. Se não tem Customer no Stripe, cria agora
    if (!customerId) {
      console.log("[CHECKOUT] Cliente não possui Stripe ID. Criando no Stripe...");
      const { data: authUser, error: authError } = await supabaseClient.auth.admin.getUserById(userId)
      
      if (authError) {
        console.error("[ERROR] Erro ao buscar dados de autenticação:", authError.message);
        throw authError;
      }

      const customer = await stripe.customers.create({
        email: authUser.user?.email || profile.email,
        metadata: { supabase_user_id: userId }
      })
      customerId = customer.id
      console.log(`[CHECKOUT] Novo cliente criado: ${customerId}. Atualizando perfil...`);
      await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    // 5. Cria a sessão de checkout
    console.log(`[CHECKOUT] Solicitando sessão ao Stripe para o PriceID: ${priceId}...`);
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}/#/plans?success=true`,
      cancel_url: `${returnUrl}/#/plans?canceled=true`,
      metadata: { userId, priceId } 
    })

    console.log("[CHECKOUT] SUCESSO: URL de checkout gerada!");

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    console.error("[ERRO CRÍTICO NO CHECKOUT]:", error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})