import React from 'react';
import { motion } from 'motion/react';
import { Heart } from 'lucide-react';

interface AnimatedDonateButtonProps {
  onClick: () => void;
  variant?: 'primary' | 'header' | 'hero' | 'card' | 'floating';
  label?: string;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showSparkle?: boolean;
}

export const AnimatedDonateButton: React.FC<AnimatedDonateButtonProps> = ({
  onClick,
  variant = 'primary',
  label = 'Donate',
  className = '',
  size = 'md'
}) => {
  // Variant styles
  const baseStyles = 'relative overflow-hidden flex items-center justify-center gap-2 cursor-pointer font-extrabold select-none transition-shadow';

  const variantStyles = {
    header: 'px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-600 via-rose-600 to-rose-700 text-white shadow-xs hover:shadow-lg hover:shadow-rose-600/30 text-xs hover:brightness-110',
    hero: 'py-3 px-6 rounded-full bg-slate-950 hover:bg-slate-900 text-white shadow-lg shadow-slate-900/20 hover:shadow-slate-900/40 text-xs sm:text-sm border border-slate-800 hover:border-slate-700 hover:brightness-110',
    primary: 'py-2.5 px-5 rounded-full bg-gradient-to-r from-rose-600 via-rose-700 to-amber-600 text-white shadow-md hover:shadow-xl hover:shadow-rose-600/40 text-xs hover:brightness-110',
    card: 'w-full py-2.5 rounded-xl bg-slate-950 hover:bg-slate-900 text-white text-xs shadow-xs hover:shadow-md hover:brightness-110',
    floating: 'p-3.5 rounded-full bg-rose-600 text-white shadow-xl hover:shadow-rose-600/50 text-sm border-2 border-white/20 hover:brightness-110'
  };

  const sizeStyles = {
    sm: 'text-xs px-3 py-1.5',
    md: 'text-xs px-4 py-2.5',
    lg: 'text-sm px-6 py-3'
  };

  // Combine styles if specific size override requested
  const appliedStyle = className || `${baseStyles} ${variantStyles[variant]}`;

  return (
    <motion.button
      type="button"
      onClick={onClick}
      whileHover={{ scale: 1.04, y: -1 }}
      whileTap={{ scale: 0.96 }}
      transition={{ type: 'spring', stiffness: 450, damping: 22 }}
      className={`group ${appliedStyle}`}
    >
      {/* Animated Light Sheen Overlay on Hover */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out pointer-events-none"
      />

      {/* Heart Icon with Pulse Animation */}
      <motion.div
        animate={{
          scale: [1, 1.25, 1, 1.18, 1]
        }}
        transition={{
          repeat: Infinity,
          duration: 2.2,
          ease: 'easeInOut',
          repeatDelay: 1
        }}
        className="shrink-0 flex items-center justify-center group-hover:scale-125 transition-transform duration-200"
      >
        <Heart className="w-3.5 h-3.5 text-rose-300 fill-rose-500 group-hover:fill-rose-300 transition-colors" />
      </motion.div>

      {/* Label */}
      <span className="relative z-10 tracking-wide font-bold">{label}</span>
    </motion.button>
  );
};
