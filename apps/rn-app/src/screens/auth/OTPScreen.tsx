import React, { useState, useRef, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav   = NativeStackNavigationProp<RootStackParamList, 'OTP'>;
type Route = RouteProp<RootStackParamList, 'OTP'>;

const OTP_LENGTH = 6;

function OTPInput({ value, onChange }: { value: string; onChange: (v: string) => void }) {
  const { theme } = useTheme();
  const inputs = useRef<(TextInput | null)[]>([]);

  const handleChange = (text: string, index: number) => {
    const cleaned = text.replace(/\D/g, '').slice(-1);
    const arr = value.split('');
    arr[index] = cleaned;
    const next = arr.join('');
    onChange(next);
    if (cleaned && index < OTP_LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  return (
    <View style={styles.otpRow} testID="otp-input">
      {Array.from({ length: OTP_LENGTH }).map((_, i) => {
        const filled = !!value[i];
        const focused = false;
        return (
          <TextInput
            key={i}
            ref={el => { inputs.current[i] = el; }}
            value={value[i] ?? ''}
            onChangeText={text => handleChange(text, i)}
            onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectionColor={theme.colors.accent}
            style={[
              styles.otpCell,
              {
                borderColor: filled ? theme.colors.accent : theme.colors.borderMedium,
                color: theme.colors.textPrimary,
                backgroundColor: theme.colors.bgSecondary,
                fontSize: 24,
                fontWeight: '700',
              },
            ]}
          />
        );
      })}
    </View>
  );
}

export function OTPScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [loading, setLoading] = useState(false);

  const maskedPhone = phone.slice(0, 4) + '***' + phone.slice(-3);

  useEffect(() => {
    if (countdown <= 0) return;
    const t = setInterval(() => setCountdown(c => c - 1), 1000);
    return () => clearInterval(t);
  }, [countdown]);

  const handleVerify = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); navigation.replace('MainTabs'); }, 800);
  };

  return (
    <SafeAreaView testID="otp-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScreenHeader leftAction="back" />
      <View style={{ padding: spacing.xl }}>
        <Text style={[typography.h2, { color: theme.colors.textPrimary }]}>
          Xác minh số điện thoại
        </Text>
        <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: spacing.xs }]}>
          Nhập mã 6 số đã gửi đến {maskedPhone}
        </Text>

        <OTPInput value={otp} onChange={setOtp} />

        <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing.lg }]}>
          {countdown > 0
            ? `Gửi lại sau 00:${String(countdown).padStart(2, '0')}`
            : (
              <Text
                style={{ color: theme.colors.accent }}
                onPress={() => setCountdown(60)}>
                Gửi lại mã
              </Text>
            )
          }
        </Text>

        <Button
          label="Xác minh"
          onPress={handleVerify}
          variant="primary"
          fullWidth
          loading={loading}
          disabled={otp.length < OTP_LENGTH}
          style={{ marginTop: spacing.xl }}
          testID="btn-verify"
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:    { flex: 1 },
  otpRow:  { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, justifyContent: 'center' },
  otpCell: {
    width: 48, height: 56,
    borderWidth: 2, borderRadius: 10,
    textAlign: 'center',
  },
});
