import React from 'react';
import {
  View, Text, SafeAreaView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { ScreenHeader, EmptyState } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList>;

/**
 * Call history is local-only by design: the backend never sees the raw
 * incoming numbers (privacy) and the device-side cache is populated by
 * ScamCallScreeningService writing into MMKV after each incoming call.
 *
 * Until the device has actually been called and the call-screening
 * service has had a chance to log entries, this screen has nothing to
 * show. Once the native module exposes a "list local calls" bridge,
 * this becomes a real list.
 */
export function CallHistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView testID="call-history-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title="Lịch sử cuộc gọi" />

      <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
        <EmptyState
          icon="phone-off"
          message={'Chưa có cuộc gọi nào được phân tích.\n\nKhi có cuộc gọi đến, ScamShield sẽ tự động đánh giá rủi ro và lưu vào lịch sử cục bộ trên thiết bị.\n\nVì lý do quyền riêng tư, lịch sử cuộc gọi không bao giờ rời khỏi máy của bạn.'}
        />
        <View style={{ marginTop: spacing.lg, gap: spacing.sm }}>
          <Button
            label="Kiểm tra quyền Call Screening"
            variant="primary"
            fullWidth
            onPress={() => navigation.navigate('PermissionManagement')}
          />
          <Button
            label="Tra cứu một số cụ thể"
            variant="outline"
            fullWidth
            onPress={() => (navigation as any).navigate('Lookup')}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
});
