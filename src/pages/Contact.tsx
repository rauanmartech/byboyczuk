import { useState } from "react";
import { motion } from "framer-motion";
import { Send, MessageCircle } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SectionTitle from "@/components/SectionTitle";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase/client";

const Contact = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("contacts")
        .insert([form]);

      if (error) throw error;

      toast({ title: "Mensagem enviada ✨", description: "Obrigada pelo contato! Responderei em breve." });
      setForm({ name: "", email: "", phone: "", message: "" });
    } catch (err: any) {
      console.error("Erro completo do Supabase:", err);
      toast({ 
        title: "Erro ao enviar", 
        description: err.message || "Não foi possível enviar sua mensagem agora.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-32 pb-24 px-6">
        <div className="container mx-auto max-w-2xl">
          <SectionTitle
            title="Contato"
            subtitle="Adoraria ouvir você. Me conta o que sentiu."
          />

          <motion.form
            onSubmit={handleSubmit}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="space-y-6"
          >
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Nome</label>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
                className="bg-card"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">E-mail</label>
              <Input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
                className="bg-card"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Telefone / WhatsApp</label>
              <Input
                type="tel"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                placeholder="(00) 00000-0000"
                className="bg-card"
              />
            </div>
            <div>
              <label className="text-sm text-muted-foreground mb-2 block">Mensagem</label>
              <Textarea
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                required
                rows={5}
                className="bg-card resize-none"
              />
            </div>
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full gap-2 bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Send size={16} className={loading ? "animate-pulse" : ""} />
              {loading ? "Enviando..." : "Enviar"}
            </Button>
          </motion.form>

          <div className="mt-12 text-center">
            <div className="ornament-divider mb-8">
              <span className="text-xs text-muted-foreground px-4">ou</span>
            </div>
            <Button
              variant="outline"
              onClick={() => window.open("https://wa.me/5511992977126", "_blank")}
              className="gap-2"
            >
              <MessageCircle size={16} />
              Conversar pelo WhatsApp
            </Button>

            <div className="mt-8">
              <a
                href="https://www.instagram.com/byboyczuk/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                @byboyczuk no Instagram →
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
