import React from 'react';
import { View, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius } from '../../theme/tokens';

interface CardProps {
  children: React.ReactNode;
  padding?: keyof typeof spacing;
  borderRadius?: keyof typeof radius;
  onPress?: () => void;
  style?: ViewStyle;
  testID?: string;
}

export function Card({ children, padding = 'lg', borderRadius = 'lg', onPress, style, testID }: CardProps) {
  const { theme } = useTheme();

  const cardStyle: ViewStyle = {
    backgroundColor: theme.colors.bgPrimary,
    borderRadius: radius[borderRadius],
    borderWidth: 0.5,
    borderColor: theme.colors.borderLight,
    padding: spacing[padding],
    ...(theme.dark ? {} : {
      shadowColor: '#000',
      shadowOpacity: 0.06,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
    }),
  };

  if (onPress) {
    return (
      <Pressable
        testID={testID}
        onPress={onPress}
        android_ripple={{ color: theme.colors.overlay }}
        style={[cardStyle, style]}>
        {children}
      </Pressable>
    );
  }

  return (
    <View testID={testID} style={[cardStyle, style]}>
      {children}
    </View>
  );
}

export function Divider({ style }: { style?: ViewStyle }) {
  const { theme } = useTheme();
  return <View style={[{ height: 0.5, backgroundColor: theme.colors.borderLight }, style]} />;
}

export function Row({ children, style, ...props }: { children: React.ReactNode; style?: ViewStyle; [key: string]: any }) {
  return <View style={[{ flexDirection: 'row' }, style]} {...props}>{children}</View>;
}
