import React from 'react';
import { View, Text, Pressable, StyleSheet } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Divider } from './Card';

interface ListItemProps {
  title: string;
  subtitle?: string;
  left?: React.ReactNode;
  right?: React.ReactNode;
  onPress?: () => void;
  divider?: boolean;
  testID?: string;
}

export function ListItem({ title, subtitle, left, right, onPress, divider, testID }: ListItemProps) {
  const { theme } = useTheme();

  const content = (
    <View testID={testID} style={styles.container}>
      {left && <View style={styles.left}>{left}</View>}
      <View style={styles.body}>
        <Text style={[typography.bodySmall, { fontWeight: '500', color: theme.colors.textPrimary }]}>
          {title}
        </Text>
        {subtitle ? (
          <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: 2 }]}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right && <View style={styles.right}>{right}</View>}
    </View>
  );

  return (
    <>
      {onPress
        ? (
          <Pressable
            android_ripple={{ color: theme.colors.overlay }}
            onPress={onPress}>
            {content}
          </Pressable>
        )
        : content
      }
      {divider && <Divider />}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  left:  { marginRight: spacing.md },
  body:  { flex: 1 },
  right: { marginLeft: spacing.sm },
});
