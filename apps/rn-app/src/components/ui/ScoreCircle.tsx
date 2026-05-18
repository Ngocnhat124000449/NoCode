import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { typography } from '../../theme/tokens';
import { getRiskFromScore, getRiskColors, getRiskLabel } from '../../utils/riskUtils';

interface ScoreCircleProps {
  score: number;
  size?: number;
  strokeWidth?: number;
  animated?: boolean;
  testID?: string;
}

export function ScoreCircle({ score, size = 80, strokeWidth = 6, animated = true, testID }: ScoreCircleProps) {
  const { theme } = useTheme();
  const level = getRiskFromScore(score);
  const { color } = getRiskColors(level, theme);
  const label = getRiskLabel(level);

  const animVal = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (animated) {
      Animated.timing(animVal, { toValue: score, duration: 800, useNativeDriver: false }).start();
    } else {
      animVal.setValue(score);
    }
  }, [score, animated, animVal]);

  const innerSize = size - strokeWidth * 2;

  return (
    <View testID={testID} style={[styles.container, { width: size, height: size, borderRadius: size / 2 }]}>
      <View
        style={[
          styles.ring,
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            borderWidth: strokeWidth,
            borderColor: color,
          },
        ]}
      />
      <View style={styles.center}>
        <Text style={[typography.h2, { color: theme.colors.textPrimary, lineHeight: 28 }]}>
          {score}
        </Text>
        <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { alignItems: 'center', justifyContent: 'center' },
  ring:      { position: 'absolute' },
  center:    { alignItems: 'center' },
});
