const ButterflyIcon = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    {/* Antenas */}
    <path d="M11.5 5.5 Q10 3 8.5 2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />
    <path d="M12.5 5.5 Q14 3 15.5 2" stroke="currentColor" strokeWidth="0.6" strokeLinecap="round" fill="none" />
    {/* Asa superior esquerda */}
    <path d="M12 6 C10 5 6 4 3 6 C1 8 1.5 11 4 12 C6 13 9 12 11 11 Z" />
    {/* Asa superior direita */}
    <path d="M12 6 C14 5 18 4 21 6 C23 8 22.5 11 20 12 C18 13 15 12 13 11 Z" />
    {/* Asa inferior esquerda */}
    <path d="M11 11 C9 12 5 13 4 16 C3 18 5 20 7 19 C9 18 11 15 11.5 13 Z" />
    {/* Asa inferior direita */}
    <path d="M13 11 C15 12 19 13 20 16 C21 18 19 20 17 19 C15 18 13 15 12.5 13 Z" />
    {/* Corpo */}
    <ellipse cx="12" cy="12" rx="0.8" ry="7" />
  </svg>
);

export default ButterflyIcon;
