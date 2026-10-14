import React from 'react';
import { motion } from 'motion/react';

interface AnimatedButtonProps {
  children: React.ReactNode;
  onClick?: (e: React.MouseEvent<HTMLButtonElement>) => void;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
  disabled?: boolean;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'glass';
  animationType?: 'spring' | 'scale' | 'magnetic' | 'pill';
  title?: string;
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  onClick,
  className = '',
  type = 'button',
  disabled = false,
  variant = 'primary',
  animationType = 'spring',
  title
}) => {
  // Base creative micro-interactions using Framer Motion
  const getMotionProps = () => {
    if (disabled) return {};

    switch (animationType) {
      case 'pill':
        return {
          whileHover: { scale: 1.05, y: -1, rotate: -0.5 },
          whileTap: { scale: 0.95, y: 0, rotate: 0 },
          transition: { type: 'spring', stiffness: 500, damping: 15 }
        };
      case 'magnetic':
        return {
          whileHover: { scale: 1.06, y: -2, shadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)' },
          whileTap: { scale: 0.94, y: 0 },
          transition: { type: 'spring', stiffness: 400, damping: 18 }
        };
      case 'scale':
        return {
          whileHover: { scale: 1.03 },
          whileTap: { scale: 0.97 },
          transition: { duration: 0.15 }
        };
      case 'spring':
      default:
        return {
          whileHover: { scale: 1.04, y: -1.5 },
          whileTap: { scale: 0.96, y: 0 },
          transition: { type: 'spring', stiffness: 450, damping: 20 }
        };
    }
  };

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled}
      title={title}
      {...getMotionProps()}
      className={`relative overflow-hidden cursor-pointer select-none transition-shadow duration-300 group ${className}`}
    >
      {/* Light Sheen Refraction Wave on Hover */}
      {!disabled && (
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out pointer-events-none"
          style={{ transform: 'skewX(-20deg)' }}
        />
      )}
      
      {/* Button Content */}
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>
    </motion.button>
  );
};
