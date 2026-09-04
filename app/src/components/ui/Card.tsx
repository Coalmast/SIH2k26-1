import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, children, className = '', ...props }: CardProps) {
  const baseClasses = 'rounded-xl p-6';
  const surfaceClasses = elevated ? 'bg-binance-surface-elevated-dark' : 'bg-binance-surface-card-dark';

  return (
    <View className={`${baseClasses} ${surfaceClasses} ${className}`} {...props}>
      {children}
    </View>
  );
}
