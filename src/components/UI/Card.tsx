import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
  variant?: 'default' | 'glass' | 'gradient' | 'solid';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  hover = false,
  onClick,
  variant = 'default',
  padding = 'md',
}) => {
  const Component = onClick ? motion.div : 'div';
  
  const variants = {
    default: 'bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl',
    glass: 'bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl',
    gradient: 'bg-gradient-to-br from-white/20 to-white/5 backdrop-blur-xl border border-white/20 shadow-2xl',
    solid: 'bg-white shadow-xl border border-gray-200',
  };

  const paddings = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
    xl: 'p-10',
  };
  
  return (
    <Component
      className={clsx(
        'rounded-3xl transition-all duration-500',
        variants[variant],
        paddings[padding],
        {
          'cursor-pointer': onClick,
          'hover:scale-105 hover:shadow-purple-500/20': hover,
        },
        className
      )}
      onClick={onClick}
      whileHover={onClick ? { y: -5, scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ duration: 0.3 }}
    >
      {children}
    </Component>
  );
};