import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { DoorOpen, LayoutDashboard } from "lucide-react";
import { supabase } from "@/lib/supabase/client";

const AdminPortal = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isAdmin, setIsAdmin] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsAdmin(false);
        return;
      }

      // Hardcoded check for the admin master as discussed
      if (user.email === 'boyczukrafaela@gmail.com') {
        setIsAdmin(true);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", user.id)
        .single();

      setIsAdmin(profile?.role === "admin");
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user?.email === 'boyczukrafaela@gmail.com') {
        setIsAdmin(true);
      } else if (session?.user) {
        // Re-check profile role if needed
        checkUser();
      } else {
        setIsAdmin(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (!isAdmin) return null;

  const isInAdmin = location.pathname.startsWith("/admin");
  const targetPath = isInAdmin ? "/" : "/admin";

  return (
    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-[100]">
      <motion.button
        onClick={() => navigate(targetPath)}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="relative group flex items-center gap-3 px-6 py-3 rounded-full bg-rose-50/30 backdrop-blur-xl border border-rose-200/40 shadow-dreamy text-foreground"
      >
        <div className="relative flex items-center gap-2 font-display text-sm font-medium tracking-wide">
          <AnimatePresence mode="wait">
            {isInAdmin ? (
              <motion.div
                key="to-site"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <DoorOpen size={18} className="text-primary" />
                <span>Voltar ao site</span>
              </motion.div>
            ) : (
              <motion.div
                key="to-admin"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center gap-2"
              >
                <LayoutDashboard size={18} className="text-primary" />
                <span>Painel Admin</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Ornamentos sutis */}
        <div className="absolute top-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
        <div className="absolute bottom-0 left-1/4 w-1/2 h-[1px] bg-gradient-to-r from-transparent via-white/40 to-transparent" />
      </motion.button>
    </div>
  );
};

export default AdminPortal;
