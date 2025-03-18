import React from 'react';
import { Text as RNText } from 'react-native';
import theme from '../theme';

export default function Text({ style, children, ...props }) {
  return (
    <RNText style={[theme.typography.body, style]} {...props}>
      {children}
    </RNText>
  );
}
