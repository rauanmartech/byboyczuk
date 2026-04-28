import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuth } from './AuthContext';

export interface CartItem {
  id: string;
  title: string;
  price: number;
  image_url: string;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, delta: number) => void;
  clearCart: () => void;
  totalItems: number;
  subtotal: number;
  isCartOpen: boolean;
  setCartOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setCartOpen] = useState(false);
  const { user } = useAuth();
  const isInitialMount = useRef(true);
  const isSyncing = useRef(false);

  // 1. Carregar carrinho inicial (Local -> DB)
  useEffect(() => {
    const loadCart = async () => {
      const savedCart = localStorage.getItem('nerine-cart');
      let localItems: CartItem[] = [];
      
      if (savedCart) {
        try {
          localItems = JSON.parse(savedCart);
        } catch (e) {
          console.error("Erro ao carregar carrinho local", e);
        }
      }

      if (user) {
        // Buscar do banco
        const { data: dbItems, error } = await supabase
          .from('cart_items')
          .select('id, quantity, artwork_id, artworks(title, price, image_url_1)')
          .eq('profile_id', user.id);

        if (!error && dbItems) {
          const formattedDbItems: CartItem[] = dbItems.map((item: any) => ({
            id: item.artwork_id,
            title: item.artworks.title,
            price: item.artworks.price,
            image_url: item.artworks.image_url_1,
            quantity: item.quantity
          }));

          // Mesclar: Itens do banco ganham preferência, mas adiciona o que estiver só no local
          const merged = [...formattedDbItems];
          localItems.forEach(local => {
            if (!merged.find(m => m.id === local.id)) {
              merged.push(local);
              // Salvar este item novo no banco
              supabase.from('cart_items').insert([{
                profile_id: user.id,
                artwork_id: local.id,
                quantity: local.quantity
              }]).then();
            }
          });
          
          setItems(merged);
        } else {
          setItems(localItems);
        }
      } else {
        setItems(localItems);
      }
      isInitialMount.current = false;
    };

    loadCart();
  }, [user]);

  // 2. Persistir mudanças no LocalStorage
  useEffect(() => {
    if (!isInitialMount.current) {
      localStorage.setItem('nerine-cart', JSON.stringify(items));
    }
  }, [items]);

  const addItem = async (newItem: Omit<CartItem, 'quantity'>) => {
    const existing = items.find(item => item.id === newItem.id);
    
    if (user) {
      if (existing) {
        await supabase
          .from('cart_items')
          .update({ quantity: existing.quantity + 1 })
          .eq('profile_id', user.id)
          .eq('artwork_id', newItem.id);
      } else {
        await supabase
          .from('cart_items')
          .insert([{
            profile_id: user.id,
            artwork_id: newItem.id,
            quantity: 1
          }]);
      }
    }

    setItems(prev => {
      if (existing) {
        return prev.map(item => 
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...newItem, quantity: 1 }];
    });
  };

  const removeItem = async (id: string) => {
    if (user) {
      await supabase
        .from('cart_items')
        .delete()
        .eq('profile_id', user.id)
        .eq('artwork_id', id);
    }
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateQuantity = async (id: string, delta: number) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    const newQty = Math.max(0, item.quantity + delta);

    if (user) {
      if (newQty === 0) {
        await supabase.from('cart_items').delete().eq('profile_id', user.id).eq('artwork_id', id);
      } else {
        await supabase.from('cart_items').update({ quantity: newQty }).eq('profile_id', user.id).eq('artwork_id', id);
      }
    }

    setItems(prev => prev.map(i => {
      if (i.id === id) return { ...i, quantity: newQty };
      return i;
    }).filter(i => i.quantity > 0));
  };

  const clearCart = async () => {
    if (user) {
      await supabase.from('cart_items').delete().eq('profile_id', user.id);
    }
    setItems([]);
  };

  const totalItems = items.reduce((acc, item) => acc + item.quantity, 0);
  const subtotal = items.reduce((acc, item) => acc + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider value={{ 
      items, addItem, removeItem, updateQuantity, clearCart, 
      totalItems, subtotal, isCartOpen, setCartOpen 
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart must be used within a CartProvider');
  return context;
};
