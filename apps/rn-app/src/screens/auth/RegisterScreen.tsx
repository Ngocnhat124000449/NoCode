import React, { useState } from 'react';
import {
  View, Text, ScrollView, KeyboardAvoidingView,
  Platform, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AppInput } from '../../components/ui/AppInput';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { isValidPhone } from '../../utils/riskUtils';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Register'>;

export function RegisterScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { register, isLoading } = useAuth();
  const [name, setName]           = useState('');
  const [phone, setPhone]         = useState('');
  const [password, setPassword]   = useState('');
  const [confirm, setConfirm]     = useState('');
  const [terms, setTerms]         = useState(false);
  const [errors, setErrors]       = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim())             e.name     = 'Vui lòng nhập họ tên';
    if (!isValidPhone(phone))     e.phone    = 'Số điện thoại không hợp lệ';
    if (password.length < 8)      e.password = 'Mật khẩu ít nhất 8 ký tự';
    if (password !== confirm)     e.confirm  = 'Mật khẩu không khớp';
    if (!terms)                   e.terms    = 'Vui lòng đồng ý điều khoản';
    return e;
  };

  const handleRegister = async () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length > 0) return;
    try {
      await register(name, phone, password);
      navigation.replace('MainTabs');
    } catch (err: any) {
      setErrors(prev => ({ ...prev, api: err.message ?? 'Đăng ký thất bại' }));
    }
  };

  return (
    <SafeAreaView testID="register-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScreenHeader leftAction="back" title="Tạo tài khoản" />
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
          <AppInput
            label="Họ và tên"
            placeholder="Nguyễn Văn A"
            value={name}
            onChangeText={setName}
            error={errors.name}
            testID="input-name"
          />
          <AppInput
            label="Số điện thoại"
            placeholder="0901 234 567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            error={errors.phone}
            style={{ marginTop: spacing.md }}
            testID="input-phone"
          />
          <AppInput
            label="Mật khẩu"
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            error={errors.password}
            style={{ marginTop: spacing.md }}
            testID="input-password"
          />
          <AppInput
            label="Xác nhận mật khẩu"
            placeholder="••••••••"
            secureTextEntry
            value={confirm}
            onChangeText={setConfirm}
            error={errors.confirm}
            style={{ marginTop: spacing.md }}
            testID="input-confirm"
          />

          <Pressable
            testID="terms-checkbox"
            style={[styles.termsRow, { marginTop: spacing.lg }]}
            onPress={() => setTerms(t => !t)}>
            <View style={[
              styles.checkbox,
              {
                borderColor: errors.terms ? theme.colors.danger : theme.colors.borderMedium,
                backgroundColor: terms ? theme.colors.accent : 'transparent',
              },
            ]}>
              {terms && <Text style={{ color: '#fff', fontSize: 12 }}>✓</Text>}
            </View>
            <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, flex: 1 }]}>
              Tôi đồng ý với{' '}
              <Text
                style={{ color: theme.colors.accent }}
                onPress={() => navigation.navigate('TermsOfService')}>
                Điều khoản
              </Text>
              {' '}và{' '}
              <Text
                style={{ color: theme.colors.accent }}
                onPress={() => navigation.navigate('PrivacyPolicy')}>
                Chính sách bảo mật
              </Text>
            </Text>
          </Pressable>
          {errors.terms && (
            <Text style={[typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>
              {errors.terms}
            </Text>
          )}

          {errors.api ? (
            <Text style={[typography.bodySmall, { color: theme.colors.danger, marginTop: spacing.sm }]}>
              {errors.api}
            </Text>
          ) : null}

          <Button
            label="Tạo tài khoản"
            onPress={handleRegister}
            variant="primary"
            fullWidth
            loading={isLoading}
            style={{ marginTop: spacing.xl }}
            testID="btn-register"
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  termsRow:  { flexDirection: 'row', alignItems: 'flex-start', gap: 10 },
  checkbox:  { width: 20, height: 20, borderWidth: 1.5, borderRadius: 4, alignItems: 'center', justifyContent: 'center', marginTop: 2 },
});
