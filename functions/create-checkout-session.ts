import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Fix: Declare Deno to resolve "Cannot find name 'Deno'" errors in TypeScript
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { priceId, userId, returnUrl } = await req.json()
    const STRIPE_KEY = Deno.env.get('STRIPE_SECRET_KEY');
    const stripe = new Stripe(STRIPE_KEY || '', {
      apiVersion: '2022-11-15',
      httpClient: Stripe.createFetchHttpClient(),
    })

    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '')
    const { data: profile } = await supabaseClient.from('profiles').select('stripe_customer_id, email').eq('id', userId).single()

    let customerId = profile?.stripe_customer_id;

    if (!customerId) {
      const { data: authUser } = await supabaseClient.auth.admin.getUserById(userId);
      const customer = await stripe.customers.create({
        email: authUser.user?.email || profile?.email,
        metadata: { supabase_user_id: userId }
      });
      customerId = customer.id;
      await supabaseClient.from('profiles').update({ stripe_customer_id: customerId }).eq('id', userId);
    }

    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      mode: 'subscription',
      subscription_data: { metadata: { userId, priceId } },
      success_url: `${returnUrl}/#/plans?success=true`,
      cancel_url: `${returnUrl}/#/plans?canceled=true`,
      metadata: { userId, priceId } 
    });

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    })

  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400
    })
  }
})