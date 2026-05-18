import React from 'react';
import { Switch } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';

interface ToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
}

export function Toggle({ value, onValueChange, disabled }: ToggleProps) {
  const { theme } = useTheme();
  return (
    <Switch
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: theme.colors.borderMedium, true: theme.colors.accent }}
      thumbColor="#FFFFFF"
      ios_backgroundColor={theme.colors.borderMedium}
    />
  );
}
