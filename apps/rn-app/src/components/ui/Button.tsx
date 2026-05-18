import React from 'react';
import {
  Pressable, Text, ActivityIndicator,
  StyleSheet, ViewStyle, TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, typography } from '../../theme/tokens';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  leftIcon?: React.ReactNode;
  loading?: boolean;
  disabled?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
}

const heights = { sm: 36, md: 44, lg: 52 };
const fontSizes = { sm: 13, md: 15, lg: 16 };

export function Button({
  label, onPress, variant = 'primary', size = 'md',
  leftIcon, loading, disabled, fullWidth, style, testID,
}: ButtonProps) {
  const { theme } = useTheme();
  const c = theme.colors;

  const variantStyle: { container: ViewStyle; text: TextStyle } = {
    primary: {
      container: { backgroundColor: c.accent, borderWidth: 0 },
      text: { color: c.textInverse },
    },
    outline: {
      container: { backgroundColor: 'transparent', borderWidth: 1.5, borderColor: c.borderMedium },
      text: { color: c.textPrimary },
    },
    ghost: {
      container: { backgroundColor: 'transparent', borderWidth: 0 },
      text: { color: c.accent },
    },
    danger: {
      container: { backgroundColor: c.riskHighBg, borderWidth: 1.5, borderColor: c.riskHigh },
      text: { color: c.riskHighText },
    },
  }[variant];

  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={disabled || loading}
      android_ripple={{ color: c.overlay }}
      style={({ pressed }) => [
        styles.base,
        { height: heights[size], borderRadius: radius.full },
        variantStyle.container,
        fullWidth && styles.fullWidth,
        (disabled || loading) && styles.disabled,
        pressed && { opacity: 0.8 },
        style,
      ]}>
      {loading
        ? <ActivityIndicator color={variantStyle.text.color as string} size="small" />
        : <>
            {leftIcon}
            <Text style={[typography.body, variantStyle.text, { fontSize: fontSizes[size] }]}>
              {label}
            </Text>
          </>
      }
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base:      { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.lg, gap: spacing.sm },
  fullWidth: { alignSelf: 'stretch' },
  disabled:  { opacity: 0.5 },
});
