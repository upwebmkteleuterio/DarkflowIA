import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"
import Stripe from "https://esm.sh/stripe@12.0.0?target=deno"

// Fix: Declare Deno to resolve "Cannot find name 'Deno'" errors in TypeScript
declare const Deno: any;

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
    apiVersion: '2022-11-15',
    httpClient: Stripe.createFetchHttpClient(),
  });

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature!, Deno.env.get('STRIPE_WEBHOOK_SECRET') || '');
    const supabaseClient = createClient(Deno.env.get('SUPABASE_URL') || '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '');

    if (event.type === 'invoice.paid') {
      const invoice = event.data.object as any;
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const { userId, priceId } = subscription.metadata;

      const { data: plan } = await supabaseClient.from('plans').select('*').eq('stripe_price_id', priceId).single();

      if (plan && userId) {
        await supabaseClient.from('profiles').update({
          plan_id: plan.id,
          text_credits: plan.text_credits,
          image_credits: plan.image_credits,
          subscription_status: 'active',
          current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
          role: plan.type === 'pro' ? 'pro' : 'free'
        }).eq('id', userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
})