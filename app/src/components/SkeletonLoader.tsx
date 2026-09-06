import React, { useEffect } from 'react';
import { View } from 'react-native';
import Animated, { useSharedValue, useAnimatedStyle, withRepeat, withTiming, Easing, withSequence } from 'react-native-reanimated';

export function SkeletonLoader() {
  const opacity = useSharedValue(0.3);

  useEffect(() => {
    opacity.value = withRepeat(
      withSequence(
        withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
        withTiming(0.3, { duration: 800, easing: Easing.inOut(Easing.ease) })
      ),
      -1,
      true
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <View className="gap-4 w-full p-4">
      <Animated.View className="h-6 bg-[#2b3139] rounded-md w-3/4" style={animatedStyle} />
      <Animated.View className="h-4 bg-[#2b3139] rounded-md w-full" style={animatedStyle} />
      <Animated.View className="h-4 bg-[#2b3139] rounded-md w-5/6" style={animatedStyle} />
      <Animated.View className="h-4 bg-[#2b3139] rounded-md w-4/6" style={animatedStyle} />
      
      <View className="mt-6 gap-4">
        <Animated.View className="h-6 bg-[#2b3139] rounded-md w-1/2" style={animatedStyle} />
        <Animated.View className="h-32 bg-[#2b3139] rounded-xl w-full" style={animatedStyle} />
      </View>
    </View>
  );
}
