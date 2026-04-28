import { supabase } from "@/lib/supabase/client";

interface PaymentRequest {
  token: string;
  issuer_id: string;
  payment_method_id: string;
  installments: number;
  transaction_amount: number;
  payer_email: string;
  description: string;
  external_reference?: string;
}

export const processPayment = async (data: PaymentRequest) => {
  const { data: response, error } = await supabase.functions.invoke('process-payment', {
    body: data,
  });

  if (error) {
    console.error("Erro ao invocar Edge Function:", error);
    throw error;
  }

  return response;
};
