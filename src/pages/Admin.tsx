import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Images, LogOut, Menu, X, Upload, Trash2, Edit3, Plus, Check, AlertCircle, Mail, MessageCircle, Package, ShoppingBag, Clock, Truck, CheckCircle2, XCircle, Search, Users
} from "lucide-react";
import { supabase } from "@/lib/supabase/client";
import imagotipo from "@/assets/nerine_imagotipo.webp";
import logoclube from "@/assets/nerine_clube.webp";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import imageCompression from "browser-image-compression";

/* ─── tipos ─────────────────────────────────────── */
interface ArtworkRow {
  id: string;
  title: string;
  description: string;
  image_url_1: string;
  image_url_2: string;
  image_url_3: string;
  price: number | null;
  quantity: number;
  status: string;
  dimensions: string;
  technique: string;
  year: number;
  category: "original" | "print";
  is_portfolio: boolean;
  is_shop: boolean;
}

const EMPTY_ARTWORK: Omit<ArtworkRow, "id"> = {
  title: "",
  description: "",
  image_url_1: "",
  image_url_2: "",
  image_url_3: "",
  price: null,
  quantity: 1,
  status: "disponível",
  dimensions: "",
  technique: "",
  year: new Date().getFullYear(),
  category: "original",
  is_portfolio: true,
  is_shop: false,
};

/* ─── seções da sidebar ──────────────────────────── */
const sections = [
  { id: "pedidos", label: "Pedidos", icon: ShoppingBag },
  { id: "artes", label: "Artes", icon: Images },
  { id: "mensagens", label: "Mensagens", icon: Mail },
  { id: "clube", label: "Clube", icon: Package },
];

/* ═══════════════════════════════════════════════════
   ADMIN PAGE
═══════════════════════════════════════════════════ */
const AdminPage = () => {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("pedidos");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  /* Verificar autenticação e role */
  useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { navigate("/login"); return; }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      const isAdminEmail = user.email === 'boyczukrafaela@gmail.com';

      if (profile?.role !== "admin" && !isAdminEmail) { navigate("/"); return; }
      setLoading(false);
    };
    checkAdmin();
  }, [navigate]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-ethereal flex items-center justify-center">
        <p className="text-muted-foreground font-display text-lg animate-pulse">Verificando acesso...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">

      {/* ── Sidebar ─────────────────────────────── */}
      <>
        {/* Overlay mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-foreground/20 backdrop-blur-sm z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        <aside
          className={`
            fixed top-0 left-0 h-full w-64 bg-card border-r border-border z-40
            flex flex-col transition-transform duration-300
            ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
            md:translate-x-0 md:sticky md:top-0 md:h-screen md:flex
          `}
        >
          {/* Logo Section */}
          <div className="px-6 py-6 border-b border-border flex items-center justify-between">
            <div className="flex items-center gap-1">
              <img src={imagotipo} alt="Nerine" className="h-7 w-auto object-contain" />
              <img src={logoclube} alt="Clube" className="h-7 w-auto object-contain" />
            </div>
            <button className="md:hidden text-muted-foreground" onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          {/* Label painel */}
          <div className="px-6 pt-6 pb-2">
            <span className="text-[10px] uppercase tracking-widest text-muted-foreground/60">Painel Admin</span>
          </div>

          {/* Nav items */}
          <nav className="px-3 py-2 space-y-1">
            {sections.map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => { setActiveSection(id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm tracking-wide transition-all
                  ${activeSection === id
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"}
                `}
              >
                <Icon size={17} />
                {label}
              </button>
            ))}
          </nav>

          {/* Logout - Pushed to bottom */}
          <div className="mt-auto px-3 py-6 border-t border-border bg-card">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all"
            >
              <LogOut size={17} />
              Sair
            </button>
          </div>
        </aside>
      </>

      {/* ── Main content ─────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-20 bg-background/80 backdrop-blur-md border-b border-border px-6 py-4 flex items-center gap-4">
          <button
            className="md:hidden text-muted-foreground"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu size={22} />
          </button>
          <h1 className="font-display text-xl font-semibold text-foreground">
            {sections.find(s => s.id === activeSection)?.label}
          </h1>
        </header>

        {/* Seção ativa */}
        <main className="flex-1 p-6 md:p-10">
          <AnimatePresence mode="wait">
            {activeSection === "pedidos" && (
              <motion.div
                key="pedidos"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <OrdersAdminManager />
              </motion.div>
            )}
            {activeSection === "artes" && (
              <motion.div
                key="artes"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <ArtworkManager />
              </motion.div>
            )}
            {activeSection === "mensagens" && (
              <motion.div
                key="mensagens"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <MessagesManager />
              </motion.div>
            )}
            {activeSection === "clube" && (
              <motion.div
                key="clube"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -16 }}
                transition={{ duration: 0.3 }}
              >
                <ClubManager />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   MESSAGES MANAGER (MENSAGENS)
═══════════════════════════════════════════════════ */
const MessagesManager = () => {
  const queryClient = useQueryClient();

  const { data: messages = [], isLoading: loading } = useQuery({
    queryKey: ["contacts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("contacts")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("contacts").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("contacts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contacts"] });
    }
  });

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl border border-border" />)}</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Mensagens de Contato</h2>
          <p className="text-sm text-muted-foreground mt-1">{messages.length} mensagem(ns) recebida(s)</p>
        </div>
      </div>

      {messages.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-2xl border border-dashed border-border">
          <Mail size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Nenhuma mensagem por enquanto.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((msg: any) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`p-6 rounded-2xl border border-border bg-card hover:shadow-soft transition-all ${msg.status === 'pendente' ? 'border-l-4 border-l-primary' : ''}`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-semibold text-foreground">{msg.name}</h3>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${msg.status === 'pendente' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {msg.email}
                    {msg.phone && ` • ${msg.phone}`}
                    • {new Date(msg.created_at).toLocaleDateString("pt-BR", { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => window.open(`mailto:${msg.email}?subject=Contato Nerine&body=Olá ${msg.name},`, "_blank")}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-sky-200 text-sky-600 bg-sky-50 hover:bg-sky-100 transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Responder por E-mail"
                  >
                    <Mail size={18} />
                  </button>
                  {msg.phone && (
                    <button
                      onClick={() => {
                        const cleanPhone = msg.phone.replace(/\D/g, '');
                        window.open(`https://wa.me/${cleanPhone.startsWith('55') ? cleanPhone : '55' + cleanPhone}?text=Olá ${msg.name}, recebi seu contato pelo site da Nerine:`, "_blank");
                      }}
                      className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-green-600/30 text-green-600 bg-green-50 hover:bg-green-100 transition-all hover:scale-110 active:scale-95 shadow-sm"
                      title="Responder no WhatsApp"
                    >
                      <MessageCircle size={18} />
                    </button>
                  )}
                  <button 
                    onClick={() => updateStatusMutation.mutate({ id: msg.id, status: msg.status === 'pendente' ? 'lida' : 'pendente' })}
                    className={`w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed transition-all hover:scale-110 active:scale-95 shadow-sm
                      ${msg.status !== 'pendente' 
                        ? 'border-blush-deep/20 text-blush-deep bg-blush-light/30 hover:bg-blush-light/50' 
                        : 'border-muted-foreground/20 text-muted-foreground bg-muted/30 hover:bg-muted'}`}
                    title="Marcar como lida/pendente"
                  >
                    <Check size={18} />
                  </button>
                  <button 
                    onClick={() => { if(confirm("Excluir esta mensagem?")) deleteMutation.mutate(msg.id) }}
                    className="w-10 h-10 flex items-center justify-center rounded-xl border-2 border-dashed border-destructive/30 text-destructive bg-destructive/5 hover:bg-destructive/10 transition-all hover:scale-110 active:scale-95 shadow-sm"
                    title="Excluir mensagem"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
              <p className="text-sm text-foreground/80 leading-relaxed bg-muted/30 p-4 rounded-xl italic">
                "{msg.message}"
              </p>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════
   ORDERS MANAGER (PEDIDOS)
