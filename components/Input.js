import React from 'react';
import { View, TextInput, StyleSheet, Text } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import theme from '../theme';
import Select from './Select';

export default function Input({ 
  style, 
  icon, 
  iconSize = 20, 
  iconColor = theme.colors.secondary,
  label,
  type,
  options,
  ...props 
}) {
  if (type === 'select' && options) {
    return (
      <Select
        label={label}
        value={props.value}
        onValueChange={props.onChangeText}
        options={options}
        placeholder={props.placeholder}
      />
    );
  }

  return (
    <View style={styles.inputContainer}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View style={styles.container}>
        {icon && (
          <MaterialCommunityIcons 
            name={icon} 
            size={iconSize} 
            color={iconColor} 
            style={styles.icon} 
          />
        )}
        <TextInput
          style={[
            styles.input, 
            icon ? styles.inputWithIcon : null,
            style
          ]}
          placeholderTextColor={theme.colors.secondary}
          {...props}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: {
    marginBottom: theme.spacing.md,
  },
  label: {
    ...theme.typography.label,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: theme.colors.border,
    borderWidth: 1,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    ...theme.shadows.small,
  },
  icon: {
    marginLeft: theme.spacing.md,
  },
  input: {
    flex: 1,
    height: 50,
    paddingHorizontal: theme.spacing.md,
    color: theme.colors.text,
    ...theme.typography.body,
  },
  inputWithIcon: {
    paddingLeft: theme.spacing.sm,
  },
});
