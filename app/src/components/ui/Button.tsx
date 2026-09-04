import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'trading-up' | 'trading-down';
  size?: 'sm' | 'md' | 'lg' | 'pill';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-binance-primary',
    secondary: 'bg-binance-surface-card-dark',
    outline: 'border border-binance-hairline-on-dark bg-transparent',
    ghost: 'bg-transparent',
    'trading-up': 'bg-binance-trading-up',
    'trading-down': 'bg-binance-trading-down',
  };

  const textClasses = {
    primary: 'text-binance-on-primary font-bold',
    secondary: 'text-binance-on-dark font-semibold',
    outline: 'text-binance-on-dark font-semibold',
    ghost: 'text-binance-primary font-semibold',
    'trading-up': 'text-binance-on-dark font-semibold',
    'trading-down': 'text-binance-on-dark font-semibold',
  };

  const sizeClasses = {
    sm: 'py-2 px-4 rounded-sm',
    md: 'py-3 px-6 rounded-md',
    lg: 'py-4 px-8 rounded-lg',
    pill: 'py-3 px-8 rounded-full',
  };

  const appliedVariant = variantClasses[variant];
  const appliedText = textClasses[variant];
  const appliedSize = sizeClasses[size];

  return (
    <TouchableOpacity
      className={`${baseClasses} ${appliedVariant} ${appliedSize} ${className}`}
      {...props}
    >
      {typeof children === 'string' ? (
        <Text className={appliedText}>{children}</Text>
      ) : (
        children
      )}
    </TouchableOpacity>
  );
}
