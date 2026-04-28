import { loadMercadoPago } from "@mercadopago/sdk-js";

let mpInstance: any = null;

export const initMercadoPago = async () => {
  if (mpInstance) return mpInstance;

  try {
    await loadMercadoPago();
    const publicKey = import.meta.env.VITE_MERCADOPAGO_PUBLIC_KEY;
    
    if (!publicKey || publicKey === 'YOUR_PUBLIC_KEY') {
      console.warn("Mercado Pago Public Key não configurada no .env.local");
      return null;
    }

    // @ts-ignore
    mpInstance = new window.MercadoPago(publicKey, {
      locale: "pt-BR",
    });
    
    return mpInstance;
  } catch (error) {
    console.error("Erro ao inicializar Mercado Pago SDK:", error);
    return null;
  }
};

export const getMercadoPago = () => mpInstance;
