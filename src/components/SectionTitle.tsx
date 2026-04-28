import { motion } from "framer-motion";
import ButterflyIcon from "./ButterflyIcon";

interface SectionTitleProps {
  title: string;
  subtitle?: string;
}

const SectionTitle = ({ title, subtitle }: SectionTitleProps) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="text-center mb-16"
  >
    <div className="ornament-divider mb-6">
      <ButterflyIcon className="w-5 h-5 text-blush-deep" />
    </div>
    <h2 className="font-display text-4xl md:text-5xl font-semibold text-foreground">{title}</h2>
    {subtitle && (
      <p className="mt-4 text-muted-foreground max-w-lg mx-auto leading-relaxed italic">{subtitle}</p>
    )}
  </motion.div>
);

export default SectionTitle;
