import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, QrCode, CreditCard, ShieldCheck, Loader2, CheckCircle2, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import CreditCardForm from '@/components/checkout/CreditCardForm';
import { processPayment } from '@/lib/services/payment';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  totalAmount: number;
  payerEmail: string;
  onSuccess?: () => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  orderId,
  totalAmount,
  payerEmail,
  onSuccess
}) => {
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);

  const handleProcessPayment = async (token?: string, issuerId?: string, paymentMethodId?: string, installments?: number) => {
    try {
      setIsProcessing(true);
      setPaymentStatus('idle');

      const response = await processPayment({
        token: token || '',
        issuer_id: issuerId || '',
        payment_method_id: paymentMethodId || paymentMethod,
        installments: installments || 1,
        transaction_amount: totalAmount,
        payer_email: payerEmail,
        description: `Pedido Ateliê Nerine #${orderId.slice(0, 8).toUpperCase()}`,
        external_reference: `nerine_${orderId}`
      });

      console.log('Resposta do Pagamento:', response);

      if (paymentMethod === 'pix' || paymentMethodId === 'pix') {
        const pointOfInteraction = response?.point_of_interaction || response?.body?.point_of_interaction;
        const transactionData = pointOfInteraction?.transaction_data;

        if (transactionData) {
          setPixData({
            qrCode: transactionData.qr_code,
            qrCodeBase64: transactionData.qr_code_base64
          });

          await supabase.from('orders').update({ payment_method: 'pix' }).eq('id', orderId);
          toast.success('Pix gerado com sucesso!');
        } else {
          throw new Error('Não foi possível gerar o QR Code.');
        }
      } else {
        const status = response?.status || response?.body?.status;
        const statusDetail = response?.status_detail || response?.body?.status_detail;

        if (status === 'approved' || status === 'in_process') {
          await supabase
            .from('orders')
            .update({ status: 'processando', payment_method: 'card' })
            .eq('id', orderId);

          setPaymentStatus('success');
          toast.success('Pagamento aprovado!');
          onSuccess?.();
        } else {
          setPaymentStatus('error');
          let errorMessage = 'Pagamento recusado. Verifique os dados do cartão e tente novamente.';
          if (statusDetail === 'cc_rejected_insufficient_amount') errorMessage = 'Saldo insuficiente. Tente usar outro cartão.';
          else if (['cc_rejected_bad_filled_security_code', 'cc_rejected_bad_filled_date', 'cc_rejected_bad_filled_other'].includes(statusDetail)) errorMessage = 'Dados do cartão incorretos. Verifique o CVV, número e data de validade.';
          else if (statusDetail === 'cc_rejected_call_for_authorize') errorMessage = 'Pagamento retido pela operadora. Autorize no app do seu cartão.';
          else if (statusDetail === 'cc_rejected_high_risk') errorMessage = 'Pagamento recusado por segurança. Tente outro meio de pagamento.';

          throw new Error(errorMessage);
        }
      }
    } catch (e: any) {
      console.error(e);
      setPaymentStatus('error');
      toast.error(e.message || 'Erro ao processar o pagamento.');
      throw e;
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
      toast.success('Código Copia e Cola copiado!');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        onClick={() => { if (!isProcessing) onClose(); }}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-dreamy overflow-hidden max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="sticky top-0 bg-card/95 backdrop-blur-sm border-b border-border px-6 py-4 flex items-center justify-between z-10">
          <div>
            <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Pedido #{orderId.slice(0, 8).toUpperCase()}</p>
            <h2 className="font-display text-xl font-semibold text-foreground">Finalizar Pagamento</h2>
          </div>
          <button
            onClick={() => { if (!isProcessing) onClose(); }}
            className="w-9 h-9 flex items-center justify-center bg-muted rounded-full text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Sucesso */}
          {paymentStatus === 'success' ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8 space-y-4"
            >
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="font-display text-3xl font-semibold">Pagamento Aprovado!</h3>
              <p className="text-muted-foreground max-w-sm mx-auto">
                Sua compra foi confirmada. Em breve você receberá os detalhes por e-mail.
              </p>
              <Button onClick={onClose} className="mt-4 rounded-xl py-5 px-8">Fechar</Button>
            </motion.div>
          ) : (
            <>
              {/* Valor */}
              <div className="bg-muted/30 rounded-2xl p-4 flex items-center justify-between">
                <span className="text-sm text-muted-foreground font-medium">Total a pagar</span>
                <span className="font-display text-2xl font-bold text-foreground">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </span>
              </div>

              {/* Aviso de segurança */}
              <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                <ShieldCheck className="text-primary shrink-0 mt-0.5" size={18} />
                <p className="text-xs text-primary/80 leading-relaxed">
                  Pagamento processado em ambiente 100% seguro e criptografado via Mercado Pago.
                </p>
              </div>

              {/* Escolha do método */}
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setPaymentMethod('pix')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                    paymentMethod === 'pix' ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${paymentMethod === 'pix' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <QrCode size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-foreground">Pix</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Aprovação Imediata</p>
                  </div>
                </button>

                <button
                  onClick={() => setPaymentMethod('card')}
                  className={`p-5 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all ${
                    paymentMethod === 'card' ? 'border-primary bg-primary/5 shadow-md' : 'border-border bg-background hover:border-primary/40'
                  }`}
                >
                  <div className={`p-3 rounded-xl ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                    <CreditCard size={24} />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-sm text-foreground">Cartão de Crédito</p>
                    <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-0.5">Até 12x sem juros</p>
                  </div>
                </button>
              </div>

              {/* Área dinâmica */}
              <AnimatePresence mode="wait">
                {paymentMethod === 'card' && (
                  <motion.div
                    key="card"
                    initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden relative"
                  >
                    {isProcessing && (
                      <div className="absolute inset-0 z-50 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center rounded-2xl">
                        <Loader2 className="animate-spin text-primary mb-3" size={28} />
                        <p className="font-semibold text-primary text-sm">Processando pagamento...</p>
                      </div>
                    )}
                    <div className="pt-2">
                      <CreditCardForm amount={totalAmount} onTokenGenerated={handleCardToken} />
                    </div>
                    {paymentStatus === 'error' && (
                      <p className="text-red-500 text-sm text-center mt-3">Pagamento negado. Verifique os dados e tente novamente.</p>
                    )}
                  </motion.div>
                )}

                {paymentMethod === 'pix' && !pixData && (
                  <motion.div
                    key="pix-prompt"
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className="bg-muted/30 rounded-2xl p-6 text-center space-y-4 border border-border/60"
                  >
                    <div className="w-14 h-14 bg-white rounded-xl flex items-center justify-center mx-auto shadow-sm">
                      <QrCode className="text-primary" size={28} />
                    </div>
                    <div>
                      <p className="font-semibold">Gerar Pagamento via Pix</p>
                      <p className="text-sm text-muted-foreground mt-1">Clique para gerar o QR Code.</p>
                    </div>
                    <Button
                      onClick={() => handleProcessPayment()}
                      disabled={isProcessing}
                      className="w-full rounded-xl py-5"
                    >
                      {isProcessing ? <><Loader2 className="animate-spin mr-2" size={16} /> Gerando...</> : 'Gerar QR Code Pix'}
                    </Button>
                  </motion.div>
                )}

                {paymentMethod === 'pix' && pixData && (
                  <motion.div
                    key="pix-qr"
                    initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                    className="bg-white rounded-2xl p-6 shadow-sm text-center space-y-4 border border-primary/20"
                  >
                    <h3 className="font-display text-xl font-semibold">Escaneie o QR Code</h3>
                    <img
                      src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                      alt="QR Code Pix"
                      className="w-44 h-44 mx-auto rounded-xl shadow-sm mix-blend-multiply"
                    />
                    <div className="space-y-2">
                      <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ou Copia e Cola</p>
                      <div className="flex items-center gap-2 max-w-sm mx-auto">
                        <input
                          type="text" value={pixData.qrCode} readOnly
                          className="flex-1 bg-muted/30 border border-border rounded-xl px-3 py-2.5 text-xs text-muted-foreground truncate outline-none"
                        />
                        <Button onClick={handleCopyPix} variant="outline" size="icon" className="shrink-0 h-10 w-10 rounded-xl">
                          <Copy size={16} />
                        </Button>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default PaymentModal;
