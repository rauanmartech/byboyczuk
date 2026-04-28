import React, { useEffect, useState } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { CheckCircle2, Copy, FileText, ArrowRight, QrCode } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { motion } from 'framer-motion';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const state = location.state as { paymentMethod?: string; paymentData?: any };

  useEffect(() => {
    // Se acessar a página de sucesso sem ter vindo do checkout, redireciona
    if (!state) {
      navigate('/');
    }
  }, [state, navigate]);

  if (!state) return null;

  const { paymentMethod, paymentData } = state;
  const isPix = paymentMethod === 'pix';

  // Extraindo os dados do PIX da resposta do Mercado Pago
  // O SDK Node.js pode retornar os dados diretos ou dentro de 'body'
  const pointOfInteraction = paymentData?.point_of_interaction || paymentData?.body?.point_of_interaction;
  const pixData = isPix ? pointOfInteraction?.transaction_data : null;
  const qrCodeBase64 = pixData?.qr_code_base64;
  const qrCodeString = pixData?.qr_code;

  const handleCopyPix = () => {
    if (qrCodeString) {
      navigator.clipboard.writeText(qrCodeString);
      toast.success("Código Copia e Cola copiado!");
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6 flex items-center justify-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-2xl w-full"
        >
          {isPix ? (
            // --- TELA DE SUCESSO PIX ---
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-dreamy text-center space-y-8 border border-border/60">
              <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto text-primary">
                <QrCode size={40} />
              </div>
              
              <div className="space-y-3">
                <h1 className="font-display text-3xl font-semibold text-foreground">Aguardando Pagamento</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Escaneie o QR Code ou copie o código abaixo para pagar via Pix e finalizar sua compra.
                </p>
              </div>

              {qrCodeBase64 ? (
                <div className="space-y-6 bg-muted/20 p-6 rounded-3xl border border-dashed border-border/60">
                  <img 
                    src={`data:image/jpeg;base64,${qrCodeBase64}`} 
                    alt="QR Code Pix" 
                    className="w-48 h-48 mx-auto rounded-xl shadow-sm mix-blend-multiply"
                  />
                  
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Pix Copia e Cola</p>
                    <div className="flex items-center gap-2 max-w-sm mx-auto">
                      <input 
                        type="text" 
                        value={qrCodeString} 
                        readOnly 
                        className="flex-1 bg-white border border-border rounded-xl px-4 py-3 text-xs text-muted-foreground truncate outline-none"
                      />
                      <Button onClick={handleCopyPix} variant="outline" className="shrink-0 px-4 py-6 rounded-xl">
                        <Copy size={18} />
                      </Button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 text-red-600 rounded-xl">
                  Não foi possível gerar o QR Code no momento.
                </div>
              )}

              <div className="pt-4 flex flex-col sm:flex-row justify-center gap-4">
                <Button asChild variant="outline" className="rounded-full px-8">
                  <Link to="/minha-conta/pedidos">Ver meus pedidos</Link>
                </Button>
                <Button asChild className="rounded-full px-8 bg-sage-deep hover:bg-sage-deep/90">
                  <Link to="/loja">Continuar explorando</Link>
                </Button>
              </div>
            </div>
          ) : (
            // --- TELA DE SUCESSO CARTÃO ---
            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-dreamy text-center space-y-8 border border-border/60">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto text-green-600">
                <CheckCircle2 size={40} />
              </div>
              
              <div className="space-y-3">
                <h1 className="font-display text-4xl font-semibold text-foreground">Pagamento Confirmado!</h1>
                <p className="text-muted-foreground text-lg max-w-md mx-auto">
                  Sua compra foi processada com sucesso. Em breve você receberá um e-mail com os detalhes do seu pedido.
                </p>
              </div>

              <div className="pt-8 flex justify-center gap-4 border-t border-border/60">
                <Button asChild variant="outline" className="rounded-full px-8 gap-2">
                  <Link to="/minha-conta/pedidos">
                    <FileText size={16} /> Ver Recibo
                  </Link>
                </Button>
                <Button asChild className="rounded-full px-8 gap-2 bg-sage-deep hover:bg-sage-deep/90">
                  <Link to="/loja">
                    Voltar ao Ateliê <ArrowRight size={16} />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Success;
