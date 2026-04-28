import { motion } from "framer-motion";
import { Artwork } from "@/data/artworks";
import { Badge } from "@/components/ui/badge";
import { ShoppingBag, Plus, MessageCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";

interface ArtworkCardProps {
  artwork: Artwork;
  onClick: (artwork: Artwork) => void;
  index: number;
  hideCommercialInfo?: boolean;
}

const ArtworkCard = ({ artwork, onClick, index, hideCommercialInfo = false }: ArtworkCardProps) => {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation(); // Não abre o modal da arte
    addItem({
      id: artwork.id,
      title: artwork.title,
      price: artwork.price || 0,
      image_url: artwork.image
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.5 }}
      className="group cursor-pointer"
      onClick={() => onClick(artwork)}
    >
      <div className="relative overflow-hidden rounded-lg shadow-soft">
        <img
          src={artwork.image}
          alt={artwork.title}
          loading="lazy"
          className="w-full h-48 md:h-80 object-cover transition-transform duration-700 group-hover:scale-105"
        />
        {!hideCommercialInfo && (
          <>
            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500">
              <Badge variant={artwork.available ? "secondary" : "destructive"} className="backdrop-blur-sm bg-white/20 text-white border-white/20">
                {artwork.available ? "Disponível" : "Indisponível"}
              </Badge>
            </div>
            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
               {!artwork.available && (
                 <Badge variant="outline" className="bg-background/80 backdrop-blur-sm">Vendido</Badge>
               )}
            </div>
          </>
        )}
      </div>
      <div className="mt-4 space-y-1.5">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-display text-base md:text-xl font-medium text-foreground leading-tight">{artwork.title}</h3>
          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-muted text-muted-foreground whitespace-nowrap">
            {artwork.year}
          </span>
        </div>
        
        <div className="flex flex-col gap-0.5">
          <p className="text-sm text-muted-foreground/80 italic">{artwork.technique}</p>
          <p className="text-xs text-muted-foreground/60">{artwork.dimensions}</p>
        </div>

        {!hideCommercialInfo ? (
          <div className="flex items-center justify-between pt-2 border-t border-border/50 mt-3">
            <p className="text-sm md:text-lg font-bold text-foreground">
              {artwork.price ? `R$ ${artwork.price.toLocaleString("pt-BR")}` : "Sob consulta"}
            </p>
            <div className="flex items-center gap-1.5 md:gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  window.open(`https://wa.me/5511992977126?text=Olá! Gostaria de saber mais sobre a obra "${artwork.title}"`, "_blank");
                }}
                className="p-1.5 md:p-2.5 border border-[#25D366]/30 text-[#25D366] rounded-lg md:rounded-xl hover:bg-[#25D366]/5 transition-all"
                title="Dúvidas sobre a obra?"
              >
                <MessageCircle size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              </button>
              {artwork.available && artwork.price && (
                <button
                  onClick={handleAddToCart}
                  className="p-1.5 md:p-2.5 bg-primary text-primary-foreground rounded-lg md:rounded-xl hover:bg-primary/90 transition-all shadow-sm hover:shadow-md active:scale-95 group/btn"
                  title="Adicionar à coleção"
                >
                  <Plus size={18} className="w-4 h-4 md:w-[18px] md:h-[18px] group-hover/btn:rotate-90 transition-transform duration-300" />
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="pt-3 border-t border-border/50 mt-3 flex justify-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                window.open(`https://wa.me/5511992977126?text=Olá! Vi a obra "${artwork.title}" no seu portfólio e gostaria de conversar sobre ela.`, "_blank");
              }}
              className="p-1.5 md:p-2.5 border border-[#25D366]/30 text-[#25D366] rounded-lg md:rounded-xl hover:bg-[#25D366]/5 transition-all flex items-center gap-2"
              title="Interessado nesta obra?"
            >
              <MessageCircle size={18} className="w-4 h-4 md:w-[18px] md:h-[18px]" />
              <span className="text-[10px] md:text-xs font-medium">Interessado?</span>
            </button>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default ArtworkCard;
