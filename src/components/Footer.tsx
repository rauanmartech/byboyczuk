import { Link } from "react-router-dom";
import { Mail } from "lucide-react";
import ButterflyIcon from "./ButterflyIcon";
import imagologo from "@/assets/nerine_clube.webp";

const Footer = () => (
  <footer className="bg-card border-t border-border">
    <div className="container mx-auto px-6 py-16">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
        <div>
          <img src={imagologo} alt="Nerine" className="h-10 w-auto object-contain mb-4" />
          <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
            Arte como espelho da alma — cada traço carrega um pedaço de sentimento que pede para ser visto.
          </p>
        </div>

        <div>
          <h4 className="font-display text-lg font-medium mb-4 text-foreground">Explorar</h4>
          <div className="flex flex-col gap-2">
            {[
              { to: "/portfolio", label: "Portfólio" },
              { to: "/loja", label: "Ateliê" },
              { to: "/clube", label: "Clube de Cartas Nerine" },
              { to: "/sobre", label: "Sobre a Artista" },
            ].map((link) => (
              <Link
                key={link.to}
                to={link.to}
                className="text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        <div>
          <h4 className="font-display text-lg font-medium mb-4 text-foreground">Conectar</h4>
          <div className="flex gap-4">
            <a
              href="https://www.instagram.com/byboyczuk/"
              target="_blank"
              rel="noopener noreferrer"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-sage-light transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-[18px] h-[18px]"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
            </a>
            <a
              href="mailto:boyczukrafaela@gmail.com"
              className="w-10 h-10 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-primary hover:bg-sage-light transition-colors"
            >
              <Mail size={18} />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-12 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
        <p className="text-xs text-muted-foreground">© 2024 Nerine. Todos os direitos reservados.</p>
        <ButterflyIcon className="w-5 h-5 text-blush-deep opacity-40" />
      </div>
    </div>
  </footer>
);

export default Footer;
