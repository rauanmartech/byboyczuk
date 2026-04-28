import React from 'react';
import { motion } from 'framer-motion';
import { Check, User, MapPin, Truck, CreditCard, Eye } from 'lucide-react';
import { CheckoutStep } from '@/context/CheckoutContext';

interface StepperProps {
  currentStep: CheckoutStep;
}

const steps: { key: CheckoutStep; label: string; icon: any }[] = [
  { key: 'identification', label: 'Identificação', icon: User },
  { key: 'address', label: 'Endereço', icon: MapPin },
  { key: 'shipping', label: 'Entrega', icon: Truck },
  { key: 'review', label: 'Revisão', icon: Eye },
  { key: 'payment', label: 'Pagamento', icon: CreditCard },
];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const currentIndex = steps.findIndex(s => s.key === currentStep);

  return (
    <div className="w-full py-8 overflow-hidden">
      <div className="flex items-center justify-center md:justify-between max-w-3xl mx-auto px-4 gap-4 md:gap-0">
        {steps.map((step, index) => {
          const isCompleted = index < currentIndex;
          const isActive = index === currentIndex;
          const isFuture = index > currentIndex;
          const Icon = step.icon;

          // No mobile, escondemos etapas futuras
          const mobileHidden = isFuture ? 'hidden md:flex' : 'flex';

          return (
            <React.Fragment key={step.key}>
              {/* Step Circle */}
              <div className={`${mobileHidden} flex-col items-center relative z-10`}>
                <motion.div
                  initial={false}
                  animate={{
                    scale: isActive ? 1.1 : 1
                  }}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-colors duration-300 ${
                    isCompleted || isActive 
                      ? 'bg-primary text-primary-foreground border-primary' 
                      : 'bg-muted text-muted-foreground border-transparent'
                  } ${isActive ? 'shadow-lg shadow-primary/20' : ''}`}
                >
                  {isCompleted ? <Check size={18} /> : <Icon size={18} />}
                </motion.div>
                <span className={`absolute -bottom-7 text-[10px] uppercase tracking-widest font-bold whitespace-nowrap transition-colors duration-300 ${
                  isActive ? 'text-primary' : 'text-muted-foreground opacity-60'
                } ${!isActive ? 'hidden md:block' : 'block'}`}>
                  {step.label}
                </span>
              </div>

              {/* Progress Line */}
              {index < steps.length - 1 && (
                <div className={`${index >= currentIndex ? 'hidden md:block' : 'block'} flex-1 h-[2px] bg-muted mx-2 md:mx-4 relative -top-3 min-w-[30px] md:min-w-0`}>
                  <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: isCompleted ? 1 : 0 }}
                    className="absolute inset-0 bg-primary origin-left transition-transform duration-500"
                  />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default Stepper;
