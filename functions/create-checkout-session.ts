
// Esta função deve ser implantada no Supabase Edge Functions
// Comando: supabase functions deploy create-checkout-session

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
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { priceId, userId, returnUrl } = await req.json()

    // 1. Criar ou buscar o cliente no Stripe
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const { data: profile } = await supabaseClient
      .from('profiles')
      .select('stripe_customer_id, email')
      .eq('id', userId)
      .single()

    let customerId = profile?.stripe_customer_id

    if (!customerId) {
      const { data: userData } = await supabaseClient.auth.admin.getUserById(userId)
      const customer = await stripe.customers.create({
        email: userData.user?.email,
        metadata: { supabase_user_id: userId }
      })
      customerId = customer.id
      await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId)
    }

    // 2. Criar a sessão de Checkout
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      success_url: `${returnUrl}/#/plans?success=true`,
      cancel_url: `${returnUrl}/#/plans?canceled=true`,
      // priceId adicionado aqui para facilitar o webhook
      metadata: { userId, priceId } 
    })

    return new Response(
      JSON.stringify({ url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  } catch (error: any) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
    )
  }
})
