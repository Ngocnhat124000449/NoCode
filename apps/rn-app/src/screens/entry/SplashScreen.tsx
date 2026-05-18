import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Splash'>;

export function SplashScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  useEffect(() => {
    const timer = setTimeout(() => {
      // In production: check stored token + permissions
      navigation.replace('Onboarding');
    }, 1800);
    return () => clearTimeout(timer);
  }, [navigation]);

  return (
    <SafeAreaView
      testID="splash-screen"
      style={[styles.container, { backgroundColor: theme.colors.bgPrimary }]}>
      <View style={[styles.logo, { backgroundColor: theme.colors.accentLight, borderColor: theme.colors.accent }]}>
        <Text style={{ fontSize: 48 }}>🛡️</Text>
      </View>
      <Text style={[typography.h2, { color: theme.colors.textPrimary, marginTop: spacing.lg }]}>
        ScamShield
      </Text>
      <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: spacing.xs }]}>
        Bảo vệ bạn khỏi lừa đảo qua điện thoại
      </Text>
      <ActivityIndicator
        color={theme.colors.accent}
        style={{ marginTop: spacing.xxl }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  logo:      { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5 },
});
