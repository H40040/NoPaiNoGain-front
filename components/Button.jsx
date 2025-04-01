import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import theme from '../theme';

export default function Button({ onPress, disabled, variant, children }) {
  return (
    <TouchableOpacity
      onPress={onPress} // Certifique-se de que `onPress` está sendo usado aqui
      disabled={disabled}
      style={[
        styles.button,
        variant === 'outline' && styles.outlineButton,
        disabled && styles.disabledButton,
      ]}
    >
      <Text style={[styles.text, variant === 'outline' && styles.outlineText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    backgroundColor: theme.colors.primary,
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outlineButton: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  disabledButton: {
    backgroundColor: theme.colors.disabled,
  },
  text: {
    color: theme.colors.textOnPrimary,
    fontSize: 16,
  },
  outlineText: {
    color: theme.colors.primary,
  },
});