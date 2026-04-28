import React, { useState } from 'react';
import { useCheckout } from '@/context/CheckoutContext';
import { MapPin, Search, Loader2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

const StepAddress: React.FC = () => {
  const { data, updateData, nextStep, prevStep } = useCheckout();
  const [loadingCep, setLoadingCep] = useState(false);

  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    updateData({ zip: cep });

    if (cleanCep.length === 8) {
      try {
        setLoadingCep(true);
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const json = await response.json();
        
        if (json.erro) {
          toast.error("CEP não encontrado.");
          return;
        }

        updateData({
          street: json.logradouro,
          district: json.bairro,
          city: json.localidade,
          state: json.uf,
        });
        toast.success("Endereço preenchido!");
      } catch (e) {
        toast.error("Erro ao buscar CEP.");
      } finally {
        setLoadingCep(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    nextStep();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="space-y-6">
        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">CEP</label>
          <div className="relative">
            <Search size={18} className={`absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground transition-opacity ${loadingCep ? 'opacity-0' : 'opacity-50'}`} />
            {loadingCep && <Loader2 size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-primary animate-spin" />}
            <input 
              required
              className="w-full pl-12 pr-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary" 
              placeholder="00000-000"
              value={data.zip}
              onChange={e => handleCepSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Rua / Avenida</label>
          <input 
            required
            className="w-full px-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="Ex: Rua das Flores"
            value={data.street}
            onChange={e => updateData({ street: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Número</label>
            <input 
              required
              className="w-full px-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="123"
              value={data.number}
              onChange={e => updateData({ number: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Complemento</label>
            <input 
              className="w-full px-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
              placeholder="Apt, Bloco..."
              value={data.complement}
              onChange={e => updateData({ complement: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Bairro</label>
          <input 
            required
            className="w-full px-4 py-4 rounded-2xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
            placeholder="Nome do bairro"
            value={data.district}
            onChange={e => updateData({ district: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Cidade</label>
            <input 
              required
              className="w-full px-4 py-4 rounded-2xl border border-border bg-muted/30 outline-none transition-all" 
              value={data.city}
              readOnly
            />
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Estado (UF)</label>
            <input 
              required
              className="w-full px-4 py-4 rounded-2xl border border-border bg-muted/30 outline-none transition-all" 
              value={data.state}
              readOnly
            />
          </div>
        </div>
      </div>

      <div className="flex gap-4 pt-6">
        <Button type="button" variant="outline" onClick={prevStep} className="py-6 px-8 rounded-2xl border-2">
          <ArrowLeft size={20} />
        </Button>
        <Button type="submit" className="flex-1 py-6 text-lg rounded-2xl shadow-lg bg-primary hover:bg-primary/90 text-primary-foreground">
          Continuar para Entrega
        </Button>
      </div>
    </form>
  );
};

export default StepAddress;
