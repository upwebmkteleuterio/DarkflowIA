import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

// Fix: Declare Deno to resolve "Cannot find name 'Deno'" errors in TypeScript
declare const Deno: any;

serve(async (req) => {
  try {
    const payload = await req.json();
    console.log("[WEBHOOK PIX] Notificação recebida:", payload);

    if (payload.data && payload.data.status === 'PAID') {
      const { userId, planId } = payload.data.metadata;
      
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      const { data: plan } = await supabaseClient.from('plans').select('*').eq('id', planId).single();

      if (plan) {
        console.log(`[WEBHOOK PIX] Ativando ${plan.name} para o usuário ${userId}`);
        
        await supabaseClient.from('profiles').update({
          plan_id: plan.id,
          text_credits: plan.text_credits,
          image_credits: plan.image_credits,
          subscription_status: 'active',
          role: plan.type === 'pro' ? 'pro' : (plan.type === 'adm' ? 'adm' : 'free'),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
        }).eq('id', userId);
      }
    }

    return new Response(JSON.stringify({ received: true }), { status: 200 });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), { status: 400 });
  }
})