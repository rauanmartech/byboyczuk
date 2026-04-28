import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { CartProvider } from "./context/CartContext";
import { AuthProvider } from "./context/AuthContext";
import { CheckoutProvider } from "./context/CheckoutContext";
import AdminPortal from "./components/AdminPortal";
import CartSidebar from "./components/CartSidebar";
import CartFloatingButton from "./components/CartFloatingButton";
import ScrollToTop from "./components/ScrollToTop";

/* ─── Code Splitting & Lazy Loading ─── */
const Index = lazy(() => import("./pages/Index"));
const Portfolio = lazy(() => import("./pages/Portfolio"));
const Shop = lazy(() => import("./pages/Shop"));
const Club = lazy(() => import("./pages/Club"));
const ClubSubscribe = lazy(() => import("./pages/ClubSubscribe"));
const About = lazy(() => import("./pages/About"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Admin = lazy(() => import("./pages/Admin"));
const Orders = lazy(() => import("./pages/Orders"));
const Profile = lazy(() => import("./pages/Profile"));
const Checkout = lazy(() => import("./pages/Checkout"));
const Success = lazy(() => import("./pages/Success"));
const PayOrder = lazy(() => import("./pages/PayOrder"));
const NotFound = lazy(() => import("./pages/NotFound"));

/* ─── Cache & Inteligência de Background ─── */
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Apenas atualiza em background de 5 em 5 minutos (Evita refetch desnecessário)
      refetchOnWindowFocus: false, // Menos requisições fantasmas
      retry: 1, // Se der erro, tenta só mais 1x invés de spammar a rede
    },
  },
});

/* ─── Fallback Loader Global ─── */
const PageLoader = () => (
  <div className="min-h-screen flex items-center justify-center bg-background">
    <div className="animate-pulse flex flex-col items-center gap-4">
      <div className="w-10 h-10 border-4 border-blush-deep/20 border-t-blush-deep rounded-full animate-spin"></div>
      <p className="text-muted-foreground tracking-widest text-[10px] uppercase">Lendo canvas...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <CartProvider>
        <CheckoutProvider>
          <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ScrollToTop />
          <AdminPortal />
          <CartSidebar />
          <CartFloatingButton />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/portfolio" element={<Portfolio />} />
              <Route path="/loja" element={<Shop />} />
              <Route path="/clube" element={<Club />} />
              <Route path="/clube/assinar" element={<ClubSubscribe />} />
              <Route path="/clube/assinar/:editionId" element={<ClubSubscribe />} />
              <Route path="/minha-conta/pedidos" element={<Orders />} />
              <Route path="/minha-conta/perfil" element={<Profile />} />
              <Route path="/sobre" element={<About />} />
              <Route path="/contato" element={<Contact />} />
              <Route path="/login" element={<Login />} />
              <Route path="/checkout" element={<Checkout />} />
              <Route path="/sucesso" element={<Success />} />
              <Route path="/minha-conta/pedidos/:orderId/pagar" element={<PayOrder />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
      </CheckoutProvider>
    </CartProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
