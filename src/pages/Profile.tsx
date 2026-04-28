import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { Camera, Mail, Phone, User, MapPin, Loader2, LogIn, UserPlus } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { supabase } from "@/lib/supabase/client";
import { toast } from "sonner";
import { useNavigate, Link } from "react-router-dom";
import ButterflyIcon from "@/components/ButterflyIcon";

const Profile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  // Estados do formulário
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    phone: "",
    address_zip: "",
    address_street: "",
    address_number: "",
    address_complement: "",
    address_district: "",
    address_city: "",
    address_state: "",
    avatar_url: ""
  });

  // Carregar dados do perfil
  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error && error.code !== "PGRST116") throw error;

      if (data) {
        setFormData({
          first_name: data.first_name || "",
          last_name: data.last_name || "",
          phone: data.phone || "",
          address_zip: data.address_zip || "",
          address_street: data.address_street || "",
          address_number: data.address_number || "",
          address_complement: data.address_complement || "",
          address_district: data.address_district || "",
          address_city: data.address_city || "",
          address_state: data.address_state || "",
          avatar_url: data.avatar_url || ""
        });
      }
    } catch (error: any) {
      toast.error("Erro ao carregar perfil: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    
    try {
      setSaving(true);
      const { error } = await supabase
        .from("profiles")
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq("id", user.id);

      if (error) throw error;
      toast.success("Perfil atualizado com sucesso!");
      
      // Pequeno delay para a pessoa ler a mensagem antes de voltar
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (error: any) {
      toast.error("Erro ao salvar: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    try {
      setSaving(true);
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/${Math.random()}.${fileExt}`;

      // Upload para o bucket 'avatars'
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Pegar URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Atualizar estado e banco
      setFormData(prev => ({ ...prev, avatar_url: publicUrl }));
      await supabase.from('profiles').update({ avatar_url: publicUrl }).eq('id', user.id);
      
      toast.success("Foto de perfil atualizada!");
    } catch (error: any) {
      toast.error("Erro no upload: " + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-ethereal flex flex-col">
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-6 py-24">
          <div className="text-center max-w-md mx-auto space-y-8">
            {/* Ícone decorativo */}
            <div className="relative inline-block">
              <div className="w-28 h-28 bg-primary/5 border-2 border-primary/10 rounded-full flex items-center justify-center mx-auto">
                <ButterflyIcon className="w-12 h-12 text-primary/40" />
              </div>
              <div className="absolute -bottom-1 -right-1 w-9 h-9 bg-muted border-2 border-white rounded-full flex items-center justify-center shadow-sm">
                <User size={16} className="text-muted-foreground" />
              </div>
            </div>

            {/* Texto */}
            <div className="space-y-3">
              <h1 className="font-display text-3xl font-semibold text-foreground">Acesso Restrito</h1>
              <p className="text-muted-foreground leading-relaxed">
                Faça login para acessar seu perfil, editar suas informações de entrega e acompanhar seus pedidos.
              </p>
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild className="py-6 px-8 rounded-2xl shadow-md flex items-center gap-2">
                <Link to="/login">
                  <LogIn size={18} /> Fazer Login
                </Link>
              </Button>
              <Button asChild variant="outline" className="py-6 px-8 rounded-2xl border-2 flex items-center gap-2">
                <Link to="/login?tab=register">
                  <UserPlus size={18} /> Criar Conta
                </Link>
              </Button>
            </div>

            {/* Link voltar */}
            <p className="text-xs text-muted-foreground">
              Ou{" "}
              <Link to="/" className="text-primary hover:underline font-medium">
                continue explorando o ateliê
              </Link>
              {" "}sem fazer login.
            </p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="animate-spin text-primary" size={32} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-ethereal">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-4xl">
          <h1 className="font-display text-4xl font-semibold mb-2">Editar Perfil</h1>
          <p className="text-muted-foreground mb-12">Mantenha suas informações de entrega e contato atualizadas.</p>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Foto de Perfil */}
            <div className="lg:col-span-1 flex flex-col items-center gap-6">
              <div className="relative group">
                <Avatar className="h-40 w-40 border-4 border-white shadow-dreamy overflow-hidden">
                  <AvatarImage src={formData.avatar_url} className="object-cover" />
                  <AvatarFallback className="bg-primary text-primary-foreground text-3xl font-bold">
                    {formData.first_name?.[0] || user?.email?.[0].toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <label className="absolute bottom-2 right-2 p-3 bg-primary text-white rounded-full shadow-lg hover:scale-110 transition-transform active:scale-95 cursor-pointer">
                  <Camera size={20} />
                  <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={saving} />
                </label>
              </div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground font-bold">Foto de Perfil</p>
            </div>

            {/* Formulário */}
            <div className="lg:col-span-2 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Nome</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    value={formData.first_name}
                    onChange={e => setFormData({...formData, first_name: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Sobrenome</label>
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    value={formData.last_name}
                    onChange={e => setFormData({...formData, last_name: e.target.value})}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
                  <input className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-muted/30 cursor-not-allowed opacity-60" value={user?.email || ""} readOnly />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs uppercase tracking-widest font-bold text-muted-foreground">Número de Telefone</label>
                <div className="relative">
                  <Phone size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground opacity-40" />
                  <input 
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <div className="pt-6 border-t border-border">
                <h2 className="font-display text-xl font-medium mb-6 flex items-center gap-2">
                  <MapPin size={20} className="text-primary" /> Endereço Padrão
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input 
                    className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all font-bold text-primary" 
                    placeholder="CEP" 
                    value={formData.address_zip}
                    onChange={e => setFormData({...formData, address_zip: e.target.value})}
                  />
                  <input 
                    className="md:col-span-2 w-full px-4 py-3 rounded-xl border border-border bg-white focus:ring-2 focus:ring-primary/20 outline-none transition-all" 
                    placeholder="Rua / Avenida" 
                    value={formData.address_street}
                    onChange={e => setFormData({...formData, address_street: e.target.value})}
                  />
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white" 
                    placeholder="Número" 
                    value={formData.address_number}
                    onChange={e => setFormData({...formData, address_number: e.target.value})}
                  />
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white" 
                    placeholder="Complemento" 
                    value={formData.address_complement}
                    onChange={e => setFormData({...formData, address_complement: e.target.value})}
                  />
                  <input 
                    className="w-full px-4 py-3 rounded-xl border border-border bg-white" 
                    placeholder="Bairro" 
                    value={formData.address_district}
                    onChange={e => setFormData({...formData, address_district: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white" 
                      placeholder="Cidade" 
                      value={formData.address_city}
                      onChange={e => setFormData({...formData, address_city: e.target.value})}
                    />
                    <input 
                      className="w-full px-4 py-3 rounded-xl border border-border bg-white" 
                      placeholder="Estado (UF)" 
                      value={formData.address_state}
                      onChange={e => setFormData({...formData, address_state: e.target.value})}
                    />
                  </div>
                </div>
              </div>

              <div className="pt-6">
                <Button 
                  onClick={handleSave} 
                  disabled={saving}
                  className="w-full py-7 rounded-2xl text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-3 transition-all active:scale-95"
                >
                  {saving ? (
                    <><Loader2 className="animate-spin" size={20} /> Salvando...</>
                  ) : (
                    "Salvar Alterações"
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Profile;
