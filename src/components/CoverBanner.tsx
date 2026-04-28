import { motion } from "framer-motion";

import coelhoImg from "@/assets/coelho.webp";
import daliasImg from "@/assets/dalias.webp";
import ventosImg from "@/assets/ventos.webp";
import meninaMariposaImg from "@/assets/menina_mariposa.webp";
import paisagemImg from "@/assets/paisagem.webp";
import veadoImg from "@/assets/veado.webp";

interface CoverBannerProps {
  titleTop: string;
  titleBottom: string;
  subtitle?: string;
  singleLine?: boolean;
}

const CoverBanner = ({ titleTop, titleBottom, subtitle, singleLine }: CoverBannerProps) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="mb-16 w-full flex flex-col lg:flex-row items-center gap-12 lg:gap-16"
    >
      {/* Esquerda: Título Gigante */}
      <div className={`flex-1 flex flex-col justify-center z-10 w-full ${singleLine ? "items-start text-left" : "items-center lg:items-start text-center lg:text-left"}`}>
        <h1 className={`font-display font-bold leading-[0.8] tracking-tighter flex ${singleLine ? "flex-row" : "flex-col"}`}>
          <span className="text-[6rem] md:text-[8rem] lg:text-[9rem] xl:text-[11rem] text-primary drop-shadow-sm">
            {titleTop}
          </span>
          <span className={`text-[6rem] md:text-[8rem] lg:text-[9rem] xl:text-[11rem] text-blush-deep drop-shadow-sm ${!singleLine ? "lg:ml-16" : ""}`}>
            {titleBottom}
          </span>
        </h1>
        {subtitle && (
          <p className={`mt-8 md:mt-12 text-xl text-muted-foreground italic max-w-sm ${!singleLine ? "lg:ml-6" : ""}`}>
            {subtitle}
          </p>
        )}
      </div>

      {/* Direita: Grid Regular de Quadrados (2 linhas, 3 colunas) */}
      <div className="flex-1 w-full max-w-2xl mx-auto lg:max-w-none">
        <div className="grid grid-cols-3 gap-3 md:gap-4">
          {[
            meninaMariposaImg,
            ventosImg,
            coelhoImg,
            daliasImg,
            paisagemImg,
            veadoImg
          ].map((img, index) => (
            <div key={index} className="aspect-square overflow-hidden rounded-xl md:rounded-2xl shadow-sm">
              <img 
                src={img} 
                alt={`Arte ${index + 1}`} 
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700 ease-out" 
              />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default CoverBanner;
