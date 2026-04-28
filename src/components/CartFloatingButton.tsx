import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { useCart } from '@/context/CartContext';

const CartFloatingButton: React.FC = () => {
  const { totalItems, subtotal, setCartOpen, isCartOpen } = useCart();

  if (isCartOpen) return null;

  return (
    <AnimatePresence>
      {totalItems > 0 && (
        <motion.div
          key="desktop-cart-btn"
          initial={{ opacity: 0, y: 100, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 100, scale: 0.8 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="fixed bottom-8 right-8 z-[90] hidden md:block"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="flex items-center gap-4 bg-primary text-primary-foreground px-6 py-4 rounded-2xl shadow-dreamy hover:bg-primary/90 transition-all group"
          >
            <div className="relative">
              <ShoppingBag size={22} />
              <span className="absolute -top-2 -right-2 w-5 h-5 bg-white text-primary text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm">
                {totalItems}
              </span>
            </div>
            <div className="flex flex-col items-start leading-tight border-l border-primary-foreground/20 pl-4">
              <span className="text-[10px] uppercase tracking-widest font-bold opacity-80">Minha Coleção</span>
              <span className="text-sm font-semibold">Concluir Aquisição (R$ {subtotal})</span>
            </div>
          </button>
        </motion.div>
      )}

      {/* Versão Mobile Simplificada */}
      {totalItems > 0 && (
        <motion.div
          key="mobile-cart-btn"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
          className="fixed bottom-6 right-6 z-[90] md:hidden"
        >
          <button
            onClick={() => setCartOpen(true)}
            className="w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-dreamy flex items-center justify-center relative"
          >
            <ShoppingBag size={24} />
            <span className="absolute -top-1 -right-1 w-6 h-6 bg-white text-primary text-xs font-bold rounded-full flex items-center justify-center border-2 border-primary shadow-sm">
              {totalItems}
            </span>
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CartFloatingButton;
