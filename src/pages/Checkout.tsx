import React, { useEffect } from 'react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import Stepper from '@/components/checkout/Stepper';
import CartSummary from '@/components/checkout/CartSummary';
import { useCheckout } from '@/context/CheckoutContext';
import { useCart } from '@/context/CartContext';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

// Importação das etapas
import StepIdentification from '@/components/checkout/StepIdentification';
import StepAddress from '@/components/checkout/StepAddress';
import StepShipping from '@/components/checkout/StepShipping';
import StepPayment from '@/components/checkout/StepPayment';
import StepReview from '@/components/checkout/StepReview';

const Checkout = () => {
  const { step, resetStep } = useCheckout();
  const { items } = useCart();

  // Sempre que o usuário acessar o checkout, recomeça do início
  // mas mantém os dados de formulário preenchidos para não irritar o cliente
  useEffect(() => {
    resetStep();
  }, []);

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <Navbar />
        <div className="pt-40 pb-24 px-6 flex flex-col items-center justify-center text-center space-y-6">
          <div className="w-24 h-24 bg-muted rounded-full flex items-center justify-center text-muted-foreground/40">
            <ShoppingBag size={48} />
          </div>
          <h1 className="font-display text-4xl font-semibold">Sua sacola está vazia</h1>
          <p className="text-muted-foreground max-w-md mx-auto">
            Para prosseguir com a aquisição, você precisa selecionar pelo menos uma obra em nosso ateliê.
          </p>
          <Link 
            to="/loja" 
            className="flex items-center gap-2 text-primary font-medium hover:gap-3 transition-all"
          >
            <ArrowLeft size={20} /> Voltar para o Ateliê
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const renderStep = () => {
    switch (step) {
      case 'identification': return <StepIdentification />;
      case 'address': return <StepAddress />;
      case 'shipping': return <StepShipping />;
      case 'payment': return <StepPayment />;
      case 'review': return <StepReview />;
      default: return <StepIdentification />;
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="container mx-auto">
          {/* Header */}
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h1 className="font-display text-4xl font-semibold mb-2">Checkout</h1>
            <p className="text-muted-foreground">Conclua sua aquisição em poucos passos.</p>
          </div>

          <Stepper currentStep={step} />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 mt-16 max-w-7xl mx-auto">
            {/* Lado Esquerdo: Formulários */}
            <div className="lg:col-span-7 xl:col-span-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.3 }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Lado Direito: Resumo */}
            <div className="lg:col-span-5 xl:col-span-4">
              <CartSummary />
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Checkout;
