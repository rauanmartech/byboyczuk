import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowRight, ArrowLeft, CheckCircle2, Loader2, CreditCard, Sparkles, Star, Lock } from 'lucide-react';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ButterflyIcon from '@/components/ButterflyIcon';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase/client';
import { toast } from 'sonner';
import mercadoPagoImg from '@/assets/mercado-pago.png';

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
  stock: number;
  club_items: ClubItem[];
}

const STEPS = ['Identificação', 'Endereço', 'Pagamento'];

const ClubSubscribe = () => {
  const { editionId } = useParams<{ editionId: string }>();
  const navigate = useNavigate();

  const [edition, setEdition] = useState<ClubEdition | null>(null);
  const [loadingEdition, setLoadingEdition] = useState(true);
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscriberName, setSubscriberName] = useState('');

  const [formData, setFormData] = useState({
    name: '', nickname: '', email: '', found_via: '',
    zip: '', street: '', number: '', complement: '', district: '', city: '', state: ''
  });

  // Carrega a edição do banco
  useEffect(() => {
    const fetchEdition = async () => {
      // Se não veio editionId na URL, busca a edição atual
      const query = supabase
        .from('club_editions')
        .select('*, club_items(*)')
        .order('created_at', { ascending: false });

      const { data, error } = editionId
        ? await query.eq('id', editionId).single()
        : await query.eq('status', 'atual').single();

      if (error || !data) {
        toast.error('Edição não encontrada.');
        navigate('/clube');
        return;
      }
      setEdition(data);
      setLoadingEdition(false);
    };
    fetchEdition();
  }, [editionId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCEPBlur = async () => {
    const cep = formData.zip.replace(/\D/g, '');
    if (cep.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
        const data = await res.json();
        if (!data.erro) {
          setFormData(prev => ({ ...prev, street: data.logradouro, district: data.bairro, city: data.localidade, state: data.uf }));
        }
      } catch { /* silently fail */ }
    }
  };

  const handleSubmit = async () => {
    if (!edition) return;
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
      setSubscriberName(formData.nickname || formData.name.split(' ')[0]);
      setStep(3);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      console.error(err);
      toast.error('Ocorreu um erro. Tente novamente.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep1Valid = !!(formData.name && formData.email && formData.found_via);
  const isStep2Valid = !!(formData.zip && formData.street && formData.number && formData.district && formData.city && formData.state);

  const inputClass = "w-full bg-muted/30 border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-primary/50 transition-colors";
  const labelClass = "text-xs uppercase tracking-widest font-bold text-muted-foreground mb-1.5 block";

  if (loadingEdition) {
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

  if (!edition) return null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-6xl">

          {/* Breadcrumb */}
          <div className="mb-8">
            <Link to="/clube" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft size={16} /> Voltar para o Clube
            </Link>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

            {/* ── Coluna Esquerda: Info da Edição ── */}
            <aside className="lg:col-span-4">
              <div className="bg-muted/20 border border-border rounded-3xl p-8 sticky top-28 space-y-8">
                {/* Stepper */}
                <div className="flex items-center gap-2">
                  {STEPS.map((label, idx) => {
                    const n = idx + 1;
                    const isActive = step === n;
                    const isDone = step > n;
                    return (
                      <React.Fragment key={n}>
                        <div className="flex flex-col items-center gap-1">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                            isDone ? 'bg-primary text-primary-foreground' :
                            isActive ? 'bg-primary text-primary-foreground shadow-md ring-4 ring-primary/20' :
                            'bg-muted text-muted-foreground'
                          }`}>
                            {isDone ? '✓' : n}
                          </div>
                          <span className={`text-[9px] uppercase tracking-widest font-bold ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>{label}</span>
                        </div>
                        {idx < STEPS.length - 1 && (
                          <div className={`flex-1 h-px mt-[-14px] transition-all ${step > n ? 'bg-primary' : 'bg-border'}`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Info da Edição */}
                <div>
                  <div className="inline-block px-3 py-1 bg-primary/10 text-primary rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                    {edition.month} {edition.year}
                  </div>
                  <h2 className="font-display text-2xl font-semibold text-foreground mb-2">
                    Clube Nerine de {edition.month}
                  </h2>
                  <p className="text-muted-foreground text-sm leading-relaxed italic">{edition.description}</p>
                </div>

                {/* Itens */}
                <div className="space-y-3">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">O que você receberá:</h3>
                  <div className="grid gap-2">
                    {edition.club_items?.map((item, idx) => (
                      <div key={idx} className="flex items-center gap-3 bg-background p-2.5 rounded-xl border border-border">
                        <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-muted flex items-center justify-center relative">
                          {item.image_url ? (
                            <img src={item.image_url} alt="" className={`w-full h-full object-cover ${item.is_mystery ? 'blur-sm scale-110' : ''}`} />
                          ) : (
                            <Star size={14} className="text-muted-foreground/40" />
                          )}
                          {item.is_mystery && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20 backdrop-blur-[1px]">
                              <Lock size={10} className="text-white" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-sm font-medium leading-none">{item.is_mystery ? 'Item Surpresa' : item.name}</p>
                          <p className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1">{item.type}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preço */}
                <div className="pt-4 border-t border-border">
                  <div className="flex items-baseline gap-2">
                    <span className="font-display text-3xl font-bold text-foreground">R$ {edition.price}</span>
                    <span className="text-muted-foreground text-xs uppercase tracking-widest font-semibold">/ envio incluso</span>
                  </div>
                  {edition.stock > 0 && (
                    <p className="text-xs text-blush-deep font-semibold mt-1">⚡ Restam apenas {edition.stock} unidades</p>
                  )}
                </div>
              </div>
            </aside>

            {/* ── Coluna Direita: Formulário ── */}
            <div className="lg:col-span-8">
              <div className="bg-card border border-border rounded-3xl overflow-hidden">
                <AnimatePresence mode="wait">

                  {/* ETAPA 1: Identificação */}
                  {step === 1 && (
                    <motion.div
                      key="step1"
                      initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                      className="p-8 md:p-10 space-y-6"
                    >
                      <div>
                        <h1 className="font-display text-3xl font-semibold mb-2">Quem é você?</h1>
                        <p className="text-muted-foreground text-sm">Precisamos de algumas informações para te conhecer melhor.</p>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>Nome Completo *</label>
                          <input name="name" value={formData.name} onChange={handleChange} className={inputClass} placeholder="Como está no seu documento" />
                        </div>
                        <div>
                          <label className={labelClass}>Como quer ser chamado(a)?</label>
                          <input name="nickname" value={formData.nickname} onChange={handleChange} className={inputClass} placeholder="Apelido carinhoso para a cartinha" />
                        </div>
                        <div>
                          <label className={labelClass}>E-mail *</label>
                          <input type="email" name="email" value={formData.email} onChange={handleChange} className={inputClass} placeholder="Seu melhor e-mail" />
                        </div>
                        <div>
                          <label className={labelClass}>Como encontrou o Mail Club? *</label>
                          <select name="found_via" value={formData.found_via} onChange={handleChange} className={inputClass}>
                            <option value="" disabled>Selecione uma opção</option>
                            <option value="instagram">Instagram</option>
                            <option value="tiktok">TikTok</option>
                            <option value="amigo">Indicação de um amigo</option>
                            <option value="pesquisa">Pesquisa no Google</option>
                            <option value="outros">Outros</option>
                          </select>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex justify-end">
                        <Button onClick={() => { setStep(2); window.scrollTo({ top: 0, behavior: 'smooth' }); }} disabled={!isStep1Valid} className="py-6 px-10 rounded-2xl flex items-center gap-2 shadow-md">
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
                      className="p-8 md:p-10 space-y-6"
                    >
                      <div>
                        <h1 className="font-display text-3xl font-semibold mb-2">Para onde enviamos?</h1>
                        <p className="text-muted-foreground text-sm">Insira o endereço para receber sua caixinha todo mês.</p>
                      </div>

                      <div className="space-y-5">
                        <div>
                          <label className={labelClass}>CEP *</label>
                          <input name="zip" value={formData.zip} onChange={handleChange} onBlur={handleCEPBlur} maxLength={9} className={inputClass} placeholder="00000-000" />
                        </div>
                        <div className="grid grid-cols-3 gap-4">
                          <div className="col-span-2">
                            <label className={labelClass}>Rua / Avenida *</label>
                            <input name="street" value={formData.street} onChange={handleChange} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Número *</label>
                            <input name="number" value={formData.number} onChange={handleChange} className={inputClass} />
                          </div>
                        </div>
                        <div>
                          <label className={labelClass}>Complemento</label>
                          <input name="complement" value={formData.complement} onChange={handleChange} className={inputClass} placeholder="Apto, Bloco, Casa (Opcional)" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className={labelClass}>Bairro *</label>
                            <input name="district" value={formData.district} onChange={handleChange} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Cidade *</label>
                            <input name="city" value={formData.city} onChange={handleChange} className={inputClass} />
                          </div>
                          <div>
                            <label className={labelClass}>Estado *</label>
                            <input name="state" value={formData.state} onChange={handleChange} className={inputClass} />
                          </div>
                        </div>
                      </div>

                      <div className="pt-6 border-t border-border flex justify-between">
                        <Button variant="ghost" onClick={() => setStep(1)} className="text-muted-foreground">
                          <ArrowLeft size={18} className="mr-2" /> Voltar
                        </Button>
                        <Button onClick={handleSubmit} disabled={!isStep2Valid || isSubmitting} className="py-6 px-10 rounded-2xl flex items-center gap-2 shadow-md">
                          {isSubmitting ? <><Loader2 className="animate-spin" size={18} /> Salvando...</> : <>Ir para Pagamento <ArrowRight size={18} /></>}
                        </Button>
                      </div>
                    </motion.div>
                  )}

                  {/* ETAPA 3: Pagamento */}
                  {step === 3 && (
                    <motion.div
                      key="step3"
                      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }}
                      className="p-8 md:p-10 flex flex-col items-center text-center space-y-8 py-16"
                    >
                      <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                        <CheckCircle2 size={48} />
                      </div>
                      <div className="space-y-3">
                        <h1 className="font-display text-4xl font-semibold">Tudo pronto, {subscriberName}!</h1>
                        <p className="text-muted-foreground max-w-sm mx-auto leading-relaxed">
                          Seus dados foram salvos. Agora só falta efetuar o pagamento para garantir a sua caixa de <strong>{edition.month}</strong>.
                        </p>
                      </div>

                      <div className="w-full max-w-sm bg-muted/30 border border-border rounded-2xl p-6 space-y-5">
                        <div className="flex items-center justify-center gap-3 text-primary font-medium">
                          <img src={mercadoPagoImg} alt="Mercado Pago" className="w-7 h-7 object-contain" />
                          <span>Pagamento Seguro via Mercado Pago</span>
                        </div>
                        <Button
                          onClick={() => window.open('https://mpago.la/2qQYYox', '_blank')}
                          className="w-full py-6 text-lg rounded-xl bg-[#009EE3] text-white hover:bg-[#009EE3]/90 shadow-lg shadow-[#009EE3]/20 group flex items-center justify-center gap-3"
                        >
                          Efetuar Pagamento
                          <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                        </Button>

                        <div className="flex items-center gap-3">
                          <div className="flex-1 h-px bg-border" />
                          <span className="text-xs text-muted-foreground">ou</span>
                          <div className="flex-1 h-px bg-border" />
                        </div>

                        <button
                          onClick={() => {
                            const msg = encodeURIComponent(
                              `Olá! Me chamo ${subscriberName} e acabei de preencher meus dados para assinar o Clube Nerine de ${edition.month}. Seguem meu comprovante de pagamento! 🌸`
                            );
                            window.open(`https://wa.me/5511992977126?text=${msg}`, '_blank');
                          }}
                          className="w-full py-4 rounded-xl border-2 border-[#25D366] text-[#25D366] hover:bg-[#25D366]/5 font-semibold text-sm flex items-center justify-center gap-2.5 transition-all group"
                        >
                          <svg viewBox="0 0 24 24" className="w-5 h-5 fill-[#25D366] group-hover:scale-110 transition-transform" xmlns="http://www.w3.org/2000/svg">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                          </svg>
                          Enviar comprovante pelo WhatsApp
                        </button>

                        <p className="text-xs text-muted-foreground">
                          Ao clicar, você será redirecionado para o ambiente seguro do Mercado Pago.
                        </p>
                      </div>

                      <Link to="/clube" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        Voltar para a página do Clube
                      </Link>
                    </motion.div>
                  )}

                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ClubSubscribe;
