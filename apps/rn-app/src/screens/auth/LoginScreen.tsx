import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AppInput } from '../../components/ui/AppInput';
import { Divider } from '../../components/ui/Card';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { isValidPhone } from '../../utils/riskUtils';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Login'>;

export function LoginScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { login, isLoading } = useAuth();
  const [phone, setPhone]       = useState('');
  const [password, setPassword] = useState('');
  const [phoneErr, setPhoneErr]   = useState('');
  const [passErr, setPassErr]     = useState('');
  const [apiErr, setApiErr]       = useState('');

  const handleLogin = async () => {
    setPhoneErr(''); setPassErr(''); setApiErr('');
    if (!isValidPhone(phone)) { setPhoneErr('Số điện thoại không hợp lệ'); return; }
    if (password.length < 8)  { setPassErr('Mật khẩu ít nhất 8 ký tự'); return; }
    try {
      await login(phone, password);
      navigation.replace('MainTabs');
    } catch (err: any) {
      setApiErr(err.message ?? 'Đăng nhập thất bại');
    }
  };

  return (
    <SafeAreaView testID="login-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <View style={[styles.logo, { backgroundColor: theme.colors.accentLight, borderRadius: radius.xl }]}>
            <Text style={{ fontSize: 36 }}>🛡️</Text>
          </View>
          <Text style={[typography.h2, { color: theme.colors.textPrimary, marginTop: spacing.lg }]}>
            Đăng nhập
          </Text>
          <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: spacing.xs }]}>
            Nhập số điện thoại để tiếp tục
          </Text>

          <AppInput
            label="Số điện thoại"
            placeholder="0901 234 567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={phoneErr}
            style={{ marginTop: spacing.xl }}
            testID="input-phone"
          />
          <AppInput
            label="Mật khẩu"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={passErr}
            style={{ marginTop: spacing.md }}
            testID="input-password"
          />

          <Text
            style={[typography.bodySmall, { color: theme.colors.accent, textAlign: 'right', marginTop: spacing.sm }]}
            onPress={() => navigation.navigate('ForgotPassword')}>
            Quên mật khẩu?
          </Text>

          {apiErr ? (
            <Text style={[typography.bodySmall, { color: theme.colors.danger, marginTop: spacing.sm }]}>
              {apiErr}
            </Text>
          ) : null}

          <Button
            label="Đăng nhập"
            onPress={handleLogin}
            variant="primary"
            fullWidth
            loading={isLoading}
            style={{ marginTop: spacing.xl }}
            testID="btn-login"
          />

          <View style={styles.dividerRow}>
            <Divider style={{ flex: 1 }} />
            <Text style={[typography.caption, { color: theme.colors.textSecondary, marginHorizontal: spacing.sm }]}>
              hoặc
            </Text>
            <Divider style={{ flex: 1 }} />
          </View>

          <Button
            label="Tạo tài khoản mới"
            onPress={() => navigation.navigate('Register')}
            variant="outline"
            fullWidth
            testID="btn-register"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  logo:       { width: 72, height: 72, alignItems: 'center', justifyContent: 'center' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: spacing.lg },
});
