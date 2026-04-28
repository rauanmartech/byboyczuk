import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Package, Calendar, ChevronRight, Clock, Truck, CheckCircle2, XCircle, ShoppingBag, CreditCard, User, MapPin } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { Link } from "react-router-dom";

interface OrderItem {
  id: string;
  quantity: number;
  price_at_time: number;
  artworks: {
    title: string;
    image_url_1: string;
  };
}

interface Order {
  id: string;
  created_at: string;
  total_amount: number;
  status: 'pendente' | 'processando' | 'enviado' | 'entregue' | 'cancelado';
  payment_method: string;
  shipping_method: string;
  shipping_address: {
    customer_name?: string;
    customer_email?: string;
    street?: string;
    number?: string;
    city?: string;
    state?: string;
  };
  order_items: OrderItem[];
}

const statusConfig = {
  pendente: { color: "text-amber-600", bg: "bg-amber-50", icon: Clock, label: "Pendente" },
  processando: { color: "text-blue-600", bg: "bg-blue-50", icon: Package, label: "Em Preparação" },
  enviado: { color: "text-purple-600", bg: "bg-purple-50", icon: Truck, label: "Enviado" },
  entregue: { color: "text-sage-deep", bg: "bg-sage-light", icon: CheckCircle2, label: "Entregue" },
  cancelado: { color: "text-red-600", bg: "bg-red-50", icon: XCircle, label: "Cancelado" },
};

const Orders = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    try {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            id,
            quantity,
            price_at_time,
            artworks (title, image_url_1)
          )
        `)
        .eq("profile_id", user?.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setOrders(data || []);
    } catch (e) {
      console.error("Erro ao carregar pedidos", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-ethereal flex flex-col">
      <Navbar />

      <main className="flex-1 pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-5xl">
          {/* Header */}
          <div className="mb-12 space-y-2">
            <h1 className="font-display text-4xl font-semibold text-foreground tracking-tight">Meus Pedidos</h1>
            <p className="text-muted-foreground italic">Acompanhe a jornada das suas novas obras.</p>
          </div>

          {loading ? (
            <div className="space-y-6">
              {[1, 2].map((i) => (
                <div key={i} className="h-48 bg-muted/40 animate-pulse rounded-3xl border border-border/50" />
              ))}
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white/40 backdrop-blur-md border border-dashed border-border/60 rounded-[2.5rem] p-16 text-center space-y-6">
              <div className="w-20 h-20 bg-muted rounded-full flex items-center justify-center mx-auto text-muted-foreground/40">
                <ShoppingBag size={40} />
              </div>
              <div className="space-y-2">
                <h2 className="font-display text-2xl font-medium">Sua coleção ainda está vazia</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Parece que você ainda não adquiriu nenhuma obra. Explore o nosso ateliê para encontrar algo especial.
                </p>
              </div>
              <Link to="/loja" className="inline-block px-8 py-3 bg-primary text-primary-foreground rounded-2xl font-medium shadow-lg hover:bg-primary/90 transition-all">
                Explorar Ateliê
              </Link>
            </div>
          ) : (
            <div className="space-y-8">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Package;
                return (
                  <motion.div
                    key={order.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="group bg-white/60 backdrop-blur-md border border-border/40 rounded-[2rem] overflow-hidden shadow-soft hover:shadow-dreamy transition-all duration-500"
                  >
                    {/* Top Bar */}
                    <div className="bg-muted/30 px-8 py-4 border-b border-border/40 flex flex-wrap justify-between items-center gap-4">
                      <div className="flex items-center gap-6">
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Pedido</p>
                          <p className="text-xs font-mono font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Data</p>
                          <div className="flex items-center gap-1.5 text-xs font-medium">
                            <Calendar size={12} className="text-primary" /> {formatDate(order.created_at)}
                          </div>
                        </div>
                      </div>
                      
                      <div className={`flex items-center gap-2 px-4 py-1.5 rounded-full ${statusConfig[order.status]?.bg || 'bg-muted'} ${statusConfig[order.status]?.color || 'text-muted-foreground'}`}>
                        <StatusIcon size={14} />
                        <span className="text-[11px] font-bold uppercase tracking-wider">{statusConfig[order.status]?.label || order.status}</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                      <div className="lg:col-span-8">
                        <div className="flex flex-wrap gap-4">
                          {order.order_items.map((item) => (
                            <div key={item.id} className="relative group/item">
                              <div className="w-20 h-20 rounded-2xl overflow-hidden border border-border bg-white shadow-sm">
                                <img 
                                  src={item.artworks?.image_url_1} 
                                  alt={item.artworks?.title} 
                                  className="w-full h-full object-cover group-hover/item:scale-110 transition-transform duration-500" 
                                />
                              </div>
                              {item.quantity > 1 && (
                                <span className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                  {item.quantity}
                                </span>
                              )}
                            </div>
                          ))}
                          {order.order_items.length > 0 && (
                            <div className="flex flex-col justify-center ml-2">
                              <p className="text-sm font-medium text-foreground">
                                {order.order_items[0].artworks?.title}
                                {order.order_items.length > 1 && ` e mais ${order.order_items.length - 1}`}
                              </p>
                              <p className="text-xs text-muted-foreground uppercase tracking-widest">
                                {order.payment_method === 'pix' ? 'Pago via Pix' : 'Cartão de Crédito'}
                              </p>
                            </div>
                          )}
                        </div>

                        {/* Dados pessoais e endereço resumidos */}
                        {(order.shipping_address?.customer_name || order.shipping_address?.street) && (
                          <div className="mt-6 pt-6 border-t border-border/60 grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {order.shipping_address?.customer_name && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
                                  <User size={10} /> Dados Pessoais
                                </p>
                                <p className="text-sm font-medium text-foreground">{order.shipping_address.customer_name}</p>
                                {order.shipping_address.customer_email && <p className="text-xs text-muted-foreground">{order.shipping_address.customer_email}</p>}
                                {order.shipping_address.customer_phone && <p className="text-xs text-muted-foreground">{order.shipping_address.customer_phone}</p>}
                              </div>
                            )}
                            {order.shipping_address?.street && (
                              <div>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-1 mb-2">
                                  <MapPin size={10} /> Entrega
                                </p>
                                <p className="text-sm font-medium text-foreground">{order.shipping_address.street}, {order.shipping_address.number}</p>
                                <p className="text-xs text-muted-foreground">{order.shipping_address.city} — {order.shipping_address.state}</p>
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Botão de ação */}
                      <div className="lg:col-span-4 flex flex-col items-end gap-3">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold mb-1">Total Pago</p>
                          <p className="font-display font-bold text-3xl text-foreground">R$ {Number(order.total_amount).toFixed(2).replace('.', ',')}</p>
                        </div>

                        {/* Botão de finalizar pagamento para pedidos pendentes */}
                        {order.status === 'pendente' && (
                          <Link
                            to={`/minha-conta/pedidos/${order.id}/pagar`}
                            className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-primary-foreground rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-primary/90 transition-all shadow-md hover:shadow-lg active:scale-95"
                          >
                            <CreditCard size={14} />
                            Finalizar Pagamento
                          </Link>
                        )}

                        {order.status !== 'pendente' && (
                          <button className="mt-4 flex items-center gap-2 text-xs font-bold text-primary uppercase tracking-widest hover:gap-3 transition-all">
                            Ver Detalhes <ChevronRight size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Orders;
