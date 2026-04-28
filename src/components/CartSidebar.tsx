import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { Button } from './ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';

const CartSidebar: React.FC = () => {
  const { items, isCartOpen, setCartOpen, updateQuantity, removeItem, subtotal, totalItems } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = () => {
    setCartOpen(false);
    if (!user) {
      navigate('/login');
    } else {
      navigate('/checkout');
    }
  };

  // Impede o scroll do body quando o carrinho está aberto
  React.useEffect(() => {
    if (isCartOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isCartOpen]);

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setCartOpen(false)}
            className="fixed inset-0 bg-background/60 backdrop-blur-sm z-[100]"
          />

          {/* Sidebar */}
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 h-full w-full max-w-md bg-card border-l border-border shadow-2xl z-[101] flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="bg-primary/10 p-2 rounded-xl">
                  <ShoppingBag size={20} className="text-primary" />
                </div>
                <div>
                  <h2 className="font-display font-semibold text-xl text-foreground">Minha Coleção</h2>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-widest">{totalItems} {totalItems === 1 ? 'obra selecionada' : 'obras selecionadas'}</p>
                </div>
              </div>
              <button 
                onClick={() => setCartOpen(false)}
                className="p-2 rounded-full hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {/* Items List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {items.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-60">
                  <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center">
                    <ShoppingBag size={32} className="text-muted-foreground/50" />
                  </div>
                  <div className="space-y-1">
                    <p className="font-display text-lg font-medium">Seu carrinho está vazio</p>
                    <p className="text-sm text-muted-foreground">Que tal explorar o nosso Ateliê?</p>
                  </div>
                  <Button variant="outline" onClick={() => { setCartOpen(false); navigate('/loja'); }} className="rounded-full px-8">
                    Ver Obras
                  </Button>
                </div>
              ) : (
                items.map((item) => (
                  <div key={item.id} className="flex gap-4 group">
                    {/* Imagem */}
                    <div className="w-20 h-20 rounded-2xl overflow-hidden bg-muted border border-border shrink-0">
                      <img src={item.image_url} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    </div>
                    
                    {/* Infos */}
                    <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                      <div className="flex justify-between items-start gap-2">
                        <h3 className="font-medium text-foreground text-sm truncate">{item.title}</h3>
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="text-muted-foreground hover:text-destructive transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                      
                      <div className="flex justify-between items-end mt-2">
                        <div className="flex items-center bg-muted/50 rounded-lg border border-border p-1">
                          <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:bg-background rounded-md transition-colors">
                            <Minus size={12} />
                          </button>
                          <span className="w-8 text-center text-xs font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:bg-background rounded-md transition-colors">
                            <Plus size={12} />
                          </button>
                        </div>
                        <span className="font-semibold text-sm">R$ {item.price * item.quantity}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-border bg-muted/30 space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-medium text-foreground">R$ {subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Frete</span>
                    <span className="text-primary font-medium">Calculado no checkout</span>
                  </div>
                  <div className="flex justify-between items-baseline pt-4 border-t border-border">
                    <span className="font-display font-semibold text-lg">Total</span>
                    <span className="font-display font-bold text-2xl text-foreground">R$ {subtotal}</span>
                  </div>
                </div>

                <Button 
                  onClick={handleCheckout}
                  className="w-full py-7 text-lg rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg shadow-primary/20 group gap-3"
                >
                  {user ? "Concluir Aquisição" : "Acessar para Concluir"}
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </Button>
                
                <button 
                  onClick={() => setCartOpen(false)}
                  className="w-full text-center text-xs text-muted-foreground hover:text-foreground transition-colors py-2"
                >
                  Continuar Comprando
                </button>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export default CartSidebar;
