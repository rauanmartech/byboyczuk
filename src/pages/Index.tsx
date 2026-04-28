import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import ArtworkModal from "@/components/ArtworkModal";
import SectionTitle from "@/components/SectionTitle";
import { Artwork } from "@/data/artworks";
import { supabase } from "@/lib/supabase/client";
import heroBgImg from "@/assets/hero-bg.png";
import clubImg from "@/assets/club_preview.jpeg";
import estrelaImg from "@/assets/estrela.webp";
import mariposaImg from "@/assets/mariposa.webp";
import imagotipoImg from "@/assets/nerine_imagotipo.webp";
import florImg from "@/assets/flor.png";

import { useQuery } from "@tanstack/react-query";

const Home = () => {
  const [selected, setSelected] = useState<Artwork | null>(null);

  const { data: recentWorks = [], isLoading: loading } = useQuery({
    queryKey: ["artworks", "recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("is_portfolio", true)
        .limit(3)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({ 
        ...item, 
        image: item.image_url_1,
        available: item.status === 'disponível' && item.quantity > 0
      }));
    }
  });

  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative h-screen flex items-end justify-center overflow-hidden">
        <img
          src={heroBgImg}
          alt="Nerine - Hero Background"
          width={1920}
          height={1080}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className="relative text-center px-6 pb-20"
        >
          <Link
            to="/portfolio"
            className="inline-block px-10 py-4 bg-primary text-primary-foreground rounded-full text-sm font-medium tracking-[0.2em] uppercase hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl hover:-translate-y-1"
          >
            Explorar
          </Link>
        </motion.div>
      </section>

      {/* Recent works */}
      <section className="py-24 px-6">
        <div className="container mx-auto">
          <SectionTitle title="Obras Recentes" subtitle="Fragmentos de sentimento traduzidos em cor e forma." />
          
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {recentWorks.map((art, i) => (
                <ArtworkCard key={art.id} artwork={art} onClick={setSelected} index={i} />
              ))}
            </div>
          )}
          <div className="text-center mt-12">
            <Link
              to="/portfolio"
              className="text-sm text-primary hover:text-primary/80 tracking-wide transition-colors"
            >
              Ver todo o portfólio →
            </Link>
          </div>
        </div>
      </section>

      {/* Club preview */}
      <section className="py-24 bg-card overflow-hidden relative">
        <img 
          src={florImg} 
          alt="" 
          className="absolute -left-24 top-1/2 -translate-y-1/2 w-80 h-80 object-contain opacity-20 blur-[2px] pointer-events-none select-none z-0" 
        />
        <div className="container mx-auto px-6 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <span className="text-xs uppercase tracking-widest text-blush-deep">Assinatura mensal</span>
              <h2 className="font-display text-4xl font-semibold text-foreground mt-3 mb-6">
                Clube de Cartas Nerine
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-4">
                Todo mês, uma carta escrita à mão, um print exclusivo e pequenas delicadezas de papelaria 
                chegam até você — como uma conversa íntima entre duas pessoas que se entendem sem precisar 
                explicar demais.
              </p>
              <Link
                to="/clube"
                className="inline-block mt-4 px-8 py-3 bg-blush-deep text-primary-foreground rounded-full text-sm tracking-wide hover:bg-blush-deep/90 transition-colors"
              >
                Descobrir
              </Link>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="relative"
            >
              <motion.img
                src={mariposaImg}
                alt=""
                className="absolute -top-10 -left-10 w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-md z-10 pointer-events-none"
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [-35, -25, -35]
                }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              />
              <img
                src={clubImg}
                alt="Preview do Clube de Cartas"
                loading="lazy"
                width={1200}
                height={800}
                className="rounded-xl shadow-dreamy w-full relative z-0"
              />
              <motion.img
                src={estrelaImg}
                alt=""
                className="absolute -bottom-10 -right-10 w-24 h-24 md:w-32 md:h-32 object-contain drop-shadow-md z-10 pointer-events-none"
                animate={{ 
                  y: [0, 8, 0],
                  rotate: [20, 30, 20]
                }}
                transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
              />
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
      <ArtworkModal artwork={selected} onClose={() => setSelected(null)} />
    </div>
  );
};

export default Home;
