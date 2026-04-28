import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Artwork } from "@/data/artworks";
import { Button } from "@/components/ui/button";
import { ShoppingBag, Plus, Check } from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import { useCart } from "@/context/CartContext";

import CoverBanner from "@/components/CoverBanner";
import { useQuery } from "@tanstack/react-query";

const Shop = () => {
  const { addItem, items: cartItems } = useCart();
  const [filter, setFilter] = useState<"all" | "original" | "print">("all");

  const { data: artworks = [], isLoading: loading } = useQuery({
    queryKey: ["artworks", "shop"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("is_shop", true)
        .eq("status", "disponível")
        .gt("quantity", 0)
        .order("created_at", { ascending: false });

      if (error) throw error;

      return (data || []).map((item: any) => ({
        ...item,
        image: item.image_url_1,
        available: true
      }));
    }
  });

  const isInCart = (id: string) => cartItems.some(item => item.id === id);

  const filtered = filter === "all" ? artworks : artworks.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto">
          <CoverBanner 
            titleTop="Ate" 
            titleBottom="liê" 
            subtitle="Leve um pedaço desse universo para o seu." 
            singleLine={true}
          />

          <div className="flex justify-center gap-4 mb-12">
            {[
              { key: "all" as const, label: "Todas" },
              { key: "original" as const, label: "Originais" },
              { key: "print" as const, label: "Prints" },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-6 py-2 rounded-full text-sm transition-colors ${
                  filter === f.key
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-muted/80"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-96 rounded-xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhuma obra disponível para venda na categoria selecionada.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((art, i) => (
              <motion.div
                key={art.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bg-card rounded-xl overflow-hidden shadow-soft"
              >
                <img
                  src={art.image}
                  alt={art.title}
                  loading="lazy"
                  className="w-full h-72 object-cover"
                />
                <div className="p-6 space-y-3">
                  <h3 className="font-display text-xl font-medium text-foreground">{art.title}</h3>
                  <p className="text-sm text-muted-foreground">{art.technique}</p>
                  <p className="text-sm text-muted-foreground">{art.dimensions}</p>
                  <div className="flex items-center justify-between pt-3 border-t border-border">
                    <span className="font-display text-xl font-semibold text-primary">
                      {art.price ? `R$ ${art.price.toLocaleString("pt-BR")}` : "Sob consulta"}
                    </span>
                    <Button
                      size="sm"
                      variant={isInCart(art.id) ? "default" : "outline"}
                      onClick={() => {
                        if (isInCart(art.id)) return;
                        addItem({
                          id: art.id,
                          title: art.title,
                          price: art.price || 0,
                          image_url: art.image
                        });
                      }}
                      className="gap-2 rounded-xl"
                    >
                      {isInCart(art.id) ? (
                        <><Check size={14} /> No Carrinho</>
                      ) : (
                        <><Plus size={14} /> Adicionar</>
                      )}
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Shop;
