import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { MercadoPagoConfig, Payment } from 'npm:mercadopago';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
      token, 
      issuer_id, 
      payment_method_id, 
      installments, 
      transaction_amount,
      payer_email,
      description,
      external_reference 
    } = await req.json();

    const accessToken = Deno.env.get('MERCADOPAGO_ACCESS_TOKEN');
    if (!accessToken) {
      throw new Error('MERCADOPAGO_ACCESS_TOKEN not set');
    }

    const client = new MercadoPagoConfig({ accessToken });
    const payment = new Payment(client);

    const isPix = payment_method_id === 'pix';

    const paymentData = {
      body: {
        transaction_amount: Number(transaction_amount),
        token: isPix ? undefined : token,
        description,
        installments: isPix ? undefined : Number(installments),
        payment_method_id,
        issuer_id: isPix ? undefined : issuer_id,
        payment_type_id: isPix ? 'bank_transfer' : 'credit_card',
        payer: {
          email: payer_email,
        },
        external_reference,
      },
      requestOptions: {
        idempotencyKey: crypto.randomUUID(),
      }
    };

    const result = await payment.create(paymentData);

    return new Response(
      JSON.stringify(result),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    )

  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400 
      }
    )
  }
})
