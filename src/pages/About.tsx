import { motion } from "framer-motion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ButterflyIcon from "@/components/ButterflyIcon";
import artistImg from "@/assets/menina_mariposa.webp";

const About = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <div className="pt-32 pb-24 px-6">
      <div className="container mx-auto max-w-4xl">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-start">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
          >
            <img
              src={artistImg}
              alt="A artista Nerine"
              width={800}
              height={1024}
              className="rounded-xl shadow-dreamy w-full sticky top-32"
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="space-y-6"
          >
            <ButterflyIcon className="w-8 h-8 text-blush-deep" />
            <h1 className="font-display text-5xl font-semibold text-foreground">Sobre</h1>

            <p className="text-muted-foreground leading-relaxed">
              Eu comecei a pintar porque não sabia mais como falar sobre o que sentia. 
              As cores apareceram antes das palavras, e desde então nunca mais saíram.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Meu trabalho nasce de um lugar íntimo — daqueles pensamentos que aparecem 
              às 3 da manhã, dos sentimentos que não cabem numa frase só, das perguntas 
              que a gente carrega sem resposta. Eu pinto o que transborda.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              Uso aquarela, óleo e técnica mista porque gosto do imprevisível. Gosto 
              quando a tinta faz algo que eu não planejei. Tem algo bonito em não 
              controlar tudo — na arte e na vida.
            </p>

            <p className="text-muted-foreground leading-relaxed">
              As mariposas aparecem em quase tudo que faço. Elas me lembram que 
              transformação não é bonita enquanto acontece — mas o que vem depois, 
              é sempre inesperado.
            </p>

            <p className="text-muted-foreground leading-relaxed italic">
              "Se uma obra minha te fez sentir alguma coisa, então ela fez exatamente 
              o que eu queria."
            </p>

            <div className="pt-6 border-t border-border">
              <p className="text-sm text-muted-foreground">
                Baseada no Brasil · Criando desde 2019
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
    <Footer />
  </div>
);

export default About;
