import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ShoppingBag, User as UserIcon, Package, Settings, LogOut } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import imagologo from "@/assets/nerine_imagotipo.webp";
import clubeLogo from "@/assets/nerine_clube.webp";

const links = [
  { to: "/", label: "Início" },
  { to: "/portfolio", label: "Portfólio" },
  { to: "/loja", label: "Ateliê" },
  { to: "/clube", label: "Clube de Cartas" },
  { to: "/sobre", label: "Sobre" },
  { to: "/contato", label: "Contato" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const { totalItems, setCartOpen } = useCart();
  const { user, signOut } = useAuth();

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || "??";

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-background/80 backdrop-blur-md border-b border-border/50">
      <div className="container mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3">
          <img src={imagologo} alt="Nerine" className="h-8 w-auto object-contain" />
          <img src={clubeLogo} alt="Clube de Cartas Nerine" className="h-8 w-auto object-contain" />
        </Link>

        <div className="hidden md:flex items-center gap-8">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`text-sm tracking-wide transition-colors hover:text-primary ${
                location.pathname === link.to ? "text-primary font-medium" : "text-muted-foreground"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Carrinho e Menu — mobile/desktop */}
        <div className="flex items-center gap-4">
          <button 
            onClick={() => setCartOpen(true)}
            className="relative p-2 rounded-full hover:bg-muted transition-colors group"
            aria-label="Ver Carrinho"
          >
            <ShoppingBag size={22} className="text-muted-foreground group-hover:text-primary transition-colors" />
            {totalItems > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-0 right-0 w-5 h-5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full flex items-center justify-center shadow-sm"
              >
                {totalItems}
              </motion.span>
            )}
          </button>

          <div className="hidden md:flex items-center gap-2">
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger className="outline-none">
                  <div className="flex items-center gap-3 p-1 pr-3 rounded-full border border-border bg-muted/30 hover:bg-muted/50 transition-colors">
                    <Avatar className="h-8 w-8 border border-primary/20">
                      <AvatarImage src={user.user_metadata?.avatar_url} />
                      <AvatarFallback className="bg-primary text-primary-foreground text-[10px] font-bold">
                        {userInitials}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-xs font-medium text-foreground max-w-[100px] truncate">
                      {user.user_metadata?.full_name || "Minha Conta"}
                    </span>
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 mt-2 rounded-2xl p-2 shadow-dreamy border-border/60">
                  <DropdownMenuLabel className="px-3 py-2 text-xs text-muted-foreground uppercase tracking-widest font-bold">
                    Painel do Cliente
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta/pedidos" className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl">
                      <Package size={16} /> Meus Pedidos
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link to="/minha-conta/perfil" className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl">
                      <Settings size={16} /> Editar Informações
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => signOut()}
                    className="flex items-center gap-2 cursor-pointer p-2.5 rounded-xl text-destructive focus:text-destructive focus:bg-destructive/5"
                  >
                    <LogOut size={16} /> Sair da conta
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link
                to="/login"
                className="px-5 py-2 rounded-full border border-primary/40 text-sm text-primary tracking-wide hover:bg-primary hover:text-primary-foreground transition-all duration-300"
              >
                Área do cliente
              </Link>
            )}
          </div>

          <button
            onClick={() => setOpen(!open)}
            className="md:hidden text-foreground p-2"
            aria-label="Menu"
          >
            {open ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-background border-b border-border overflow-hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-4">
              {links.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setOpen(false)}
                  className={`text-sm tracking-wide py-2 transition-colors ${
                    location.pathname === link.to ? "text-primary font-medium" : "text-muted-foreground"
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to="/login"
                onClick={() => setOpen(false)}
                className="text-sm tracking-wide py-2.5 px-4 rounded-full bg-primary/10 text-primary font-medium text-center transition-colors hover:bg-primary/20"
              >
                {user ? "Minha conta" : "Área do cliente"}
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
