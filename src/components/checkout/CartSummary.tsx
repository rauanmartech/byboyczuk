import React from 'react';
import { useCart } from '@/context/CartContext';
import { useCheckout } from '@/context/CheckoutContext';
import { ShoppingBag } from 'lucide-react';

const CartSummary: React.FC = () => {
  const { items, subtotal } = useCart();
  const { data } = useCheckout();

  return (
    <div className="bg-card border border-border/60 rounded-3xl p-8 sticky top-32 shadow-soft">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-xl text-primary">
          <ShoppingBag size={20} />
        </div>
        <h2 className="font-display text-xl font-semibold">Resumo da Aquisição</h2>
      </div>

      <div className="space-y-6 max-h-[300px] overflow-y-auto pr-2 mb-8 custom-scrollbar">
        {items.map((item) => (
          <div key={item.id} className="flex gap-4">
            <div className="w-16 h-16 rounded-xl overflow-hidden bg-muted shrink-0 border border-border/40">
              <img src={item.image_url} alt={item.title} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{item.title}</p>
              <p className="text-xs text-muted-foreground">{item.quantity}x R$ {item.price}</p>
            </div>
            <p className="text-sm font-semibold whitespace-nowrap">R$ {item.price * item.quantity}</p>
          </div>
        ))}
      </div>

      <div className="space-y-3 pt-6 border-t border-border">
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Subtotal</span>
          <span className="font-medium">R$ {subtotal}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className="text-muted-foreground">Entrega</span>
          <span className="text-primary font-medium">
            {data.shippingPrice > 0 ? `R$ ${data.shippingPrice}` : 'A calcular'}
          </span>
        </div>
        <div className="flex justify-between items-baseline pt-4 mt-2">
          <span className="font-display font-semibold text-lg">Total</span>
          <div className="text-right">
            <span className="font-display font-bold text-3xl text-foreground">R$ {subtotal + data.shippingPrice}</span>
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mt-1">Valor Final</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CartSummary;
