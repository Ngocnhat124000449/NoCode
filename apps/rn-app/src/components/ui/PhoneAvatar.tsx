import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius } from '../../theme/tokens';
import { RiskLevel, getRiskColors } from '../../utils/riskUtils';

interface PhoneAvatarProps {
  riskLevel: RiskLevel;
  size?: number;
  testID?: string;
}

const iconMap: Record<RiskLevel, string> = {
  low:      '✓',
  medium:   '⏸',
  high:     '✕',
  critical: '⚠',
};

export function PhoneAvatar({ riskLevel, size = 44, testID }: PhoneAvatarProps) {
  const { theme } = useTheme();
  const { color, bg } = getRiskColors(riskLevel, theme);

  return (
    <View
      testID={testID}
      style={[
        styles.circle,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: bg,
          borderColor: color,
        },
      ]}>
      <Text style={{ fontSize: size * 0.4, color }}>
        {iconMap[riskLevel]}
      </Text>
    </View>
  );
}

export function Avatar({ initials, size = 44 }: { initials: string; size?: number }) {
  const { theme } = useTheme();
  return (
    <View style={[
      styles.circle,
      {
        width: size,
        height: size,
        borderRadius: radius.full,
        backgroundColor: theme.colors.accentLight,
      },
    ]}>
      <Text style={{ fontSize: size * 0.38, color: theme.colors.accentText, fontWeight: '600' }}>
        {initials}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
