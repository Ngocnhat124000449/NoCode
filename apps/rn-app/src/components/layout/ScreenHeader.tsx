import React from 'react';
import { View, Text, Pressable, StyleSheet, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';

interface ScreenHeaderProps {
  title?: string;
  subtitle?: string;
  leftAction?: 'back' | 'close' | 'none' | React.ReactNode;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  testID?: string;
}

export function ScreenHeader({
  title, subtitle, leftAction, rightAction, transparent, testID,
}: ScreenHeaderProps) {
  const { theme } = useTheme();
  const navigation = useNavigation();

  const bg = transparent ? 'transparent' : theme.colors.bgPrimary;

  return (
    <>
      <StatusBar
        barStyle={theme.dark ? 'light-content' : 'dark-content'}
        backgroundColor={transparent ? 'transparent' : theme.colors.bgPrimary}
      />
      <View
        testID={testID}
        style={[
          styles.container,
          {
            backgroundColor: bg,
            borderBottomColor: transparent ? 'transparent' : theme.colors.borderLight,
            borderBottomWidth: transparent ? 0 : 0.5,
          },
        ]}>
        <View style={styles.left}>
          {leftAction === 'back' && (
            <Pressable
              onPress={() => navigation.goBack()}
              android_ripple={{ color: theme.colors.overlay, borderless: true, radius: 20 }}
              style={styles.iconBtn}>
              <Text style={{ fontSize: 20, color: theme.colors.textPrimary }}>←</Text>
            </Pressable>
          )}
          {leftAction === 'close' && (
            <Pressable
              onPress={() => navigation.goBack()}
              android_ripple={{ color: theme.colors.overlay, borderless: true, radius: 20 }}
              style={styles.iconBtn}>
              <Text style={{ fontSize: 20, color: theme.colors.textPrimary }}>✕</Text>
            </Pressable>
          )}
          {React.isValidElement(leftAction) && leftAction}
        </View>

        <View style={styles.center}>
          {title ? (
            <Text style={[typography.h4, { color: theme.colors.textPrimary }]} numberOfLines={1}>
              {title}
            </Text>
          ) : null}
          {subtitle ? (
            <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
              {subtitle}
            </Text>
          ) : null}
        </View>

        <View style={styles.right}>
          {rightAction}
        </View>
      </View>
    </>
  );
}

export function SectionHeader({
  title, actionLabel, onAction, style,
}: {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  style?: object;
}) {
  const { theme } = useTheme();
  return (
    <View style={[styles.sectionRow, style]}>
      <Text style={[typography.h4, { color: theme.colors.textPrimary }]}>{title}</Text>
      {actionLabel && onAction && (
        <Pressable onPress={onAction}>
          <Text style={[typography.bodySmall, { color: theme.colors.accent }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

export function EmptyState({ icon, message }: { icon?: string; message: string }) {
  const { theme } = useTheme();
  return (
    <View style={styles.emptyState}>
      {icon && <Text style={{ fontSize: 40, marginBottom: spacing.md }}>{icon === 'phone-off' ? '📵' : '📋'}</Text>}
      <Text style={[typography.body, { color: theme.colors.textSecondary, textAlign: 'center' }]}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container:  { height: 56, flexDirection: 'row', alignItems: 'center', paddingHorizontal: spacing.sm },
  left:       { width: 56, alignItems: 'flex-start', justifyContent: 'center' },
  center:     { flex: 1, alignItems: 'center' },
  right:      { width: 56, alignItems: 'flex-end', justifyContent: 'center' },
  iconBtn:    { padding: spacing.sm },
  sectionRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  emptyState: { alignItems: 'center', padding: spacing.xxl },
});
