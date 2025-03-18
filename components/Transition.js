import React, { useEffect, useRef } from 'react';
import { Animated } from 'react-native';

const Transitions = ({ children, type = 'fade', duration = 300 }) => {
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration,
      useNativeDriver: true,
    }).start();
  }, [opacity]);

  return (
    <Animated.View
      style={{
        opacity,
      }}
    >
      {children}
    </Animated.View>
  );
};

export default Transitions;