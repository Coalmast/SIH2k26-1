import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import Animated, { useSharedValue, withTiming, useAnimatedProps, Easing } from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

interface RiskGaugeProps {
  score: number; // 0 to 100
}

export function RiskGauge({ score }: RiskGaugeProps) {
  const progress = useSharedValue(0);

  useEffect(() => {
    progress.value = withTiming(score, {
      duration: 1500,
      easing: Easing.out(Easing.cubic),
    });
  }, [score]);

  const radius = 80;
  const strokeWidth = 15;
  const cx = 100;
  const cy = 100;
  
  // Arc span: 135 to 405 degrees (270 degree sweep)
  const startAngle = 135;
  const endAngle = 405;
  
  const polarToCartesian = (centerX: number, centerY: number, radius: number, angleInDegrees: number) => {
    const angleInRadians = (angleInDegrees - 90) * Math.PI / 180.0;
    return {
      x: centerX + (radius * Math.cos(angleInRadians)),
      y: centerY + (radius * Math.sin(angleInRadians))
    };
  };

  const describeArc = (x: number, y: number, radius: number, startAngle: number, endAngle: number) => {
    const start = polarToCartesian(x, y, radius, endAngle);
    const end = polarToCartesian(x, y, radius, startAngle);
    const largeArcFlag = endAngle - startAngle <= 180 ? "0" : "1";
    return [
      "M", start.x, start.y, 
      "A", radius, radius, 0, largeArcFlag, 0, end.x, end.y
    ].join(" ");
  };

  const backgroundPath = describeArc(cx, cy, radius, startAngle, endAngle);
  const pathLength = radius * Math.PI * (270 / 180);

  const animatedProps = useAnimatedProps(() => {
    const fillLength = (progress.value / 100) * pathLength;
    return {
      strokeDashoffset: pathLength - fillLength,
    };
  });

  let riskColor = '#00C087'; // Binance Green (Low)
  let riskLabel = 'LOW RISK';
  if (score > 30) { riskColor = '#F3BA2F'; riskLabel = 'MEDIUM RISK'; } // Binance Yellow
  if (score > 60) { riskColor = '#F0B90B'; riskLabel = 'HIGH RISK'; }   // Orange-ish
  if (score > 80) { riskColor = '#F6465D'; riskLabel = 'CRITICAL'; }    // Binance Red

  return (
    <View className="items-center justify-center my-4">
      <Svg width={200} height={200} viewBox="0 0 200 200">
        <Path
          d={backgroundPath}
          fill="none"
          stroke="#2B3139"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <AnimatedPath
          d={backgroundPath}
          fill="none"
          stroke={riskColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={pathLength}
          animatedProps={animatedProps}
        />
      </Svg>
      <View className="absolute items-center justify-center">
        <Text className="text-white text-5xl font-bold">{score}</Text>
        <Text style={{ color: riskColor }} className="text-xs font-bold mt-1 tracking-widest">{riskLabel}</Text>
      </View>
    </View>
  );
}
