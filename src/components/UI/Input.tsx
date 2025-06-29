import React from 'react';
import { motion } from 'framer-motion';
import { clsx } from 'clsx';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  icon?: React.ReactNode;
  variant?: 'default' | 'glass' | 'solid';
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  helperText,
  icon,
  variant = 'default',
  className,
  id,
  ...props
}) => {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
  const [isFocused, setIsFocused] = React.useState(false);

  const variants = {
    default: 'bg-white/10 backdrop-blur-md border border-white/30 text-white placeholder-white/50 focus:border-purple-500 focus:bg-white/20',
    glass: 'bg-white/5 backdrop-blur-xl border border-white/20 text-white placeholder-white/40 focus:border-pink-500 focus:bg-white/10',
    solid: 'bg-white border border-gray-300 text-gray-900 placeholder-gray-400 focus:border-purple-500 focus:bg-white',
  };

  return (
    <div className="w-full">
      {label && (
        <motion.label
          htmlFor={inputId}
          className={clsx(
            'block text-sm font-semibold mb-2 transition-colors duration-200',
            variant === 'solid' ? 'text-gray-700' : 'text-white',
            error ? 'text-red-400' : isFocused ? 'text-purple-400' : ''
          )}
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {label}
        </motion.label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/50">
            {icon}
          </div>
        )}
        
        <motion.input
          id={inputId}
          className={clsx(
            'block w-full px-4 py-4 rounded-2xl shadow-lg transition-all duration-300',
            'focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:scale-105',
            variants[variant],
            {
              'border-red-400 focus:border-red-500 focus:ring-red-500/50': error,
              'pl-12': icon,
            },
            className
          )}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
        
        {/* Glow effect on focus */}
        {isFocused && (
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 -z-10"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1.1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.3 }}
          />
        )}
      </div>
      
      {error && (
        <motion.p
          className="mt-2 text-sm text-red-400 font-medium"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <motion.p
          className={clsx(
            'mt-2 text-sm font-medium',
            variant === 'solid' ? 'text-gray-500' : 'text-white/60'
          )}
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {helperText}
        </motion.p>
      )}
    </div>
  );
};