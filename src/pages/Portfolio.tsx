import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ArtworkCard from "@/components/ArtworkCard";
import ArtworkModal from "@/components/ArtworkModal";
import SectionTitle from "@/components/SectionTitle";
import { Artwork } from "@/data/artworks";
import { supabase } from "@/lib/supabase/client";

import CoverBanner from "@/components/CoverBanner";
import { useQuery } from "@tanstack/react-query";

const Portfolio = () => {
  const [selected, setSelected] = useState<Artwork | null>(null);
  const [filter, setFilter] = useState<"all" | "original" | "print">("all");

  const { data: artworks = [], isLoading: loading } = useQuery({
    queryKey: ["artworks", "portfolio"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("is_portfolio", true)
        .order("year", { ascending: false });
      
      if (error) throw error;
      
      return (data || []).map((item: any) => ({
        ...item,
        image: item.image_url_1,
        available: item.status === 'disponível' && item.quantity > 0
      }));
    }
  });

  const filtered = filter === "all" ? artworks : artworks.filter((a) => a.category === filter);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto">
          <CoverBanner 
            titleTop="Port" 
            titleBottom="fólio" 
            subtitle="Cada obra é um convite para olhar mais devagar." 
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
                <div key={i} className="h-96 rounded-lg bg-muted animate-pulse" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <p className="text-muted-foreground">Nenhuma obra encontrada para essa categoria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filtered.map((art, i) => (
                <ArtworkCard key={art.id} artwork={art} onClick={setSelected} index={i} hideCommercialInfo={true} />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
      <ArtworkModal artwork={selected} onClose={() => setSelected(null)} hideCommercialInfo={true} />
    </div>
  );
};

export default Portfolio;
