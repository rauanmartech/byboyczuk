import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode, CreditCard, ShieldCheck, Loader2, CheckCircle2,
  Copy, ArrowLeft, Package, User, MapPin, MessageCircle
} from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import CreditCardForm from '@/components/checkout/CreditCardForm';
import { processPayment } from '@/lib/services/payment';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'sonner';

interface OrderData {
  id: string;
  total_amount: number;
  status: string;
  shipping_method: string;
  shipping_address: {
    customer_name?: string;
    customer_email?: string;
    customer_phone?: string;
    customer_cpf?: string;
    street?: string;
    number?: string;
    complement?: string;
    district?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  order_items: {
    quantity: number;
    price_at_time: number;
    artworks: { title: string; image_url_1: string };
  }[];
}

const PayOrder = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loadingOrder, setLoadingOrder] = useState(true);
  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card' | ''>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [pixData, setPixData] = useState<{ qrCode: string; qrCodeBase64: string } | null>(null);

  useEffect(() => {
    if (!orderId) return;
    const fetchOrder = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select(`*, order_items(quantity, price_at_time, artworks(title, image_url_1))`)
        .eq('id', orderId)
        .single();

      if (error || !data) {
        toast.error('Pedido não encontrado.');
        navigate('/minha-conta/pedidos');
        return;
      }

      if (data.status !== 'pendente') {
        toast.info('Este pedido já foi pago.');
        navigate('/minha-conta/pedidos');
        return;
      }

      setOrder(data);
      setLoadingOrder(false);
    };
    fetchOrder();
  }, [orderId]);

  const handleProcessPayment = async (token?: string, issuerId?: string, paymentMethodId?: string, installments?: number) => {
    if (!order) return;
    try {
      setIsProcessing(true);
      setPaymentStatus('idle');

      const response = await processPayment({
        token: token || '',
        issuer_id: issuerId || '',
        payment_method_id: paymentMethodId || paymentMethod,
        installments: installments || 1,
        transaction_amount: order.total_amount,
        payer_email: order.shipping_address?.customer_email || user?.email || '',
        description: `Pedido Ateliê Nerine #${order.id.slice(0, 8).toUpperCase()}`,
        external_reference: `nerine_${order.id}`
      });

      if (paymentMethod === 'pix' || paymentMethodId === 'pix') {
        const pointOfInteraction = response?.point_of_interaction || response?.body?.point_of_interaction;
        const transactionData = pointOfInteraction?.transaction_data;

        if (transactionData) {
          setPixData({ qrCode: transactionData.qr_code, qrCodeBase64: transactionData.qr_code_base64 });
          await supabase.from('orders').update({ payment_method: 'pix' }).eq('id', order.id);
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
            .eq('id', order.id);

          setPaymentStatus('success');
          toast.success('Pagamento aprovado!');
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

  if (loadingOrder) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="animate-spin text-primary" size={40} />
        </div>
        <Footer />
      </div>
    );
  }

  if (!order) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Link
              to="/minha-conta/pedidos"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft size={16} /> Voltar para Meus Pedidos
            </Link>
          </div>

          {paymentStatus === 'success' ? (
            /* ─── Tela de Sucesso ─── */
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="max-w-lg mx-auto text-center py-16 space-y-6"
            >
              <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 size={48} />
              </div>
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold">Pagamento Aprovado!</h1>
                <p className="text-muted-foreground text-lg max-w-sm mx-auto">
                  Seu pedido foi confirmado. Em breve você receberá os detalhes por e-mail.
                </p>
              </div>
              <Button
                onClick={() => navigate('/minha-conta/pedidos')}
                className="py-6 px-10 rounded-2xl text-lg shadow-md mt-4"
              >
                Ver Meus Pedidos
              </Button>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

              {/* ─── Coluna Esquerda: Pagamento ─── */}
              <div className="lg:col-span-7 space-y-6">
                <div>
                  <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1">
                    Pedido #{order.id.slice(0, 8).toUpperCase()}
                  </p>
                  <h1 className="font-display text-3xl font-semibold text-foreground">Finalizar Pagamento</h1>
                </div>

                {/* Aviso de segurança */}
                <div className="bg-primary/5 border border-primary/20 rounded-2xl p-4 flex items-start gap-3">
                  <ShieldCheck className="text-primary shrink-0 mt-0.5" size={18} />
                  <p className="text-xs text-primary/80 leading-relaxed">
                    Seu pagamento é processado em um ambiente 100% seguro e criptografado via Mercado Pago.
                  </p>
                </div>

                {/* Escolha do método */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-white hover:border-primary/40'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${paymentMethod === 'pix' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <QrCode size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Pix</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Aprovação Imediata</p>
                    </div>
                  </button>

                  <button
                    onClick={() => setPaymentMethod('card')}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-4 transition-all ${
                      paymentMethod === 'card'
                        ? 'border-primary bg-primary/5 shadow-md'
                        : 'border-border bg-white hover:border-primary/40'
                    }`}
                  >
                    <div className={`p-4 rounded-2xl ${paymentMethod === 'card' ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                      <CreditCard size={32} />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-foreground">Cartão de Crédito</p>
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground mt-1">Até 12x sem juros</p>
                    </div>
                  </button>
                </div>

                {/* Área dinâmica */}
                <AnimatePresence mode="wait">
                  {paymentMethod === 'card' && (
                    <motion.div
                      key="card"
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
                        <CreditCardForm amount={order.total_amount} onTokenGenerated={handleCardToken} />
                      </div>
                      {paymentStatus === 'error' && (
                        <p className="text-red-500 text-sm text-center mt-4">Pagamento negado. Verifique os dados e tente novamente.</p>
                      )}
                    </motion.div>
                  )}

                  {paymentMethod === 'pix' && !pixData && (
                    <motion.div
                      key="pix-prompt"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="bg-muted/30 rounded-3xl p-8 text-center space-y-6 border border-border/60"
                    >
                      <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <QrCode className="text-primary" size={32} />
                      </div>
                      <div>
                        <p className="font-semibold">Gerar Pagamento via Pix</p>
                        <p className="text-sm text-muted-foreground mt-1">Clique no botão abaixo para gerar o seu QR Code.</p>
                      </div>
                      <Button
                        onClick={() => handleProcessPayment()}
                        disabled={isProcessing}
                        className="w-full sm:w-auto py-6 px-8 text-lg rounded-2xl shadow-lg"
                      >
                        {isProcessing ? <><Loader2 className="animate-spin mr-2" /> Gerando...</> : 'Gerar QR Code Pix'}
                      </Button>
                    </motion.div>
                  )}

                  {paymentMethod === 'pix' && pixData && (
                    <motion.div
                      key="pix-qr"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="bg-white rounded-3xl p-8 shadow-dreamy text-center space-y-6 border border-primary/20"
                    >
                      <h3 className="font-display text-2xl font-semibold">Escaneie o QR Code</h3>
                      <img
                        src={`data:image/jpeg;base64,${pixData.qrCodeBase64}`}
                        alt="QR Code Pix"
                        className="w-48 h-48 mx-auto rounded-xl shadow-sm mix-blend-multiply"
                      />
                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Ou Copia e Cola</p>
                        <div className="flex items-center gap-2 max-w-sm mx-auto">
                          <input
                            type="text" value={pixData.qrCode} readOnly
                            className="flex-1 bg-muted/30 border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground truncate outline-none"
                          />
                          <Button onClick={handleCopyPix} variant="outline" className="shrink-0 px-4 py-6 rounded-xl">
                            <Copy size={18} />
                          </Button>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-border">
                        <button
                          onClick={() => {
                            const msg = encodeURIComponent(
                              `Olá! Fiz o pagamento via Pix do pedido #${order.id.slice(0, 8).toUpperCase()} no Ateliê Nerine. Segue o comprovante! 🌸`
                            );
                            window.open(`https://wa.me/5511992977126?text=${msg}`, '_blank');
                          }}
                          className="w-full py-4 rounded-xl border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all group"
                        >
                          <MessageCircle size={18} className="group-hover:scale-110 transition-transform" />
                          Enviar comprovante pelo WhatsApp
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* ─── Coluna Direita: Resumo do Pedido ─── */}
              <div className="lg:col-span-5">
                <div className="bg-white/60 backdrop-blur-md border border-border/40 rounded-[2rem] overflow-hidden shadow-soft sticky top-28">
                  <div className="bg-muted/30 px-6 py-4 border-b border-border/40">
                    <h2 className="font-semibold text-foreground flex items-center gap-2">
                      <Package size={16} className="text-primary" />
                      Resumo do Pedido
                    </h2>
                  </div>

                  <div className="p-6 space-y-4">
                    {order.order_items?.map((item, idx) => (
                      <div key={idx} className="flex gap-4 items-center">
                        <div className="w-14 h-14 rounded-xl overflow-hidden border border-border bg-muted shrink-0">
                          <img
                            src={item.artworks?.image_url_1}
                            alt={item.artworks?.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{item.artworks?.title}</p>
                          <p className="text-xs text-muted-foreground">{item.quantity}x R$ {Number(item.price_at_time).toFixed(2).replace('.', ',')}</p>
                        </div>
                        <p className="text-sm font-semibold shrink-0">
                          R$ {(item.quantity * item.price_at_time).toFixed(2).replace('.', ',')}
                        </p>
                      </div>
                    ))}

                    <div className="pt-4 border-t border-border space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Subtotal</span>
                        <span>R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-border flex justify-between items-center">
                      <span className="font-bold text-foreground uppercase tracking-widest text-xs">Total</span>
                      <span className="font-display font-bold text-2xl text-foreground">
                        R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}
                      </span>
                    </div>

                    {/* Dados do Cliente */}
                    {order.shipping_address?.customer_name && (
                      <div className="pt-4 border-t border-border space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <User size={12} /> Dados Pessoais
                        </p>
                        <div className="space-y-1.5 text-sm">
                          <p className="font-medium text-foreground">{order.shipping_address.customer_name}</p>
                          {order.shipping_address.customer_email && (
                            <p className="text-muted-foreground text-xs">{order.shipping_address.customer_email}</p>
                          )}
                          {order.shipping_address.customer_phone && (
                            <p className="text-muted-foreground text-xs">{order.shipping_address.customer_phone}</p>
                          )}
                          {order.shipping_address.customer_cpf && (
                            <p className="text-muted-foreground text-xs">CPF: {order.shipping_address.customer_cpf}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Endereço de Entrega */}
                    {order.shipping_address?.street && (
                      <div className="pt-4 border-t border-border space-y-3">
                        <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
                          <MapPin size={12} /> Endereço de Entrega
                        </p>
                        <div className="space-y-0.5 text-sm">
                          <p className="font-medium text-foreground">
                            {order.shipping_address.street}, {order.shipping_address.number}
                            {order.shipping_address.complement && ` — ${order.shipping_address.complement}`}
                          </p>
                          {order.shipping_address.district && (
                            <p className="text-muted-foreground text-xs">{order.shipping_address.district}</p>
                          )}
                          <p className="text-muted-foreground text-xs">
                            {order.shipping_address.city} — {order.shipping_address.state}
                            {order.shipping_address.zip && `, ${order.shipping_address.zip}`}
                          </p>
                          {order.shipping_method && (
                            <p className="text-xs font-medium text-primary mt-1 capitalize">Envio: {order.shipping_method}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Ajuda / WhatsApp */}
                    <div className="pt-6 border-t border-border">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 text-center">Precisa de ajuda?</p>
                      <button
                        onClick={() => {
                          const msg = encodeURIComponent(
                            `Olá! Tenho uma dúvida sobre o pagamento do meu pedido #${order.id.slice(0, 8).toUpperCase()} no Ateliê Nerine.`
                          );
                          window.open(`https://wa.me/5511992977126?text=${msg}`, '_blank');
                        }}
                        className="w-full py-3 rounded-xl bg-muted/50 text-muted-foreground hover:text-foreground hover:bg-muted transition-all text-xs font-medium flex items-center justify-center gap-2"
                      >
                        <MessageCircle size={14} />
                        Falar com o suporte no WhatsApp
                      </button>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default PayOrder;
