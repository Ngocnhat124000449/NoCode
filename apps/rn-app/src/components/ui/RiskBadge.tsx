import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { radius, typography } from '../../theme/tokens';
import { RiskLevel, getRiskColors, getRiskLabel } from '../../utils/riskUtils';

interface RiskBadgeProps {
  level: RiskLevel;
  score?: number;
  size?: 'sm' | 'md';
  showLabel?: boolean;
  customLabel?: string;
  style?: object;
  testID?: string;
}

export function RiskBadge({
  level, score, size = 'sm', showLabel = true, customLabel, style, testID,
}: RiskBadgeProps) {
  const { theme } = useTheme();
  const { color, bg, text } = getRiskColors(level, theme);
  const isSm = size === 'sm';

  const label = customLabel ?? (score !== undefined
    ? `${score} · ${getRiskLabel(level)}`
    : getRiskLabel(level));

  return (
    <View
      testID={testID}
      style={[
        styles.pill,
        {
          backgroundColor: bg,
          borderColor: color,
          paddingVertical: isSm ? 3 : 5,
          paddingHorizontal: isSm ? 8 : 12,
        },
        style,
      ]}>
      {showLabel && (
        <Text style={[isSm ? typography.caption : typography.label, { color: text }]}>
          {label}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  pill: { borderRadius: radius.full, borderWidth: 1, alignSelf: 'flex-start' },
});
