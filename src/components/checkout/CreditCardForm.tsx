import React, { useEffect, useState } from 'react';
import { initMercadoPago } from '@/lib/mercadopago';
import { Loader2, CreditCard as CardIcon } from 'lucide-react';

interface CreditCardFormProps {
  onTokenGenerated: (token: string, issuerId: string, paymentMethodId: string, installments: number) => Promise<void>;
  amount: number;
}

const CreditCardForm: React.FC<CreditCardFormProps> = ({ onTokenGenerated, amount }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const setup = async () => {
      const mp = await initMercadoPago();
      if (!mp) {
        setError("Não foi possível carregar o Mercado Pago.");
        setLoading(false);
        return;
      }

      // Inicializar o Card Payment Brick ou campos customizados
      // Para o Checkout Transparente moderno, usamos o Payment Brick ou Card Payment Brick
      try {
        const bricksBuilder = mp.bricks();
        
        // Evita múltiplas inicializações no React StrictMode
        if ((window as any).cardPaymentBrickController) {
          (window as any).cardPaymentBrickController.unmount();
        }

        const renderCardPaymentBrick = async (bricksBuilder: any) => {
          const settings = {
            initialization: {
              amount: amount, // valor total
              payer: {
                email: "",
              },
            },
            customization: {
              visual: {
                style: {
                  theme: "flat", // 'default' | 'dark' | 'flat' | 'bootstrap'
                },
              },
              paymentMethods: {
                maxInstallments: 12,
              }
            },
            callbacks: {
              onReady: () => {
                setLoading(false);
              },
              onSubmit: async (formData: any) => {
                // O Brick espera que onSubmit retorne uma Promise. 
                // Se a Promise for rejeitada, ele destrava o botão para nova tentativa.
                console.log("Form Data from Brick:", formData);
                const { token, issuer_id, payment_method_id, installments } = formData;
                return onTokenGenerated(token, issuer_id, payment_method_id, installments);
              },
              onError: (error: any) => {
                console.error("Erro no Card Payment Brick:", error);
                setError("Ocorreu um erro ao carregar o formulário de pagamento.");
              },
            },
          };
          
          (window as any).cardPaymentBrickController = await bricksBuilder.create("cardPayment", "cardPaymentBrick_container", settings);
        };

        renderCardPaymentBrick(bricksBuilder);
      } catch (err) {
        console.error("Erro ao renderizar Bricks:", err);
        setError("Falha ao inicializar formulário.");
        setLoading(false);
      }
    };

    setup();

    return () => {
      if ((window as any).cardPaymentBrickController) {
        (window as any).cardPaymentBrickController.unmount();
        (window as any).cardPaymentBrickController = null;
      }
    };
  }, [amount]);

  return (
    <div className="space-y-4">
      {loading && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4 bg-muted/20 rounded-3xl border border-dashed border-border/60">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-sm text-muted-foreground animate-pulse">Carregando ambiente seguro...</p>
        </div>
      )}
      
      {error && (
        <div className="p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl text-sm text-center">
          {error}
        </div>
      )}

      <div className="max-w-md mx-auto">
        <div 
          id="cardPaymentBrick_container" 
          className={`transition-opacity duration-500 ${loading ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100 h-auto'}`}
        >
          {/* O Mercado Pago injeta o formulário aqui */}
        </div>
      </div>
    </div>
  );
};

export default CreditCardForm;
