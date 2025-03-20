import React from 'react';
import { TouchableOpacity, Text, StyleSheet, View, ActivityIndicator, Platform } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import * as Haptics from 'expo-haptics';
import theme from '../theme';

// Função auxiliar para feedback tátil com verificação de plataforma
const triggerHaptic = (type) => {
  if (Platform.OS !== 'web') {
    try {
      switch (type) {
        case 'success':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'error':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
          break;
        case 'warning':
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
          break;
        case 'light':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        case 'medium':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'heavy':
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        default:
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      }
    } catch (error) {
      console.log('Haptics não disponível:', error);
    }
  }
};

export default function Button({ 
  title, 
  onPress, 
  disabled, 
  variant = 'primary', 
  style,
  textStyle,
  icon,
  iconSize = 20,
  loading = false,
  hapticType = 'medium'
}) {
  const getBackgroundColor = () => {
    if (disabled || loading) return theme.colors.border;
    switch (variant) {
      case 'secondary':
        return theme.colors.secondary;
      case 'outline':
        return 'transparent';
      default:
        return theme.colors.primary;
    }
  };

  const getTextColor = () => {
    if (disabled || loading) return theme.colors.textSecondary;
    if (variant === 'outline') return theme.colors.primary;
    return theme.colors.surface;
  };

  const getBorderColor = () => {
    if (variant === 'outline') {
      return disabled ? theme.colors.border : theme.colors.primary;
    }
    return 'transparent';
  };

  const handlePress = () => {
    triggerHaptic(hapticType);
    if (onPress) onPress();
  };

  return (
    <TouchableOpacity
      style={[
        styles.button,
        { 
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderWidth: variant === 'outline' ? 1 : 0,
        },
        style
      ]}
      onPress={handlePress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator color={getTextColor()} size="small" />
      ) : (
        <View style={styles.contentContainer}>
          {icon && (
            <MaterialCommunityIcons 
              name={icon} 
              size={iconSize} 
              color={getTextColor()} 
              style={styles.icon} 
            />
          )}
          <Text style={[
            styles.text, 
            { color: getTextColor() },
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    width: '100%',
    height: 50,
    borderRadius: theme.borderRadius.md,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
    ...theme.shadows.small,
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  icon: {
    marginRight: theme.spacing.sm,
  },
  text: {
    ...theme.typography.button,
  },
});
