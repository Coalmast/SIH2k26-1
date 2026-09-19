import React from 'react';
import { TouchableOpacity, Text, TouchableOpacityProps } from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive';
  size?: 'sm' | 'md' | 'lg' | 'pill';
  children: React.ReactNode;
}

export function Button({ variant = 'primary', size = 'md', children, className = '', ...props }: ButtonProps) {
  const baseClasses = 'items-center justify-center';
  
  const variantClasses = {
    primary: 'bg-comet-orange',
    secondary: 'bg-comet-muted',
    outline: 'border border-comet-border bg-transparent',
    ghost: 'bg-transparent',
    destructive: 'bg-comet-down',
  };

  const textClasses = {
    primary: 'text-comet-canvas font-bold',
    secondary: 'text-comet-fg font-semibold',
    outline: 'text-comet-fg font-semibold',
    ghost: 'text-comet-orange font-semibold',
    destructive: 'text-white font-bold',
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
