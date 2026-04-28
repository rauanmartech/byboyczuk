import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

export type CheckoutStep = 'identification' | 'address' | 'shipping' | 'review' | 'payment';

interface CheckoutData {
  // Identificação
  name: string;
  email: string;
  phone: string;
  cpf: string;
  
  // Endereço
  zip: string;
  street: string;
  number: string;
  complement: string;
  district: string;
  city: string;
  state: string;
  
  // Entrega
  shippingMethod: string;
  shippingPrice: number;
  
  // Pagamento
  paymentMethod: 'pix' | 'card' | '';
  orderId?: string;
}

interface CheckoutContextType {
  step: CheckoutStep;
  data: CheckoutData;
  setStep: (step: CheckoutStep) => void;
  updateData: (newData: Partial<CheckoutData>) => void;
  nextStep: () => void;
  prevStep: () => void;
  resetStep: () => void;
  canGoNext: boolean;
}

const initialData: CheckoutData = {
  name: '', email: '', phone: '', cpf: '',
  zip: '', street: '', number: '', complement: '', district: '', city: '', state: '',
  shippingMethod: '', shippingPrice: 0,
  paymentMethod: ''
};

const CheckoutContext = createContext<CheckoutContextType | undefined>(undefined);

export const CheckoutProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [step, setStep] = useState<CheckoutStep>('identification');
  const [data, setData] = useState<CheckoutData>(initialData);
  const { user } = useAuth();

  // Persistência: Carregar do LocalStorage
  useEffect(() => {
    const saved = localStorage.getItem('nerine-checkout-progress');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setData(parsed.data);
        setStep(parsed.step);
      } catch (e) {
        console.error("Erro ao recuperar checkout", e);
      }
    }
  }, []);

  // Persistência: Salvar no LocalStorage
  useEffect(() => {
    localStorage.setItem('nerine-checkout-progress', JSON.stringify({ step, data }));
  }, [step, data]);

  // Sincronizar dados do perfil logado (se houver)
  useEffect(() => {
    if (user && step === 'identification' && !data.name) {
      // Aqui poderíamos buscar do Supabase profiles, mas por enquanto usamos o metadata
      setData(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || '',
        email: user.email || ''
      }));
    }
  }, [user]);

  const updateData = (newData: Partial<CheckoutData>) => {
    setData(prev => ({ ...prev, ...newData }));
  };

  const stepsOrder: CheckoutStep[] = ['identification', 'address', 'shipping', 'review', 'payment'];
  
  const nextStep = () => {
    const currentIndex = stepsOrder.indexOf(step);
    if (currentIndex < stepsOrder.length - 1) {
      setStep(stepsOrder[currentIndex + 1]);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    const currentIndex = stepsOrder.indexOf(step);
    if (currentIndex > 0) {
      setStep(stepsOrder[currentIndex - 1]);
      window.scrollTo(0, 0);
    }
  };

  const resetStep = () => {
    setStep('identification');
    window.scrollTo(0, 0);
  };

  return (
    <CheckoutContext.Provider value={{ 
      step, data, setStep, updateData, nextStep, prevStep, resetStep,
      canGoNext: true
    }}>
      {children}
    </CheckoutContext.Provider>
  );
};

export const useCheckout = () => {
  const context = useContext(CheckoutContext);
  if (!context) throw new Error('useCheckout must be used within a CheckoutProvider');
  return context;
};
