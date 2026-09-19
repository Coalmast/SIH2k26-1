import React from 'react';
import { View, ViewProps } from 'react-native';

interface CardProps extends ViewProps {
  elevated?: boolean;
}

export function Card({ elevated = false, children, className = '', ...props }: CardProps) {
  const baseClasses = 'rounded-lg p-6 border border-comet-border';
  const surfaceClasses = elevated ? 'bg-comet-muted' : 'bg-comet-card';

  return (
    <View className={`${baseClasses} ${surfaceClasses} ${className}`} {...props}>
      {children}
    </View>
  );
}
