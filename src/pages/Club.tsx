import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, Sparkles, Clock, Lock, ArrowRight, Star, Loader2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ButterflyIcon from "@/components/ButterflyIcon";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import estrelaImg from "@/assets/estrela.webp";
import mariposaImg from "@/assets/mariposa.webp";
import mercadoPagoImg from "@/assets/mercado-pago.png";

// --- Tipos ---
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
  status: "atual" | "anterior";
  price: number;
  stock: number;
  theme: string;
  description: string;
  preview_image_url: string;
  club_items: ClubItem[];
}

// --- Componentes ---

const Club = () => {
  const [activeTab, setActiveTab] = useState<"atual" | "anteriores">("atual");

  const { data: editions = [], isLoading } = useQuery({
    queryKey: ["public_club_editions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_editions")
        .select("*, club_items(*)")
        .order("created_at", { ascending: false });
      
      if (error) throw error;
      return data as ClubEdition[];
    }
  });

  const currentEdition = editions.find(e => e.status === "atual");
  const pastEditions = editions.filter(e => e.status === "anterior" && e.stock > 0);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      {/* HEADER / HERO SIMPLIFICADO */}
      <div className="pt-32 pb-12 px-6 text-center">
        <ButterflyIcon className="w-8 h-8 text-blush-deep mx-auto mb-4" />
        <h1 className="font-display font-bold text-4xl md:text-5xl lg:text-6xl text-foreground mb-4">
          O Clube Nerine
        </h1>
        <p className="text-muted-foreground max-w-lg mx-auto italic">
          "Nem tudo precisa ser digital. Algumas coisas pedem para ser tocadas."
        </p>

        {/* TABS */}
        <div className="flex justify-center mt-10">
          <div className="bg-muted/50 p-1 rounded-full flex">
            <button 
              onClick={() => setActiveTab("atual")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'atual' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Mês Atual
            </button>
            <button 
              onClick={() => setActiveTab("anteriores")}
              className={`px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === 'anteriores' ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Edições Anteriores
            </button>
          </div>
        </div>
      </div>

      {/* CONTEÚDO DAS ABAS */}
      <div className="pb-24 px-6">
        <AnimatePresence mode="wait">
          {isLoading ? (
            <motion.div 
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center py-20"
            >
              <Loader2 className="w-10 h-10 text-primary animate-spin mb-4" />
              <p className="text-muted-foreground animate-pulse">Carregando o clube...</p>
            </motion.div>
          ) : activeTab === "atual" && currentEdition ? (
            <motion.div 
              key="atual"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="container mx-auto max-w-5xl"
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
                {/* Imagem Destaque (Esquerda) */}
                <div className="lg:col-span-7 relative">
                  <div className="relative aspect-[4/3] rounded-3xl overflow-hidden shadow-dreamy group bg-muted">
                    {currentEdition.preview_image_url ? (
                      <img src={currentEdition.preview_image_url} alt="Clube" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <ButterflyIcon className="w-20 h-20 text-muted-foreground/20" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    
                    {/* Selo Mês */}
                    <div className="absolute top-6 left-6 bg-background/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg border border-border/50">
                      <span className="text-xs font-bold uppercase tracking-widest text-primary">Clube de {currentEdition.month}</span>
                    </div>

                    {/* Upsell / Notificação interna */}
                    <div className="absolute bottom-6 left-6 right-6 flex justify-between items-end">
                      <div>
                        <p className="text-white/80 text-sm font-medium italic">Tema do mês:</p>
                        <p className="text-white font-display text-xl">{currentEdition.theme}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Decorações */}
                  <img src={estrelaImg} alt="" className="absolute -top-8 -right-8 w-24 opacity-100 z-10" />
                  <img src={mariposaImg} alt="" className="absolute -bottom-12 -left-10 w-36 opacity-100 -rotate-12 z-10" />
                </div>

                {/* Informações e CTA (Direita) */}
                <div className="lg:col-span-5 space-y-8">
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-display text-3xl font-semibold text-foreground">A Caixa de {currentEdition.month}</h2>
                    </div>
                    
                    {/* Escassez */}
                    <div className="inline-flex items-center gap-2 bg-blush-light/50 border border-blush-deep/20 text-blush-deep px-3 py-1.5 rounded-lg mb-6">
                      <Clock size={14} />
                      <span className="text-xs font-bold uppercase tracking-wider">Restam apenas {currentEdition.stock} unidades</span>
                    </div>

                    <p className="text-muted-foreground leading-relaxed mb-8">
                      {currentEdition.description || "Garanta sua assinatura deste mês e receba uma seleção exclusiva de arte em casa."}
                    </p>
                  </div>

                  {/* Lista de Itens Visuais */}
                  <div>
                    <h3 className="text-sm font-semibold uppercase tracking-widest text-muted-foreground mb-4">Neste mês você recebe:</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {currentEdition.club_items?.map((item, i) => (
                        <div key={i} className={`group relative p-3 rounded-2xl border transition-all ${item.is_mystery ? 'bg-blush-light/10 border-dashed border-blush-deep/20' : 'bg-card border-border hover:shadow-md'}`}>
                          <div className="flex gap-4 items-center">
                            {/* Mini Foto do Item */}
                            <div className="relative w-16 h-16 shrink-0 rounded-lg overflow-hidden bg-muted/30">
                              {item.image_url ? (
                                <img 
                                  src={item.image_url} 
                                  alt={item.name} 
                                  className={`w-full h-full object-cover transition-all duration-700 ${item.is_mystery ? 'blur-lg scale-125' : 'group-hover:scale-110'}`} 
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Sparkles size={16} className="text-blush-deep/20" />
                                </div>
                              )}
                              {item.is_mystery && (
                                <div className="absolute inset-0 flex items-center justify-center bg-blush-light/40 backdrop-blur-[2px]">
                                  <div className="bg-white/80 p-1.5 rounded-full shadow-sm border border-blush-light">
                                    <Lock size={14} className="text-blush-deep" />
                                  </div>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <span className="text-[10px] text-muted-foreground uppercase tracking-widest block mb-0.5">{item.type}</span>
                              <span className={`text-sm font-medium block truncate ${item.is_mystery ? 'text-foreground/60 italic' : 'text-foreground'}`}>
                                {item.is_mystery ? "Item Surpresa" : item.name}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Preço e CTA */}
                  <div className="pt-6 border-t border-border">
                    <div className="flex items-baseline gap-2 mb-6">
                      <span className="font-display text-4xl font-bold text-foreground">R$ {currentEdition.price}</span>
                      <span className="text-muted-foreground text-sm">/ envio incluso</span>
                    </div>
                    
                    <Button 
                      asChild
                      className="w-full py-6 text-lg rounded-xl bg-[#009EE3] text-white hover:bg-[#009EE3]/90 shadow-lg shadow-[#009EE3]/20 group flex items-center justify-center gap-3"
                    >
                      <Link to={`/clube/assinar/${currentEdition.id}`}>
                        <img src={mercadoPagoImg} alt="Mercado Pago" className="w-8 h-8 object-contain" />
                        Assinar o Mês
                        <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
                      </Link>
                    </Button>
                    
                    <p className="text-center text-xs text-muted-foreground mt-4">
                      Pagamento seguro via Mercado Pago (Pix, Cartão ou Boleto).
                    </p>
                  </div>
                </div>
              </div>

              {/* Botão para meses anteriores (no rodapé da aba) */}
              <div className="mt-20 pt-10 border-t border-border flex justify-center">
                <Button variant="ghost" onClick={() => setActiveTab("anteriores")} className="text-muted-foreground hover:text-foreground gap-2">
                  Ver edições passadas disponíveis <ArrowRight size={16} />
                </Button>
              </div>
            </motion.div>
          ) : activeTab === "anteriores" ? (
            <motion.div 
              key="anteriores"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="container mx-auto max-w-4xl"
            >
              <div className="text-center mb-12">
                <h2 className="font-display text-3xl font-semibold text-foreground mb-3">Edições Passadas</h2>
                <p className="text-muted-foreground">Itens de meses anteriores que ainda possuem estoque avulso.</p>
              </div>

              <div className="grid gap-8">
                {pastEditions.map(edition => (
                  <div key={edition.id} className="bg-card border border-border rounded-3xl p-6 md:p-8 flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-full md:w-1/3 aspect-square rounded-2xl overflow-hidden bg-muted">
                      {edition.preview_image_url ? (
                        <img src={edition.preview_image_url} alt={`Clube ${edition.month}`} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <ButterflyIcon className="w-12 h-12 text-muted-foreground/20" />
                        </div>
                      )}
                    </div>
                    <div className="flex-1 w-full">
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-bold uppercase tracking-widest text-primary bg-primary/10 px-3 py-1 rounded-full">
                          {edition.month} {edition.year}
                        </span>
                        <span className="text-xs text-muted-foreground font-medium flex items-center gap-1">
                          <Clock size={12} /> Restam {edition.stock}
                        </span>
                      </div>
                      <h3 className="font-display text-2xl font-semibold text-foreground mb-4">Kit {edition.month}</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-6">
                        {edition.club_items?.map((item, i) => (
                          <div key={i} className="flex items-center gap-3 text-sm text-muted-foreground bg-muted/30 p-2 rounded-xl">
                            <div className="w-8 h-8 rounded-md overflow-hidden bg-muted shrink-0">
                              {item.image_url ? (
                                <img src={item.image_url} alt="" className="w-full h-full object-cover" />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Star size={10} className="text-blush-deep/30" />
                                </div>
                              )}
                            </div>
                            <span className="truncate">{item.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex items-center justify-between pt-6 border-t border-border">
                        <span className="font-semibold text-lg">R$ {edition.price}</span>
                        <Button 
                          asChild
                          variant="outline" 
                          className="border-[#009EE3] text-[#009EE3] hover:bg-[#009EE3]/5 flex items-center gap-2 py-5"
                        >
                          <Link to={`/clube/assinar/${edition.id}`}>
                            <img src={mercadoPagoImg} alt="Mercado Pago" className="w-6 h-6 object-contain grayscale opacity-70 group-hover:grayscale-0 group-hover:opacity-100 transition-all" />
                            Comprar Edição
                          </Link>
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ) : null}
          
          {((activeTab === "atual" && !currentEdition) || (activeTab === "anteriores" && pastEditions.length === 0)) && !isLoading && (
            <div className="text-center py-20">
              <ButterflyIcon className="w-12 h-12 text-muted-foreground/20 mx-auto mb-4" />
              <p className="text-muted-foreground italic">Nenhuma edição disponível no momento.</p>
            </div>
          )}
        </AnimatePresence>
      </div>

      <Footer />
    </div>
  );
};

export default Club;
