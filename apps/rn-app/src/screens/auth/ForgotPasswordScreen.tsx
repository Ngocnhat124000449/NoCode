import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AppInput } from '../../components/ui/AppInput';
import { ScreenHeader } from '../../components/layout/ScreenHeader';

function StepIndicator({ steps, current }: { steps: number; current: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', gap: spacing.sm, justifyContent: 'center' }}>
      {Array.from({ length: steps }).map((_, i) => (
        <View
          key={i}
          style={{
            width: i === current - 1 ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: i < current ? theme.colors.accent : theme.colors.borderMedium,
          }}
        />
      ))}
    </View>
  );
}

export function ForgotPasswordScreen() {
  const { theme } = useTheme();
  const [step, setStep]         = useState(1);
  const [phone, setPhone]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [loading, setLoading]   = useState(false);
  const navigation = useNavigation();

  const advance = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(s => s + 1); }, 600);
  };

  const handleReset = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigation.navigate('Login' as never); }, 600);
  };

  return (
    <SafeAreaView testID="forgot-password-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScreenHeader leftAction="back" title="Quên mật khẩu" />
      <View style={{ padding: spacing.xl, flex: 1 }}>
        {step === 1 && (
          <>
            <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: spacing.xl }]}>
              Nhập số điện thoại đã đăng ký. Chúng tôi sẽ gửi OTP để đặt lại mật khẩu.
            </Text>
            <AppInput
              label="Số điện thoại"
              keyboardType="phone-pad"
              placeholder="0901 234 567"
              value={phone}
              onChangeText={setPhone}
              style={{ marginTop: spacing.lg }}
              testID="input-phone"
            />
            <Button
              label="Gửi OTP"
              onPress={advance}
              variant="primary"
              fullWidth
              loading={loading}
              style={{ marginTop: spacing.xl }}
            />
          </>
        )}

        {step === 2 && (
          <>
            <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: spacing.xl }]}>
              Nhập mã 6 số đã gửi đến {phone.slice(0, 4)}***{phone.slice(-3)}
            </Text>
            <AppInput
              label="Mã OTP"
              keyboardType="number-pad"
              placeholder="______"
              value={otp}
              onChangeText={setOtp}
              style={{ marginTop: spacing.lg }}
              testID="input-otp"
            />
            <Button
              label="Xác minh"
              onPress={advance}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={otp.length < 6}
              style={{ marginTop: spacing.xl }}
            />
          </>
        )}

        {step === 3 && (
          <>
            <AppInput
              label="Mật khẩu mới"
              secureTextEntry
              value={newPass}
              onChangeText={setNewPass}
              style={{ marginTop: spacing.lg }}
              testID="input-new-pass"
            />
            <AppInput
              label="Xác nhận mật khẩu"
              secureTextEntry
              value={confirm}
              onChangeText={setConfirm}
              error={confirm && confirm !== newPass ? 'Mật khẩu không khớp' : ''}
              style={{ marginTop: spacing.md }}
              testID="input-confirm"
            />
            <Button
              label="Đặt lại mật khẩu"
              onPress={handleReset}
              variant="primary"
              fullWidth
              loading={loading}
              disabled={!newPass || newPass !== confirm}
              style={{ marginTop: spacing.xl }}
            />
          </>
        )}

        <View style={{ flex: 1 }} />
        <StepIndicator steps={3} current={step} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
