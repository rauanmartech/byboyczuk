import { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/context/AuthContext";
import imagologo from "@/assets/nerine_imagologo.webp";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"login" | "register">("login");
  const navigate = useNavigate();
  const { signInWithGoogle } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === "login") {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;

        if (!data.user) throw new Error("Usuário não encontrado.");

        // Verificar role no banco de dados
        let { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single();

        if (profileError && profileError.code === "PGRST116") { 
          const { data: newProfile, error: createError } = await supabase
            .from("profiles")
            .insert([{ id: data.user.id, email: data.user.email, role: 'customer' }])
            .select("role")
            .single();
          
          if (!createError) profile = newProfile;
        }

        const isAdminEmail = data.user.email === 'boyczukrafaela@gmail.com';

        if (profile?.role === "admin" || isAdminEmail) {
          navigate("/admin");
        } else {
          navigate("/");
        }
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setError("Verifique seu e-mail para confirmar o cadastro.");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Ocorreu um erro. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-ethereal flex flex-col">
      <Navbar />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute rounded-full blur-3xl opacity-30"
          style={{
            width: "600px",
            height: "600px",
            background: "radial-gradient(circle, hsl(345 30% 85%), transparent 70%)",
            top: "-10%",
            right: "-10%",
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: "500px",
            height: "500px",
            background: "radial-gradient(circle, hsl(150 18% 42%), transparent 70%)",
            bottom: "10%",
            left: "-5%",
          }}
        />
      </div>

      <div className="flex-1 flex items-center justify-center px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="w-full max-w-md"
        >
          <div
            className="rounded-3xl border border-border/60 p-10 backdrop-blur-md shadow-dreamy"
            style={{
              background: "linear-gradient(145deg, hsl(36 33% 97% / 0.85), hsl(30 30% 95% / 0.75))",
            }}
          >
            <div className="text-center mb-10">
              <img
                src={imagologo}
                alt="Nerine"
                className="h-20 w-auto object-contain mx-auto mb-6"
              />
              <h1 className="font-display text-3xl font-semibold text-foreground tracking-wide">
                {mode === "login" ? "Bem-vinda de volta" : "Criar conta"}
              </h1>
              <p className="mt-2 text-sm text-muted-foreground italic">
                {mode === "login" ? "Entre no seu espaço Nerine" : "Junte-se à comunidade Nerine"}
              </p>
            </div>

            {/* Google Login */}
            <button
              type="button"
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 py-3 rounded-xl bg-white border border-border hover:bg-muted/30 transition-all active:scale-[0.98] mb-6 group"
            >
              <svg className="w-5 h-5 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              <span className="text-sm font-medium text-foreground">Acessar com Google</span>
            </button>

            <div className="ornament-divider mb-8">
              <span className="px-4 text-xs text-muted-foreground/60 tracking-widest uppercase">ou com e-mail</span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">E-mail</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-background/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-widest text-muted-foreground mb-2">Senha</label>
                <div className="relative">
                  <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-border bg-background/60 text-foreground text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {error && (
                <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-xs px-4 py-3 rounded-xl bg-red-50 text-red-600 border border-red-200">
                  {error}
                </motion.p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground text-sm tracking-wide font-medium hover:bg-primary/90 transition-all disabled:opacity-60 mt-2"
              >
                {loading ? "Aguarde..." : mode === "login" ? "Entrar" : "Criar conta"}
              </button>
            </form>

            <p className="text-center text-sm text-muted-foreground mt-8">
              {mode === "login" ? (
                <>Ainda não tem conta? <button onClick={() => setMode("register")} className="text-primary font-medium">Criar conta</button></>
              ) : (
                <>Já tem conta? <button onClick={() => setMode("login")} className="text-primary font-medium">Entrar</button></>
              )}
            </p>

            <div className="text-center mt-6">
              <Link to="/" className="text-xs text-muted-foreground/60 hover:text-muted-foreground transition-colors tracking-wide">
                ← Voltar ao site
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
