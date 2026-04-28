import React from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { Truck, Zap, Box, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';

const shippingOptions = [
  { id: 'standard', name: 'Entrega Padrão', price: 25, days: '5-8 dias úteis', icon: Box },
  { id: 'express', name: 'Entrega Expressa', price: 45, days: '2-4 dias úteis', icon: Zap },
  { id: 'priority', name: 'Entrega Prioritária', price: 70, days: '1-2 dias úteis', icon: Truck },
];

const StepShipping: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useCheckout();

  const handleSelect = (id: string, price: number) => {
    updateData({ shippingMethod: id, shippingPrice: price });
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-4">
        {shippingOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = data.shippingMethod === option.id;

          return (
            <button
              key={option.id}
              onClick={() => handleSelect(option.id, option.price)}
              className={`w-full flex items-center justify-between p-6 rounded-3xl border-2 transition-all ${
                isSelected 
                  ? 'border-primary bg-primary/5 shadow-md scale-[1.02]' 
                  : 'border-border hover:border-primary/40 bg-white'
              }`}
            >
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-2xl ${isSelected ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'}`}>
                  <Icon size={24} />
                </div>
                <div className="text-left">
                  <p className="font-semibold text-foreground">{option.name}</p>
                  <p className="text-xs text-muted-foreground">{option.days}</p>
                </div>
              </div>
              <p className="font-display font-bold text-lg text-primary">R$ {option.price}</p>
            </button>
          );
        })}
      </div>

      <div className="flex flex-col-reverse sm:flex-row gap-4 pt-6">
        <Button variant="outline" onClick={prevStep} className="w-full sm:w-auto py-6 px-8 rounded-2xl border-2 flex items-center justify-center gap-2">
          <ArrowLeft size={20} />
          <span className="sm:hidden">Voltar</span>
        </Button>
        <Button 
          onClick={nextStep} 
          disabled={!data.shippingMethod}
          className="w-full sm:flex-1 py-6 text-lg rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Revisar Pedido
        </Button>
      </div>
    </div>
  );
};

export default StepShipping;
