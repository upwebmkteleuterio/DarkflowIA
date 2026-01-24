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
    const { planId, userId, customerData } = await req.json()
    const API_KEY = Deno.env.get('ABACATE_PAY_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SERVICE_ROLE = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    const supabaseClient = createClient(SUPABASE_URL || '', SERVICE_ROLE || '')

    // 1. Busca o valor do plano no Banco
    const { data: plan } = await supabaseClient.from('plans').select('*').eq('id', planId).single()
    if (!plan) throw new Error("Plano não encontrado");

    // 2. Cria o PIX na Abacate Pay (Servidor para Servidor)
    const response = await fetch('https://api.abacatepay.com/v1/pixQrCode/create', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        amount: Math.round(plan.price * 100), // Valor em centavos
        expiresIn: 3600, 
        description: `Assinatura DarkFlow AI - ${plan.name}`,
        customer: {
          name: customerData.name,
          cellphone: customerData.cellphone,
          email: customerData.email,
          taxId: customerData.taxId.replace(/\D/g, '')
        },
        metadata: { 
          userId: userId,
          planId: planId
        }
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.error || "Erro ao gerar PIX");

    // 3. Atualiza dados do perfil (CPF/Telefone) para uso futuro
    await supabaseClient.from('profiles').update({
      cellphone: customerData.cellphone,
      tax_id: customerData.taxId
    }).eq('id', userId);

    return new Response(JSON.stringify(result), {
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