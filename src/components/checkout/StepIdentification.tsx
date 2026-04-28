import React from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { Mail, User, CreditCard, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';

const StepIdentification: React.FC = () => {
  const { data, updateData, nextStep } = useCheckout();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nome Completo</label>
          <div className="relative">
            <User size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
            <input 
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Como deseja ser chamado?"
              value={data.name}
              onChange={e => updateData({ name: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">E-mail</label>
          <div className="relative">
            <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
            <input 
              required
              type="email"
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="seu@email.com"
              value={data.email}
              onChange={e => updateData({ email: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Telefone</label>
            <div className="relative">
              <Phone size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="(00) 00000-0000"
                value={data.phone}
                onChange={e => updateData({ phone: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">CPF</label>
            <div className="relative">
              <CreditCard size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-50" />
              <input 
                required
                className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                placeholder="000.000.000-00"
                value={data.cpf}
                onChange={e => updateData({ cpf: e.target.value })}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-6">
        <Button type="submit" className="w-full py-6 text-lg rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          Continuar para o Endereço
        </Button>
      </div>
    </form>
  );
};

export default StepIdentification;