═══════════════════════════════════════════════════ */
const OrdersAdminManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const statusConfig: Record<string, any> = {
    pendente: { color: "text-amber-600", bg: "bg-amber-50", icon: Clock, label: "Pendente" },
    processando: { color: "text-blue-600", bg: "bg-blue-50", icon: Package, label: "Em Preparação" },
    enviado: { color: "text-purple-600", bg: "bg-purple-50", icon: Truck, label: "Enviado" },
    entregue: { color: "text-sage-deep", bg: "bg-sage-light", icon: CheckCircle2, label: "Entregue" },
    cancelado: { color: "text-red-600", bg: "bg-red-50", icon: XCircle, label: "Cancelado" },
  };

  const { data: orders = [], isLoading: loading } = useQuery({
    queryKey: ["admin_orders"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select(`
          *,
          order_items (
            quantity,
            price_at_time,
            artworks (title, image_url_1)
          )
        `)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("orders").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin_orders"] });
    }
  });

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-32 bg-card rounded-2xl border border-border" />)}</div>;

  const filteredOrders = orders.filter((o: any) => {
    const custName = o.shipping_address?.customer_name || "";
    const custEmail = o.shipping_address?.customer_email || "";
    return o.id.toLowerCase().includes(searchTerm.toLowerCase()) || 
           custName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           custEmail.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Gerenciar Pedidos</h2>
          <p className="text-sm text-muted-foreground mt-1">{orders.length} pedido(s) registrado(s)</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome, email ou código..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-2xl border border-dashed border-border">
          <ShoppingBag size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Nenhum pedido encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order: any) => {
            const StatusIcon = statusConfig[order.status]?.icon || Package;
            return (
              <motion.div
                key={order.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-6 rounded-2xl border border-border bg-card hover:shadow-soft transition-all"
              >
                <div className="flex flex-col md:flex-row gap-6">
                  {/* Info Cliente & Pedido */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <h3 className="font-bold text-foreground">Pedido #{order.id.slice(0, 8).toUpperCase()}</h3>
                      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig[order.status]?.bg || 'bg-muted'} ${statusConfig[order.status]?.color || 'text-muted-foreground'}`}>
                        <StatusIcon size={12} />
                        {statusConfig[order.status]?.label || order.status}
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Cliente</p>
                        <p className="font-medium text-foreground">{order.shipping_address?.customer_name || 'Sem nome'}</p>
                        <p className="text-muted-foreground">{order.shipping_address?.customer_email}</p>
                        <p className="text-muted-foreground">{order.shipping_address?.customer_phone}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Entrega & Pagamento</p>
                        <p className="font-medium text-foreground capitalize">{order.shipping_method || 'Padrão'} (R$ {order.shipping_cost})</p>
                        <p className="text-muted-foreground text-xs mt-0.5 line-clamp-2" title={`${order.shipping_address?.street}, ${order.shipping_address?.number} - ${order.shipping_address?.district}, ${order.shipping_address?.city}`}>
                          {order.shipping_address?.street}, {order.shipping_address?.number} - {order.shipping_address?.city}
                        </p>
                        <p className="text-muted-foreground uppercase text-xs mt-2 font-bold">
                          Pagamento: {order.payment_method === 'pix' ? 'Pix' : order.payment_method === 'card' ? 'Cartão' : 'Não definido'}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Itens e Ações */}
                  <div className="md:w-72 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6">
                    <div className="space-y-3 mb-4">
                      {order.order_items?.map((item: any, idx: number) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <img src={item.artworks?.image_url_1} className="w-10 h-10 rounded-lg object-cover border border-border" />
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{item.artworks?.title}</p>
                            <p className="text-[10px] text-muted-foreground">{item.quantity}x R$ {item.price_at_time}</p>
                          </div>
                        </div>
                      ))}
                      <div className="pt-2 border-t border-border flex justify-between items-center">
                        <span className="text-xs font-bold uppercase text-muted-foreground">Total</span>
                        <span className="font-display font-bold text-lg">R$ {order.total_amount}</span>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Atualizar Status</p>
                      <select 
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={order.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: order.id, status: e.target.value })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="pendente">Pendente (Aguardando Pagamento)</option>
                        <option value="processando">Em Preparação (Pago)</option>
                        <option value="enviado">Enviado (Em trânsito)</option>
                        <option value="entregue">Entregue</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};


/* ═══════════════════════════════════════════════════
   ARTWORK MANAGER
   (Gestão Unificada de Obras)
═══════════════════════════════════════════════════ */
const ArtworkManager = () => {
  const queryClient = useQueryClient();

  const { data: artworks = [], isLoading: loading } = useQuery({
    queryKey: ["artworks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as ArtworkRow[];
    }
  });

  const allArtworksCount = artworks.length;

  const [editing, setEditing] = useState<ArtworkRow | null>(null);
  const [creating, setCreating] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const formRef = useRef<HTMLDivElement>(null);
  const [form, setForm] = useState<Omit<ArtworkRow, "id">>(EMPTY_ARTWORK);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);
  const [uploading, setUploading] = useState<number | null>(null);
  const [pendingCompression, setPendingCompression] = useState<Record<number, File>>({});
  const [compressing, setCompressing] = useState<number | null>(null);
  const fileRefs = [useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null), useRef<HTMLInputElement>(null)];

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  /* Upload imagem individual */
  const handleImageUpload = async (file: File, index: 1 | 2 | 3) => {
    setUploading(index);
    const ext = file.name.split(".").pop();
    const path = `artworks/${Date.now()}_${index}.${ext}`;

    const { error } = await supabase.storage.from("portfolio").upload(path, file, { upsert: true });

    if (error) {
      showToast(`Erro ao enviar imagem ${index}.`, false);
      setUploading(null);
      return;
    }

    const { data } = supabase.storage.from("portfolio").getPublicUrl(path);
    const fieldName = `image_url_${index}` as const;

    setForm(f => ({ ...f, [fieldName]: data.publicUrl }));
    setUploading(null);
  };

  /* Comprime a imagem antes de fazer upload se tiver mais de 20MB */
  const handleCompressAndUpload = async (idx: 1 | 2 | 3) => {
    const file = pendingCompression[idx];
    if (!file) return;
    setCompressing(idx);
    try {
      const options = {
        maxSizeMB: 19, // Garante que a imagem final não ultrapasse 20MB e comprima bem a imagem
        maxWidthOrHeight: 2560, // Limita as dimensões por garantia
        useWebWorker: true,
      };

      const compressedFile = await import('browser-image-compression').then((mod) => mod.default(file, options));

      setPendingCompression(prev => {
        const newObj = { ...prev };
        delete newObj[idx];
        return newObj;
      });

      await handleImageUpload(compressedFile, idx);
    } catch (error) {
      showToast("Erro ao comprimir imagem. O arquivo pode estar corrompido.", false);
    } finally {
      setCompressing(null);
    }
  };

  /* Remove a imagem visualmente, reseta o input e deleta do banco */
  const handleRemoveImage = async (index: 1 | 2 | 3, url: string) => {
    // 1. Limpa state visual instantaneamente
    setForm(f => ({ ...f, [`image_url_${index}`]: "" }));

    // 2. Reseta o input type="file" para permitir pegar o MESMO arquivo novamente
    if (fileRefs[index - 1].current) {
      fileRefs[index - 1].current!.value = "";
    }

    if (!url) return;

    // 3. Remove a imagem fisicamente do Storage do Supabase (Bucket "portfolio")
    try {
      const pathMatch = url.match(/\/portfolio\/(.+)$/);
      if (pathMatch && pathMatch[1]) {
        const filePath = decodeURIComponent(pathMatch[1]);
        await supabase.storage.from("portfolio").remove([filePath]);
      }
    } catch (err) {
      console.error("Erro deletando imagem do banco:", err);
    }
  };

  /* Salvar (criar ou editar) via mutation */
  const saveMutation = useMutation({
    mutationFn: async (formData: Omit<ArtworkRow, "id">) => {
      if (creating) {
        const { error } = await supabase.from("artworks").insert([formData]);
        if (error) throw error;
      } else if (editing) {
        const { error } = await supabase.from("artworks").update(formData).eq("id", editing.id);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      if (creating) {
        showToast("Obra criada com sucesso!");
        setCreating(false);
        setForm(EMPTY_ARTWORK);
      } else {
        showToast("Obra atualizada!");
        setEditing(null);
      }
    },
    onError: () => {
      showToast("Erro ao processar as informações da obra.", false);
    }
  });

  const handleSave = () => saveMutation.mutate(form);

  /* Deletar via mutation */
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("artworks").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["artworks"] });
      showToast("Obra removida.");
    },
    onError: (error) => {
      console.error("Erro ao deletar:", error);
      showToast("Erro ao deletar.", false);
    }
  });

  const handleDelete = (id: string) => {
    setConfirmDelete(id);
  };

  const performDelete = () => {
    if (confirmDelete) {
      deleteMutation.mutate(confirmDelete);
      setConfirmDelete(null);
    }
  };

  const openEdit = (art: ArtworkRow) => {
    setEditing(art);
    setCreating(false);
    setForm({ ...art });
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const openCreate = () => {
    setCreating(true);
    setEditing(null);
    setForm(EMPTY_ARTWORK);
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 100);
  };

  const cancelForm = () => { setCreating(false); setEditing(null); setForm(EMPTY_ARTWORK); };

  /* Form flags baseadas nas mutations */
  const saving = saveMutation.isPending;
  const deleting = deleteMutation.variables; /* armazena o id passado se isPending */

  /* ── Render ── */
  return (
    <div className="max-w-5xl mx-auto space-y-8">

      {/* Modal de Confirmação de Exclusão */}
      <AnimatePresence>
        {confirmDelete && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setConfirmDelete(null)}
              className="absolute inset-0 bg-foreground/30 backdrop-blur-md"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-md bg-card border border-border p-8 rounded-3xl shadow-2xl space-y-6 overflow-hidden"
            >
              {/* Elementos decorativos de fundo */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/5 rounded-full -mr-16 -mt-16 blur-2xl" />
              <div className="absolute bottom-0 left-0 w-24 h-24 bg-primary/5 rounded-full -ml-12 -mb-12 blur-xl" />

              <div className="flex flex-col items-center text-center space-y-4">
                <div className="w-16 h-16 bg-destructive/10 rounded-2xl flex items-center justify-center text-destructive mb-2">
                  <Trash2 size={32} />
                </div>
                <h3 className="font-display text-2xl font-bold text-foreground">Excluir obra?</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  Esta ação é irreversível. A obra será removida permanentemente do banco de dados e do site.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button
                  onClick={performDelete}
                  className="flex-1 py-3.5 bg-destructive text-destructive-foreground rounded-full text-sm font-semibold hover:bg-destructive/90 transition-all active:scale-95 shadow-soft"
                >
                  Sim, excluir obra
                </button>
                <button
                  onClick={() => setConfirmDelete(null)}
                  className="flex-1 py-3.5 bg-muted text-muted-foreground rounded-full text-sm font-semibold hover:bg-muted/80 transition-all active:scale-95"
                >
                  Cancelar
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -12 }}
            className={`fixed top-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-soft text-sm font-medium
              ${toast.ok ? "bg-primary text-primary-foreground" : "bg-destructive text-destructive-foreground"}`}
          >
            {toast.ok ? <Check size={16} /> : <AlertCircle size={16} />}
            {toast.msg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header seção */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Gerenciar Obras</h2>
          <p className="text-sm text-muted-foreground mt-1">
            {artworks.length} obra(s) cadastrada(s) no total
          </p>
        </div>
        {!creating && !editing && (
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-colors shadow-soft"
          >
            <Plus size={16} /> Nova obra
          </button>
        )}
      </div>

      <div ref={formRef} />

      {/* Formulário criar / editar */}
      <AnimatePresence>
        {(creating || editing) && (
          <motion.div
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 16 }}
            className="rounded-2xl border border-border bg-card p-6 md:p-8 shadow-soft space-y-8"
          >
            <div className="flex items-center justify-between border-b border-border pb-4">
              <h3 className="font-display text-xl font-semibold text-foreground">
                {creating ? "Cadastrar nova obra" : `Editando: ${editing?.title}`}
              </h3>
              <button onClick={cancelForm} className="text-muted-foreground hover:text-foreground transition-colors"><X size={20} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Título e Visibilidade */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2">
                  <label className="label-field">Nome da obra</label>
                  <input className="input-field" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Ex: Entrega Silenciosa" />
                </div>
                <div className="flex flex-col gap-2 justify-center pt-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_portfolio}
                      onChange={e => setForm(f => ({ ...f, is_portfolio: e.target.checked }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Exibir no Portfólio</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input
                      type="checkbox"
                      checked={form.is_shop}
                      onChange={e => setForm(f => ({ ...f, is_shop: e.target.checked }))}
                      className="w-4 h-4 rounded border-border text-primary focus:ring-primary"
                    />
                    <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">Exibir no Ateliê (Loja)</span>
                  </label>
                </div>
              </div>

              {/* Descrição */}
              <div className="md:col-span-2">
                <label className="label-field">Descrição</label>
                <textarea className="input-field min-h-[100px] resize-none" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Fale sobre o sentimento por trás desta obra..." />
              </div>

              {/* Upload de Imagens (Suporta até 3) */}
              <div className="md:col-span-2 space-y-4">
                <label className="label-field">Imagens da obra (até 3)</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {[1, 2, 3].map((num) => {
                    const idx = num as 1 | 2 | 3;
                    const url = form[`image_url_${idx}`];
                    return (
                      <div key={idx} className="relative group">
                        <div className="aspect-square rounded-xl border border-border bg-muted/30 flex flex-col items-center justify-center overflow-hidden transition-all hover:bg-muted/50">
                          {url ? (
                            <>
                              <img src={url} alt={`Preview ${idx}`} className="w-full h-full object-cover" />
                              <button
                                onClick={() => handleRemoveImage(idx, url)}
                                className="absolute top-2 right-2 p-1.5 bg-destructive text-destructive-foreground rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X size={14} />
                              </button>
                            </>
                          ) : pendingCompression[idx] ? (
                            <div className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-center">
                              <AlertCircle size={24} className="text-destructive mb-1" />
                              <span className="text-[10px] text-destructive font-medium uppercase tracking-wider leading-tight">Imagem &gt; 20MB</span>
                              <button
                                type="button"
                                disabled={compressing === idx}
                                onClick={() => handleCompressAndUpload(idx)}
                                className="mt-2 w-full py-1.5 bg-destructive text-destructive-foreground rounded-md text-xs font-medium hover:bg-destructive/90 transition-colors flex items-center justify-center"
                              >
                                {compressing === idx ? "Comprimindo..." : "Comprimir"}
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setPendingCompression(p => { const newP = { ...p }; delete newP[idx]; return newP; });
                                  if (fileRefs[idx - 1].current) fileRefs[idx - 1].current!.value = "";
                                }}
                                className="text-[10px] text-muted-foreground underline mt-1"
                                disabled={compressing === idx}
                              >
                                Cancelar
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              disabled={uploading === idx}
                              onClick={() => fileRefs[idx - 1].current?.click()}
                              className="w-full h-full flex flex-col items-center justify-center gap-2 p-4 text-muted-foreground hover:text-primary transition-colors"
                            >
                              <Upload size={20} className={uploading === idx ? "animate-bounce" : ""} />
                              <span className="text-xs">{uploading === idx ? "Enviando..." : `Imagem ${idx}`}</span>
                            </button>
                          )}
                        </div>
                        <input
                          ref={fileRefs[idx - 1]}
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={e => {
                            const file = e.target.files?.[0];
                            if (file) {
                              if (file.size > 20 * 1024 * 1024) { // 20 MB limits
                                setPendingCompression(prev => ({ ...prev, [idx]: file }));
                                showToast(`A imagem selecionada possui mais de 20MB. É necessário comprimi-la antes de enviar.`, false);
                              } else {
                                handleImageUpload(file, idx);
                              }
                            }
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Preço */}
              <div>
                <label className="label-field">Preço (R$)</label>
                <input type="number" step="0.01" className="input-field" value={form.price ?? ""} onChange={e => setForm(f => ({ ...f, price: e.target.value ? Number(e.target.value) : null }))} placeholder="Ex: 2800.00" />
              </div>

              {/* Quantidade */}
              <div>
                <label className="label-field">Quantidade em estoque</label>
                <input type="number" className="input-field" value={form.quantity} onChange={e => setForm(f => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>

              {/* Status */}
              <div>
                <label className="label-field">Status</label>
                <select className="input-field" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="disponível">Disponível</option>
                  <option value="vendida">Vendida</option>
                  <option value="esgotada">Esgotada</option>
                  <option value="sob consulta">Sob consulta</option>
                  <option value="rascunho">Rascunho</option>
                </select>
              </div>

              {/* Categoria */}
              <div>
                <label className="label-field">Categoria</label>
                <select className="input-field" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value as "original" | "print" }))}>
                  <option value="original">Original</option>
                  <option value="print">Print</option>
                </select>
              </div>

              {/* Técnica */}
              <div>
                <label className="label-field">Técnica</label>
                <input className="input-field" value={form.technique} onChange={e => setForm(f => ({ ...f, technique: e.target.value }))} placeholder="Ex: Óleo sobre tela" />
              </div>

              {/* Dimensões */}
              <div>
                <label className="label-field">Dimensões</label>
                <input className="input-field" value={form.dimensions} onChange={e => setForm(f => ({ ...f, dimensions: e.target.value }))} placeholder="Ex: 60 × 80 cm" />
              </div>
            </div>

            {/* Ações do form */}
            <div className="flex gap-4 pt-6 border-t border-border">
              <button
                onClick={handleSave}
                disabled={saving || !form.title || !form.image_url_1}
                className="flex-1 md:flex-none px-10 py-3 bg-primary text-primary-foreground rounded-full text-sm font-medium hover:bg-primary/90 transition-all disabled:opacity-50 shadow-soft active:scale-95"
              >
                {saving ? "Salvando..." : "Salvar Obra"}
              </button>
              <button
                onClick={cancelForm}
                className="flex-1 md:flex-none px-10 py-3 rounded-full border border-border text-sm text-muted-foreground hover:bg-muted transition-all"
              >
                Cancelar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Lista de obras */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl border border-border bg-card h-80 animate-pulse" />
          ))}
        </div>
      ) : artworks.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-2xl border border-dashed border-border">
          <Images size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">O seu portfólio ainda está vazio.</p>
          <button onClick={openCreate} className="mt-4 text-primary font-medium hover:underline text-sm">
            Clique aqui para adicionar sua primeira obra
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {artworks.map(art => (
            <motion.div
              key={art.id}
              layout
              className="group rounded-2xl border border-border bg-card overflow-hidden hover:shadow-soft transition-all"
            >
              <div className="relative h-56 bg-muted overflow-hidden">
                {art.image_url_1
                  ? <img src={art.image_url_1} alt={art.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                  : <div className="w-full h-full flex items-center justify-center"><Images size={32} className="text-muted-foreground/20" /></div>
                }
                <div className="flex flex-wrap gap-1.5">
                  <span className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider shadow-sm
                      ${art.status === 'disponível' ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                    {art.status}
                  </span>
                  {art.is_portfolio && (
                    <span className="bg-blush-light/50 text-blush-deep text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-blush-deep/20">
                      Portfólio
                    </span>
                  )}
                  {art.is_shop && (
                    <span className="bg-sage-light/50 text-primary text-[9px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border border-primary/20">
                      Ateliê
                    </span>
                  )}
                </div>
                {art.quantity > 0 && (
                  <span className="bg-background/80 backdrop-blur-sm text-[10px] px-2.5 py-1 rounded-full font-medium text-center shadow-sm">
                    {art.quantity} {art.quantity === 1 ? 'unid' : 'unids'}
                  </span>
                )}
              </div>

              <div className="p-5">
                <div className="flex justify-between items-start mb-2">
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">{art.category} · {art.year}</p>
                </div>
                <h3 className="font-display text-lg font-semibold text-foreground leading-tight mb-2 line-clamp-1">{art.title}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2 mb-4 h-8">{art.description}</p>

                <div className="flex items-center justify-between pt-4 border-t border-border">
                  <span className="text-base font-semibold text-primary">
                    {art.price ? `R$ ${art.price.toLocaleString("pt-BR", { minimumFractionDigits: 2 })}` : "—"}
                  </span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(art)}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                    >
                      <Edit3 size={15} />
                    </button>
                    <button
                      onClick={() => handleDelete(art.id)}
                      disabled={deleting === art.id}
                      className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors disabled:opacity-40"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CLUB MANAGER (GERENCIAMENTO DO CLUBE)
═══════════════════════════════════════════════════ */
const ClubManager = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<"editions" | "subscribers">("editions");
  const [editingEdition, setEditingEdition] = useState<any>(null);
  const [isEditionModalOpen, setIsEditionModalOpen] = useState(false);
  const [selectedEditionId, setSelectedEditionId] = useState<string | null>(null);

  // -- Queries --
  const { data: editions = [], isLoading: loadingEditions } = useQuery({
    queryKey: ["club_editions"],
    queryFn: async () => {
      const { data, error } = await supabase.from("club_editions").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const { data: items = [], isLoading: loadingItems } = useQuery({
    queryKey: ["club_items", selectedEditionId],
    enabled: !!selectedEditionId,
    queryFn: async () => {
      const { data, error } = await supabase.from("club_items").select("*").eq("edition_id", selectedEditionId).order("created_at", { ascending: true });
      if (error) throw error;
      return data;
    }
  });

  // -- Mutations --
  const saveEditionMutation = useMutation({
    mutationFn: async (edition: any) => {
      // Limpar campos que não existem mais ou campos relacionais antes de salvar
      const { club_items, theme_desc, ...payload } = edition;
      
      if (payload.id) {
        const { error } = await supabase.from("club_editions").update(payload).eq("id", payload.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("club_editions").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club_editions"] });
      setIsEditionModalOpen(false);
      setEditingEdition(null);
    }
  });

  const deleteEditionMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("club_editions").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club_editions"] });
      if (selectedEditionId) setSelectedEditionId(null);
    }
  });

  return (
    <div className="space-y-8">
      {/* Sub-tabs */}
      <div className="flex border-b border-border mb-8">
        <button
          onClick={() => setActiveTab("editions")}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            activeTab === "editions" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Gerenciar Edições
          {activeTab === "editions" && (
            <motion.div layoutId="clubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
        <button
          onClick={() => setActiveTab("subscribers")}
          className={`px-6 py-3 text-sm font-medium transition-all relative ${
            activeTab === "subscribers" ? "text-primary" : "text-muted-foreground hover:text-foreground"
          }`}
        >
          Assinantes do Clube
          {activeTab === "subscribers" && (
            <motion.div layoutId="clubTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      </div>

      {activeTab === "editions" ? (
        <>
          {/* Listagem de Edições */}
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-display font-semibold text-foreground">Edições do Clube</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie os meses, estoques e itens de cada kit.</p>
        </div>
        <button
          onClick={() => {
            setEditingEdition({ 
              month: "", 
              year: new Date().getFullYear(), 
              status: "atual", 
              price: 0, 
              stock: 0, 
              theme: "", 
              description: "", 
              preview_image_url: "" 
            });
            setIsEditionModalOpen(true);
          }}
          className="flex items-center gap-2 bg-primary text-primary-foreground px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-primary/90 transition-all shadow-sm hover:shadow"
        >
          <Plus size={16} /> Nova Edição
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {editions.map((edition: any) => (
          <div 
            key={edition.id} 
            className={`bg-card border rounded-2xl p-5 transition-all cursor-pointer ${selectedEditionId === edition.id ? 'border-primary ring-1 ring-primary/20 shadow-md' : 'border-border hover:border-primary/50 hover:shadow-sm'}`}
            onClick={() => setSelectedEditionId(edition.id)}
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${edition.status === 'atual' ? 'bg-blush-light text-blush-deep' : 'bg-muted text-muted-foreground'}`}>
                  {edition.status === 'atual' ? 'Mês Atual' : 'Anterior'}
                </span>
                <span className="text-xs text-muted-foreground font-medium">Estoque: {edition.stock}</span>
              </div>
              <div className="flex gap-1">
                <button 
                  onClick={(e) => { e.stopPropagation(); setEditingEdition(edition); setIsEditionModalOpen(true); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                >
                  <Edit3 size={14} />
                </button>
                <button 
                  onClick={(e) => { e.stopPropagation(); if(confirm("Excluir esta edição e todos os seus itens?")) deleteEditionMutation.mutate(edition.id); }}
                  className="p-1.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
            
            <div className="flex gap-4">
              {edition.preview_image_url ? (
                <img src={edition.preview_image_url} alt="Preview" className="w-16 h-16 rounded-xl object-cover bg-muted" />
              ) : (
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center">
                  <Package size={20} className="text-muted-foreground/30" />
                </div>
              )}
              <div>
                <h3 className="font-display font-semibold text-lg text-foreground leading-tight">{edition.month} {edition.year}</h3>
                <p className="text-sm font-medium text-primary mt-1">R$ {edition.price}</p>
                <p className="text-[10px] text-muted-foreground mt-1 line-clamp-1">
                  <span className="font-bold">Tema:</span> {edition.theme || "—"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Gerenciador de Itens da Edição Selecionada */}
      {selectedEditionId && activeTab === "editions" && (
        <div className="mt-12 pt-10 border-t border-border">
          <ClubItemsManager editionId={selectedEditionId} items={items} editionMonth={editions.find((e:any) => e.id === selectedEditionId)?.month} />
        </div>
      )}

      {/* Modal Edição do Clube */}
      {isEditionModalOpen && editingEdition && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-xl rounded-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh] border border-border">
            <div className="px-6 py-4 border-b border-border flex justify-between items-center bg-muted/30">
              <h2 className="font-display font-semibold text-lg">{editingEdition.id ? "Editar Edição" : "Nova Edição"}</h2>
              <button onClick={() => setIsEditionModalOpen(false)} className="text-muted-foreground hover:text-foreground"><X size={20} /></button>
            </div>
            <div className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Imagem de Capa da Edição</label>
                <div className="flex items-center gap-4">
                  {editingEdition.preview_image_url ? (
                    <div className="relative group">
                      <img src={editingEdition.preview_image_url} alt="Capa" className="w-24 h-24 rounded-xl object-cover border border-border" />
                      <button 
                        onClick={() => setEditingEdition({...editingEdition, preview_image_url: ""})}
                        className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ) : (
                    <label className="w-24 h-24 rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all">
                      <Upload size={20} className="text-muted-foreground mb-1" />
                      <span className="text-[10px] text-muted-foreground font-medium">Upload</span>
                      <input 
                        type="file" 
                        className="hidden" 
                        accept="image/*" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            try {
                              // Opções de compressão
                              const options = {
                                maxSizeMB: 0.8,
                                maxWidthOrHeight: 1200,
                                useWebWorker: true,
                              };
                              const compressedFile = await imageCompression(file, options);
                              
                              const fileExt = file.name.split('.').pop();
                              const fileName = `${Math.random()}.${fileExt}`;
                              const filePath = `editions/${fileName}`;
                              
                              const { error: uploadError } = await supabase.storage.from('club').upload(filePath, compressedFile);
                              if (uploadError) { alert("Erro no upload"); return; }
                              
                              const { data: { publicUrl } } = supabase.storage.from('club').getPublicUrl(filePath);
                              setEditingEdition({...editingEdition, preview_image_url: publicUrl});
                            } catch (err) {
                              console.error(err);
                              alert("Erro ao processar imagem");
                            }
                          }
                        }}
                      />
                    </label>
                  )}
                  <div className="flex-1">
                    <p className="text-[10px] text-muted-foreground">Recomendado: 800x600px. JPG ou WEBP.</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Mês (Ex: Maio)</label>
                  <input type="text" value={editingEdition.month} onChange={e => setEditingEdition({...editingEdition, month: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Ano</label>
                  <input type="number" value={editingEdition.year} onChange={e => setEditingEdition({...editingEdition, year: Number(e.target.value)})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Status</label>
                  <select value={editingEdition.status} onChange={e => setEditingEdition({...editingEdition, status: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm">
                    <option value="atual">Mês Atual</option>
                    <option value="anterior">Anterior</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Preço (R$)</label>
                  <input type="number" value={editingEdition.price} onChange={e => setEditingEdition({...editingEdition, price: Number(e.target.value)})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Estoque</label>
                  <input type="number" value={editingEdition.stock} onChange={e => setEditingEdition({...editingEdition, stock: Number(e.target.value)})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" />
                </div>
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Tema do Mês (Aparece na foto)</label>
                <input type="text" value={editingEdition.theme} onChange={e => setEditingEdition({...editingEdition, theme: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" placeholder="Ex: O tempo e as flores" />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-1.5 block">Descrição Curta (Aparece ao lado)</label>
                <textarea value={editingEdition.description} onChange={e => setEditingEdition({...editingEdition, description: e.target.value})} rows={3} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" placeholder="Explique um pouco mais sobre o conceito..." />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-border bg-muted/30 flex justify-end gap-3">
              <button onClick={() => setIsEditionModalOpen(false)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
              <button onClick={() => saveEditionMutation.mutate(editingEdition)} disabled={saveEditionMutation.isPending} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
                {saveEditionMutation.isPending ? "Salvando..." : "Salvar Edição"}
              </button>
            </div>
          </div>
        </div>
      )}
        </>
      ) : (
        <ClubSubscriptionsManager />
      )}
    </div>
  );
};

// Componente Interno para gerenciar Itens
const ClubItemsManager = ({ editionId, items, editionMonth }: { editionId: string, items: any[], editionMonth: string }) => {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);

  const saveItemMutation = useMutation({
    mutationFn: async (item: any) => {
      const payload = { ...item, edition_id: editionId };
      if (item.id) {
        const { error } = await supabase.from("club_items").update(payload).eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("club_items").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club_items", editionId] });
      setEditingItem(null);
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("club_items").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club_items", editionId] });
    }
  });

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-display font-semibold text-xl">Itens do Clube — {editionMonth}</h3>
        <button
          onClick={() => setEditingItem({ name: "", type: "Arte", is_mystery: false, image_url: "" })}
          className="flex items-center gap-2 bg-muted text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:bg-muted/80 transition-all"
        >
          <Plus size={14} /> Adicionar Item
        </button>
      </div>

      {/* Formulário de Edição de Item Inline */}
      {editingItem && (
        <div className="bg-primary/5 border border-primary/20 rounded-2xl p-5 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-end">
            {/* Upload do Item */}
            <div className="md:col-span-3">
              <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Foto do Item</label>
              {editingItem.image_url ? (
                <div className="relative w-full aspect-square max-w-[120px]">
                  <img src={editingItem.image_url} alt="" className="w-full h-full object-cover rounded-xl border border-border" />
                  <button onClick={() => setEditingItem({...editingItem, image_url: ""})} className="absolute -top-2 -right-2 bg-destructive text-white p-1 rounded-full"><X size={10} /></button>
                </div>
              ) : (
                <label className="w-full aspect-square max-w-[120px] rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-all">
                  <Upload size={16} className="text-muted-foreground mb-1" />
                  <span className="text-[9px] text-muted-foreground font-medium uppercase">Upload</span>
                  <input 
                    type="file" 
                    className="hidden" 
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        try {
                          const options = {
                            maxSizeMB: 0.5,
                            maxWidthOrHeight: 800,
                            useWebWorker: true,
                          };
                          const compressedFile = await imageCompression(file, options);

                          const fileExt = file.name.split('.').pop();
                          const fileName = `${Math.random()}.${fileExt}`;
                          const filePath = `items/${fileName}`;
                          
                          const { error: uploadError } = await supabase.storage.from('club').upload(filePath, compressedFile);
                          if (uploadError) return;
                          
                          const { data: { publicUrl } } = supabase.storage.from('club').getPublicUrl(filePath);
                          setEditingItem({...editingItem, image_url: publicUrl});
                        } catch (err) {
                          console.error(err);
                        }
                      }
                    }}
                  />
                </label>
              )}
            </div>

            <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Título do Item</label>
                <input type="text" value={editingItem.name} onChange={e => setEditingItem({...editingItem, name: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" placeholder="Ex: Carta O Tempo" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest block mb-1">Categoria</label>
                <input type="text" value={editingItem.type} onChange={e => setEditingItem({...editingItem, type: e.target.value})} className="w-full px-3 py-2 bg-background border border-border rounded-xl text-sm" placeholder="Ex: Arte, Papelaria, Texto..." />
              </div>
              <div className="flex items-center justify-between pb-2 sm:col-span-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="checkbox" checked={editingItem.is_mystery} onChange={e => setEditingItem({...editingItem, is_mystery: e.target.checked})} className="rounded text-primary focus:ring-primary w-4 h-4" />
                  <span className="text-sm font-medium">Item Surpresa?</span>
                </label>
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-primary/10">
            <button onClick={() => setEditingItem(null)} className="px-4 py-2 text-sm font-medium text-muted-foreground hover:text-foreground">Cancelar</button>
            <button onClick={() => saveItemMutation.mutate(editingItem)} disabled={saveItemMutation.isPending || !editingItem.name} className="px-6 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-medium hover:bg-primary/90 disabled:opacity-50">
              {saveItemMutation.isPending ? "Salvando..." : "Salvar Item"}
            </button>
          </div>
        </div>
      )}

      {/* Lista de Itens */}
      <div className="space-y-3">
        {items.length === 0 && !editingItem && (
          <div className="text-center py-10 bg-muted/30 rounded-2xl border border-dashed border-border">
            <p className="text-muted-foreground text-sm">Nenhum item adicionado a esta edição.</p>
          </div>
        )}
        {items.map((item: any) => (
          <div key={item.id} className="flex items-center justify-between p-4 bg-card border border-border rounded-2xl hover:border-primary/30 transition-colors">
            <div className="flex items-center gap-4">
              {item.image_url ? (
                <img src={item.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-muted" />
              ) : (
                <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                  <Images size={16} className="text-muted-foreground/30" />
                </div>
              )}
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] uppercase tracking-widest text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{item.type}</span>
                  {item.is_mystery && <span className="text-[10px] uppercase tracking-widest text-blush-deep font-bold bg-blush-light px-2 py-0.5 rounded-full flex items-center gap-1"><Check size={10} /> Surpresa</span>}
                </div>
                <p className="font-medium text-foreground mt-1">{item.name}</p>
              </div>
            </div>
            <div className="flex gap-1">
              <button onClick={() => setEditingItem(item)} className="p-2 rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"><Edit3 size={15} /></button>
              <button onClick={() => { if(confirm("Excluir item?")) deleteItemMutation.mutate(item.id) }} className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"><Trash2 size={15} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

/* ═══════════════════════════════════════════════════
   CLUB SUBSCRIPTIONS MANAGER (ASSINANTES)
═══════════════════════════════════════════════════ */
const ClubSubscriptionsManager = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");

  const statusConfig: Record<string, any> = {
    aguardando_pagamento: { color: "text-amber-600", bg: "bg-amber-50", label: "Aguardando Pagamento" },
    pago: { color: "text-sage-deep", bg: "bg-sage-light", label: "Pago" },
    enviado: { color: "text-blue-600", bg: "bg-blue-50", label: "Enviado" },
    cancelado: { color: "text-red-600", bg: "bg-red-50", label: "Cancelado" },
  };

  const { data: subscriptions = [], isLoading } = useQuery({
    queryKey: ["club_subscriptions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("club_subscriptions")
        .select(`*, club_editions(month, year)`)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { error } = await supabase.from("club_subscriptions").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["club_subscriptions"] });
    }
  });

  const filtered = subscriptions.filter((s: any) => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-card rounded-2xl border border-border" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between mb-8">
        <div>
          <h2 className="font-display text-2xl font-semibold text-foreground">Assinantes do Clube</h2>
          <p className="text-sm text-muted-foreground mt-1">{subscriptions.length} assinatura(s) registrada(s)</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Buscar por nome ou email..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border border-border rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-32 bg-card rounded-2xl border border-dashed border-border">
          <Users size={48} className="mx-auto text-muted-foreground/20 mb-4" />
          <p className="text-muted-foreground">Nenhum assinante encontrado.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((sub: any) => (
            <motion.div
              key={sub.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-soft transition-all"
            >
              <div className="flex flex-col md:flex-row gap-6">
                {/* Info Cliente */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="font-bold text-foreground text-lg">{sub.name}</h3>
                    <div className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${statusConfig[sub.status]?.bg || 'bg-muted'} ${statusConfig[sub.status]?.color || 'text-muted-foreground'}`}>
                      {statusConfig[sub.status]?.label || sub.status}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Contato</p>
                      <p className="text-foreground">{sub.email}</p>
                      <p className="text-muted-foreground">Apelido: {sub.nickname || "—"}</p>
                      <p className="text-muted-foreground mt-2">Encontrou via: <span className="capitalize">{sub.found_via || "—"}</span></p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase tracking-widest font-bold mb-1">Endereço de Entrega</p>
                      <p className="text-foreground">{sub.street}, {sub.number} {sub.complement && `(${sub.complement})`}</p>
                      <p className="text-muted-foreground">{sub.district}, {sub.city} - {sub.state}</p>
                      <p className="text-muted-foreground">CEP: {sub.zip}</p>
                    </div>
                  </div>
                </div>

                {/* Edição e Ações */}
                <div className="md:w-64 flex flex-col justify-between border-t md:border-t-0 md:border-l border-border pt-4 md:pt-0 md:pl-6 gap-6">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Edição Assinada</p>
                    <p className="font-display font-semibold text-primary">
                      {sub.club_editions?.month} {sub.club_editions?.year}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-1">Data: {new Date(sub.created_at).toLocaleDateString()}</p>
                  </div>

                  <div className="space-y-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`mailto:${sub.email}?subject=Assinatura Clube Nerine&body=Olá ${sub.nickname || sub.name},`, "_blank")}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-border text-muted-foreground hover:bg-muted transition-all text-xs font-medium"
                      >
                        <Mail size={14} /> E-mail
                      </button>
                      <button
                        onClick={() => {
                          const msg = encodeURIComponent(`Olá ${sub.nickname || sub.name}, estou entrando em contato sobre sua assinatura do Clube Nerine de ${sub.club_editions?.month}!`);
                          window.open(`https://wa.me/?text=${msg}`, "_blank");
                        }}
                        className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl border border-green-200 text-green-600 hover:bg-green-50 transition-all text-xs font-medium"
                      >
                        <MessageCircle size={14} /> WhatsApp
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">Alterar Status</p>
                      <select 
                        className="w-full bg-muted/30 border border-border rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-primary/20"
                        value={sub.status}
                        onChange={(e) => updateStatusMutation.mutate({ id: sub.id, status: e.target.value })}
                        disabled={updateStatusMutation.isPending}
                      >
                        <option value="aguardando_pagamento">Aguardando Pagamento</option>
                        <option value="pago">Pago</option>
                        <option value="enviado">Enviado</option>
                        <option value="cancelado">Cancelado</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPage;
