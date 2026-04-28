import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ArrowRight, ArrowLeft, CheckCircle2, Loader2, CreditCard, Sparkles, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';

interface ClubItem {
  id: string;
  name: string;
  type: string;
  image_url?: string;
  is_mystery?: boolean;
}

interface ClubEdition {
  id: string;
  month: string;
  year: number;
  theme: string;
  description: string;
  price: number;
  club_items: ClubItem[];
}

interface ClubModalProps {
  isOpen: boolean;
  onClose: () => void;
  edition: ClubEdition;
}

const ClubModal: React.FC<ClubModalProps> = ({ isOpen, onClose, edition }) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    nickname: '',
    email: '',
    found_via: '',
    zip: '',
    street: '',
    number: '',
    complement: '',
    district: '',
    city: '',
    state: ''
  });

  const handleNext = () => setStep((s) => (s + 1) as 1 | 2 | 3);
  const handlePrev = () => setStep((s) => (s - 1) as 1 | 2 | 3);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCEPBlur = async () => {
    const cep = formData.zip.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setFormData(prev => ({
            ...prev,
            street: data.logradouro,
            district: data.bairro,
            city: data.localidade,
            state: data.uf
          }));
        }
      } catch (error) {
        console.error("Erro ao buscar CEP", error);
      }
    }
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);
      
      const { error } = await supabase
        .from('club_subscriptions')
        .insert([{
          edition_id: edition.id,
          name: formData.name,
          nickname: formData.nickname,
          email: formData.email,
          found_via: formData.found_via,
          zip: formData.zip,
          street: formData.street,
          number: formData.number,
          complement: formData.complement,
          district: formData.district,
          city: formData.city,
          state: formData.state
        }]);

      if (error) throw error;
      
      // Avança para o passo 3 (Pagamento)
      handleNext();
    } catch (error) {
      console.error("Erro ao assinar:", error);
      toast.error("Ocorreu um erro ao salvar sua assinatura. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = formData.name && formData.email && formData.found_via;
  const isStep2Valid = formData.zip && formData.street && formData.number && formData.district && formData.city && formData.state;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/80 backdrop-blur-sm"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative w-full max-w-4xl bg-card border border-border rounded-3xl shadow-dreamy overflow-hidden flex flex-col md:flex-row h-[90vh] md:h-auto max-h-[800px]"
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 z-10 w-10 h-10 flex items-center justify-center bg-background/50 backdrop-blur-md rounded-full text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
        >
          <X size={20} />
        </button>

        {/* Lado Esquerdo - Info do Clube */}
        <div className="w-full md:w-5/12 bg-muted/30 border-b md:border-b-0 md:border-r border-border p-8 flex flex-col justify-between overflow-y-auto">
          <div>
            <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-4">
              Passo {step} de 3
            </div>
            <h2 className="font-display text-3xl font-semibold text-foreground mb-2">
              Clube Nerine de {edition.month}
            </h2>
            <p className="text-muted-foreground text-sm leading-relaxed mb-8 italic">
              {edition.description}
            </p>

            <div className="space-y-4">
              <h3 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">O que você receberá:</h3>
              <div className="grid gap-3">
                {edition.club_items?.map((item, idx) => (
                  <div key={idx} className="flex items-center gap-3 bg-background p-2 rounded-xl border border-border">
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center">
                      {item.image_url ? (
                        <img src={item.image_url} alt="" className={`w-full h-full object-cover ${item.is_mystery ? 'blur-sm scale-110' : ''}`} />
                      ) : (
                        <Star size={14} className="text-muted-foreground/40" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium leading-none">{item.is_mystery ? "Item Surpresa" : item.name}</p>
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{item.type}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-8 pt-6 border-t border-border">
            <div className="flex items-baseline gap-2">
              <span className="font-display text-3xl font-bold text-foreground">R$ {edition.price}</span>
              <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">/ envio incluso</span>
            </div>
          </div>
        </div>

        {/* Lado Direito - Formulário */}
        <div className="w-full md:w-7/12 bg-background p-8 overflow-y-auto relative">
          <AnimatePresence mode="wait">
            
            {/* ETAPA 1: Identificação */}
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-semibold mb-2">Quem é você?</h3>
                  <p className="text-muted-foreground text-sm">Precisamos de algumas informações para te conhecer melhor.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Nome Completo *</label>
                    <input 
                      name="name" value={formData.name} onChange={handleChange} 
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      placeholder="Como está no seu documento"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Como quer ser chamado(a)?</label>
                    <input 
                      name="nickname" value={formData.nickname} onChange={handleChange} 
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      placeholder="Apelido carinhoso para a cartinha"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">E-mail *</label>
                    <input 
                      type="email" name="email" value={formData.email} onChange={handleChange} 
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      placeholder="Seu melhor e-mail"
                    />
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Como encontrou o Mail Club? *</label>
                    <select 
                      name="found_via" value={formData.found_via} onChange={handleChange}
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 text-foreground"
                    >
                      <option value="" disabled>Selecione uma opção</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="amigo">Indicação de um amigo</option>
                      <option value="pesquisa">Pesquisa no Google</option>
                      <option value="outros">Outros</option>
                    </select>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex justify-end">
                  <Button 
                    onClick={handleNext} disabled={!isStep1Valid} 
                    className="py-6 px-8 rounded-xl bg-primary hover:bg-primary/90 flex items-center gap-2"
                  >
                    Continuar <ArrowRight size={18} />
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ETAPA 2: Endereço */}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                className="space-y-6"
              >
                <div className="mb-8">
                  <h3 className="font-display text-2xl font-semibold mb-2">Para onde enviamos?</h3>
                  <p className="text-muted-foreground text-sm">Insira o endereço para receber sua caixinha todos os meses.</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">CEP *</label>
                    <input 
                      name="zip" value={formData.zip} onChange={handleChange} onBlur={handleCEPBlur}
                      maxLength={9}
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      placeholder="00000-000"
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Rua/Avenida *</label>
                      <input 
                        name="street" value={formData.street} onChange={handleChange} 
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                    <div className="col-span-1">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Número *</label>
                      <input 
                        name="number" value={formData.number} onChange={handleChange} 
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Complemento</label>
                    <input 
                      name="complement" value={formData.complement} onChange={handleChange} 
                      className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      placeholder="Apto, Bloco, Casa (Opcional)"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="md:col-span-1">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Bairro *</label>
                      <input 
                        name="district" value={formData.district} onChange={handleChange} 
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Cidade *</label>
                      <input 
                        name="city" value={formData.city} onChange={handleChange} 
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                    <div className="md:col-span-1">
                      <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block">Estado *</label>
                      <input 
                        name="state" value={formData.state} onChange={handleChange} 
                        className="w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50" 
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-6 mt-6 border-t border-border flex justify-between">
                  <Button variant="ghost" onClick={handlePrev} className="text-muted-foreground">
                    <ArrowLeft size={18} className="mr-2" /> Voltar
                  </Button>
                  <Button 
                    onClick={handleSubmit} disabled={!isStep2Valid || isSubmitting} 
                    className="py-6 px-8 rounded-xl bg-primary hover:bg-primary/90 flex items-center gap-2 shadow-md"
                  >
                    {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Salvando...</> : <>Ir para Pagamento <ArrowRight size={18} /></>}
                  </Button>
                </div>
              </motion.div>
            )}

            {/* ETAPA 3: Pagamento (Link) */}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                className="flex flex-col items-center justify-center h-full text-center space-y-6 py-12"
              >
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-2">
                  <CheckCircle2 size={40} />
                </div>
                <div>
                  <h3 className="font-display text-3xl font-semibold mb-3">Tudo pronto, {formData.nickname || formData.name.split(' ')[0]}!</h3>
                  <p className="text-muted-foreground text-sm max-w-sm mx-auto leading-relaxed">
                    Seus dados foram salvos com sucesso. Agora só falta efetuar o pagamento para garantir a sua caixa de {edition.month}.
                  </p>
                </div>

                <div className="w-full max-w-sm bg-muted/30 border border-border rounded-2xl p-6 mt-6 space-y-6">
                  <div className="flex items-center justify-center gap-3 text-primary font-medium">
                    <CreditCard size={24} />
                    <span>Pagamento Seguro via Mercado Pago</span>
                  </div>
                  
                  <Button 
                    onClick={() => window.open("https://mpago.la/2qQYYox", "_blank")}
                    className="w-full py-6 text-lg rounded-xl bg-[#009EE3] text-white hover:bg-[#009EE3]/90 shadow-lg shadow-[#009EE3]/20 group flex items-center justify-center gap-3"
                  >
                    Efetuar Pagamento
                    <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                  </Button>
                  
                  <p className="text-xs text-muted-foreground px-4">
                    Ao clicar, você será redirecionado para o ambiente seguro do Mercado Pago para finalizar a assinatura.
                  </p>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
};

export default ClubModal;
