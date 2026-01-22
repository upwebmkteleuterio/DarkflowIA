import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.48.1"

// Fix: Declare Deno to resolve "Cannot find name 'Deno'" errors in TypeScript
declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { pixId, userId, planId } = await req.json()
    const API_KEY = Deno.env.get('ABACATE_PAY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    // 1. Consulta segura na API da Abacate Pay
    const response = await fetch(`https://api.abacatepay.com/v1/pixQrCode/check?id=${pixId}`, {
      method: 'GET',
      headers: { 'Authorization': `Bearer ${API_KEY}` }
    });

    const result = await response.json();
    if (!response.ok) throw new Error("Erro na Abacate Pay");

    const status = result.data.status;

    // 2. Se estiver pago, ativa o plano imediatamente no banco
    if (status === 'PAID') {
      const supabaseClient = createClient(SUPABASE_URL || '', SERVICE_ROLE || '');
      const { data: plan } = await supabaseClient.from('plans').select('*').eq('id', planId).single();

      if (plan) {
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

    return new Response(JSON.stringify({ status }), {
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