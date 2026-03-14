import React from 'react';
import { TouchableOpacity, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';

interface AppButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
  disabled?: boolean;
  testID?: string;
}

const colors = {
  accent: '#4a9eff',
  secondary: '#3a3a3a',
  text: '#ffffff',
  disabledBg: '#2a2a2a',
  disabledText: '#666666',
};

export function AppButton({
  label,
  onPress,
  variant = 'primary',
  disabled = false,
  testID,
}: AppButtonProps) {
  const bgColor = disabled
    ? colors.disabledBg
    : variant === 'primary'
      ? colors.accent
      : colors.secondary;
  const textColor = disabled ? colors.disabledText : colors.text;

  return (
    <TouchableOpacity
      style={[styles.button, { backgroundColor: bgColor }]}
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.7}
      testID={testID}
    >
      <Text style={[styles.label, { color: textColor }]}>{label}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  } as ViewStyle,
  label: {
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  } as TextStyle,
});
