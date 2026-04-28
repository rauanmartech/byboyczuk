import React, { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { QrCode, CreditCard, ArrowLeft, ShieldCheck, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreditCardForm from './CreditCardForm';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { processPayment } from '@/lib/services/payment';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

const StepPayment: React.FC = () => {
  const { data, updateData, prevStep } = useCheckout();
  const { subtotal, clearCart } = useCart();
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);

  const totalAmount = subtotal + data.shippingPrice;

  const handleProcessPayment = async (token?: string, issuerId?: string, paymentMethodId?: string, installments?: number) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('idle');

      const response = await processPayment({
        token: token || '',
        issuer_id: issuerId || '',
        payment_method_id: paymentMethodId || data.paymentMethod,
        installments: installments || 1,
        transaction_amount: totalAmount,
        payer_email: data.email,
        description: `Pedido na Ateliê Nerine - ${data.name}`,
        external_reference: `nerine_${Date.now()}`
      });

      console.log("Resposta do Pagamento:", response);

      if (data.paymentMethod === 'pix' || paymentMethodId === 'pix') {
        // Extraindo Pix
        const pointOfInteraction = response?.point_of_interaction || response?.body?.point_of_interaction;
        const transactionData = pointOfInteraction?.transaction_data;
        if (transactionData) {
          setPixData({
            qrCode: transactionData.qr_code,
            qrCodeBase64: transactionData.qr_code_base64
          });

          // Atualiza método de pagamento do pedido
          if (data.orderId) {
            await supabase
              .from('orders')
              .update({ payment_method: 'pix' })
              .eq('id', data.orderId);
          }

          toast.success("Pix gerado com sucesso!");
        } else {
          throw new Error("Não foi possível gerar o QR Code.");
        }
      } else {
        // Verifica o status real do pagamento retornado pelo Mercado Pago
        const status = response?.status || response?.body?.status;
        const statusDetail = response?.status_detail || response?.body?.status_detail;

        if (status === 'approved' || status === 'in_process') {
          // Atualiza status do pedido no banco
          if (data.orderId) {
            await supabase
              .from('orders')
              .update({ status: 'processando', payment_method: 'card' })
              .eq('id', data.orderId);
          }

          setPaymentStatus('success');
          toast.success("Pagamento aprovado!");
          
          // Limpa carrinho apenas em caso de sucesso
          localStorage.removeItem('nerine-cart');
          clearCart();
        } else {
          // Ex: rejected, cancelled, etc
          setPaymentStatus('error');
          let errorMessage = "Pagamento recusado. Verifique os dados do cartão e tente novamente.";
          
          // Mapeamento de erros comuns do Mercado Pago
          if (statusDetail === 'cc_rejected_insufficient_amount') {
            errorMessage = "Saldo insuficiente. Tente usar outro cartão.";
          } else if (statusDetail === 'cc_rejected_bad_filled_security_code' || statusDetail === 'cc_rejected_bad_filled_date' || statusDetail === 'cc_rejected_bad_filled_other') {
            errorMessage = "Dados do cartão incorretos. Verifique o CVV, número e a data de validade.";
          } else if (statusDetail === 'cc_rejected_call_for_authorize') {
            errorMessage = "Pagamento retido pela operadora. Autorize a transação no app do seu cartão.";
          } else if (statusDetail === 'cc_rejected_high_risk') {
            errorMessage = "Pagamento recusado por segurança. Tente outro meio de pagamento.";
          }

          throw new Error(errorMessage);
        }
      }

    } catch (e: any) {
      console.error(e);
      setPaymentStatus('error');
      toast.error(e.message || "Erro ao processar o pagamento.");
      throw e; // Lança o erro novamente para que a Promise seja rejeitada e o botão do Mercado Pago seja destravado
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCardToken = async (token: string, issuerId: string, paymentMethodId: string, installments: number) => {
    return handleProcessPayment(token, issuerId, paymentMethodId, installments);
  };

  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      toast.success("Código Copia e Cola copiado!");
    }
  };

  if (paymentStatus === 'success') {
    return (
      <div className="bg-white rounded-3xl p-8 md:p-12 shadow-dreamy text-center space-y-8 border border-border/60 animate-in zoom-in duration-500">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
          <CheckCircle2 size={40} />
        </div>
        <div className="space-y-3">
          <h2 className="font-display text-4xl font-semibold text-foreground">Pagamento Aprovado!</h2>
          <p className="text-muted-foreground text-lg max-w-md mx-auto">
            Sua compra foi processada com sucesso. Em breve você receberá um e-mail com os detalhes do seu pedido.
          </p>
        </div>
      </div>
    );
  }



  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
        <ShieldCheck className="text-primary shrink-0" size={20} />
        <p className="text-xs text-primary/80 leading-relaxed">
          Seu pagamento é processado em um ambiente 100% seguro e criptografado via Mercado Pago.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => updateData({ paymentMethod: 'pix' })}
          className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${
            data.paymentMethod === 'pix' ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-primary/40'
          }`}
        >
          <div className={`p-4 rounded-2xl ${data.paymentMethod === 'pix' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <QrCode size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Pix</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Aprovação Imediata</p>
          </div>
        </button>

        <button
          onClick={() => updateData({ paymentMethod: 'card' })}
          className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${
            data.paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-white hover:border-primary/40'
          }`}
        >
          <div className={`p-4 rounded-2xl ${data.paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
            <CreditCard size={32} />
          </div>
          <div className="text-center">
            <p className="font-semibold text-foreground">Cartão de Crédito</p>
            <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Até 12x sem juros</p>
          </div>
        </button>
      </div>

      {/* Área Dinâmica do Método de Pagamento */}
      <AnimatePresence mode="wait">
        {data.paymentMethod === 'card' && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden relative"
          >
            {isProcessing && (
              <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-3xl">
                <Loader2 className="animate-spin text-primary mb-4" size={32} />
                <p className="font-semibold text-primary">Processando pagamento...</p>
              </div>
            )}
            <div className="pt-4">
              <CreditCardForm 
                amount={totalAmount} 
                onTokenGenerated={handleCardToken} 
              />
            </div>
            {paymentStatus === 'error' && (
              <p className="text-red-500 text-sm text-center mt-4">Pagamento negado. Verifique os dados e tente novamente.</p>
            )}
          </motion.div>
        )}

        {data.paymentMethod === 'pix' && !pixData && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-muted/30 rounded-3xl p-8 text-center space-y-6 border border-border/60"
          >
            <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
              <QrCode className="text-primary" size={32} />
            </div>
            <div className="space-y-1">
              <p className="font-semibold">Gerar Pagamento via Pix</p>
              <p className="text-sm text-muted-foreground">Clique no botão abaixo para gerar o seu QR Code.</p>
            </div>
            
            <Button 
              onClick={() => handleProcessPayment()} 
              disabled={isProcessing}
              className="w-full sm:w-auto py-6 px-8 text-lg rounded-2xl shadow-lg mx-auto"
            >
              {isProcessing ? <><Loader2 className="animate-spin mr-2" /> Gerando...</> : "Gerar QR Code Pix"}
            </Button>
          </motion.div>
        )}

        {data.paymentMethod === 'pix' && pixData && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-3xl p-8 shadow-dreamy text-center space-y-6 border border-primary/20"
          >
            <h3 className="font-display text-2xl font-semibold text-foreground">Escaneie o QR Code</h3>
            
            <img 
              src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`} 
              alt="QR Code Pix" 
              className="w-48 h-48 mx-auto rounded-xl shadow-sm mix-blend-multiply"
            />
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ou Copia e Cola</p>
              <div className="flex items-center gap-2 max-w-sm mx-auto">
                <input 
                  type="text" 
                  value={pixData.qrCode} 
                  readOnly 
                  className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground truncate outline-none"
                />
                <Button onClick={handleCopyPix} variant="outline" className="shrink-0 px-4 py-6 rounded-xl">
                  <Copy size={18} />
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex gap-4 pt-6">
        <Button variant="outline" onClick={prevStep} disabled={isProcessing || paymentStatus === 'success'} className="py-6 px-8 rounded-2xl border-2">
          <ArrowLeft size={20} /> Voltar para Revisão
        </Button>
      </div>
    </div>
  );
};

export default StepPayment;
