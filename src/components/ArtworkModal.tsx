import { motion, AnimatePresence } from "framer-motion";
import { X, ExternalLink, Plus, MessageCircle, Check } from "lucide-react";
import { Artwork } from "@/data/artworks";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/context/CartContext";

interface ArtworkModalProps {
  artwork: Artwork | null;
  onClose: () => void;
  hideCommercialInfo?: boolean;
}

const ArtworkModal = ({ artwork, onClose, hideCommercialInfo = false }: ArtworkModalProps) => {
  const { addItem, items: cartItems } = useCart();
  const isInCart = artwork ? cartItems.some(item => item.id === artwork.id) : false;

  return (
  <AnimatePresence>
    {artwork && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-foreground/40 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="bg-background rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-dreamy flex flex-col md:flex-row"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative w-full md:w-1/2 h-64 md:h-auto overflow-hidden">
            <img
              src={artwork.image}
              alt={artwork.title}
              className="w-full h-full object-cover"
            />
            <button
              onClick={onClose}
              className="absolute top-4 left-4 w-10 h-10 rounded-full bg-background/80 backdrop-blur-sm flex items-center justify-center text-foreground hover:bg-background transition-colors md:hidden"
            >
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 p-8 md:p-12 space-y-8 overflow-y-auto relative">
            <button
              onClick={onClose}
              className="absolute top-8 right-8 w-10 h-10 rounded-full bg-muted/50 flex items-center justify-center text-foreground hover:bg-muted transition-colors hidden md:flex"
            >
              <X size={18} />
            </button>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                {!hideCommercialInfo && (
                  <Badge variant={artwork.available ? "secondary" : "destructive"}>
                    {artwork.available ? "Disponível" : "Obra Vendida"}
                  </Badge>
                )}
                <Badge variant="outline">{artwork.category === 'original' ? 'Obra Original' : 'Print Fine Art'}</Badge>
              </div>
              <h2 className="font-display text-4xl font-semibold text-foreground tracking-tight">{artwork.title}</h2>
              <p className="text-muted-foreground leading-relaxed text-lg italic">{artwork.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-y-6 gap-x-4 pt-4 border-t border-border">
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Técnica</span>
                <p className="text-sm font-medium text-foreground">{artwork.technique}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Dimensões</span>
                <p className="text-sm font-medium text-foreground">{artwork.dimensions}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Ano de Criação</span>
                <p className="text-sm font-medium text-foreground">{artwork.year}</p>
              </div>
            </div>

            {!hideCommercialInfo && (
              <div className="pt-8 border-t border-border space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-bold">Investimento</span>
                    <p className="font-display text-3xl font-semibold text-primary">
                      {artwork.price ? `R$ ${artwork.price.toLocaleString("pt-BR")}` : "Sob consulta"}
                    </p>
                  </div>
                  {artwork.available && artwork.price && (
                    <Button
                      size="lg"
                      disabled={isInCart}
                      className="w-full sm:w-auto gap-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-8 shadow-soft"
                      onClick={() => {
                        addItem({
                          id: artwork.id,
                          title: artwork.title,
                          price: artwork.price || 0,
                          image_url: artwork.image
                        });
                      }}
                    >
                      {isInCart ? (
                        <><Check size={18} /> No Carrinho</>
                      ) : (
                        <>{artwork.price ? "Adquirir Obra" : "Solicitar Orçamento"}</>
                      )}
                    </Button>
                  )}
                </div>
                
                <Button
                  variant="outline"
                  className="w-full border-[#25D366]/40 text-[#25D366] hover:bg-[#25D366]/10 hover:text-[#25D366] rounded-full gap-2 transition-all"
                  onClick={() => window.open(`https://wa.me/5511992977126?text=Olá! Tenho uma dúvida sobre a obra "${artwork.title}"`, "_blank")}
                >
                  <MessageCircle size={18} />
                  Dúvidas sobre a obra?
                </Button>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
  );
};

export default ArtworkModal;
