import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, Linking,
  PermissionsAndroid, Platform, AppState,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';

type PermStatus = 'granted' | 'denied' | 'blocked';

interface PermCardProps {
  icon: string;
  title: string;
  description: string;
  steps?: string[];
  status: PermStatus;
  onRequest: () => void;
  required?: boolean;
}

function PermCard({ icon, title, description, steps, status, onRequest, required }: PermCardProps) {
  const { theme } = useTheme();
  const statusColor = status === 'granted' ? theme.colors.riskLow : theme.colors.danger;
  const statusLabel = status === 'granted' ? '✓ Đã cấp' : status === 'blocked' ? '✕ Bị chặn' : '! Chưa cấp';

  return (
    <Card style={{ marginBottom: spacing.sm }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm }}>
        <Text style={{ fontSize: 22 }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.h4, { color: theme.colors.textPrimary }]}>{title}</Text>
            <Text style={[typography.label, { color: statusColor }]}>{statusLabel}</Text>
          </View>
          <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
            {description}
          </Text>
        </View>
      </View>

      {status !== 'granted' && steps && (
        <View style={{ marginTop: spacing.md, backgroundColor: theme.colors.bgSecondary, borderRadius: radius.md, padding: spacing.md }}>
          <Text style={[typography.label, { color: theme.colors.textSecondary, marginBottom: spacing.xs }]}>
            Cách cấp quyền:
          </Text>
          {steps.map((step, i) => (
            <Text key={i} style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
              {i + 1}. {step}
            </Text>
          ))}
        </View>
      )}

      {status !== 'granted' && (
        <View style={{ marginTop: spacing.md }}>
          {status === 'blocked'
            ? <Button label="Mở Cài đặt ứng dụng" onPress={() => Linking.openSettings()} variant="outline" fullWidth />
            : <Button label="Cấp quyền" onPress={onRequest} variant="primary" fullWidth />
          }
        </View>
      )}
    </Card>
  );
}

function mapResult(result: string): PermStatus {
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}

async function checkPermission(permission: string | null): Promise<PermStatus> {
  if (!permission) return 'granted';
  try {
    const granted = await PermissionsAndroid.check(permission as any);
    return granted ? 'granted' : 'denied';
  } catch {
    return 'denied';
  }
}

async function requestPermission(
  permission: string | null,
  title: string,
  message: string,
): Promise<PermStatus> {
  if (!permission) return 'granted';
  try {
    const result = await PermissionsAndroid.request(permission as any, {
      title,
      message,
      buttonPositive: 'Cấp quyền',
      buttonNegative: 'Từ chối',
      buttonNeutral: 'Để sau',
    });
    return mapResult(result);
  } catch {
    return 'denied';
  }
}

export function PermissionManagementScreen() {
  const { theme } = useTheme();
  const [callStatus, setCallStatus] = useState<PermStatus>('denied');
  const [notifStatus, setNotifStatus] = useState<PermStatus>('denied');
  const [contactStatus, setContactStatus] = useState<PermStatus>('denied');

  const NOTIF_PERMISSION = Platform.OS === 'android' && typeof Platform.Version === 'number' && Platform.Version >= 33
    ? 'android.permission.POST_NOTIFICATIONS'
    : null;

  const refreshAll = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setCallStatus('granted');
      setNotifStatus('granted');
      setContactStatus('granted');
      return;
    }
    setCallStatus(await checkPermission(PermissionsAndroid.PERMISSIONS.READ_CALL_LOG));
    setContactStatus(await checkPermission(PermissionsAndroid.PERMISSIONS.READ_CONTACTS));
    setNotifStatus(await checkPermission(NOTIF_PERMISSION));
  }, [NOTIF_PERMISSION]);

  useEffect(() => {
    refreshAll();
    // When the user returns from Settings, re-read permission status so the
    // UI reflects any change they made there.
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refreshAll();
    });
    return () => sub.remove();
  }, [refreshAll]);

  const handleCallRequest = async () => {
    setCallStatus(await requestPermission(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      'Sàng lọc cuộc gọi',
      'ScamShield cần đọc lịch sử cuộc gọi để phân tích và cảnh báo cuộc gọi đáng ngờ.',
    ));
  };

  const handleNotifRequest = async () => {
    setNotifStatus(await requestPermission(
      NOTIF_PERMISSION,
      'Thông báo',
      'Cho phép ScamShield gửi cảnh báo rủi ro cao khi có cuộc gọi đáng ngờ.',
    ));
  };

  const handleContactRequest = async () => {
    setContactStatus(await requestPermission(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      'Danh bạ',
      'Giúp ScamShield nhận ra số lạ không có trong danh bạ — bổ sung tín hiệu cảnh báo.',
    ));
  };

  return (
    <SafeAreaView testID="permission-management-screen" style={{ flex: 1, backgroundColor: theme.colors.bgSecondary }}>
      <ScreenHeader leftAction="back" title="Quản lý quyền" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <PermCard
          icon="📞"
          title="Sàng lọc cuộc gọi"
          description="Phân tích cuộc gọi đến theo thời gian thực và hiển thị cảnh báo."
          status={callStatus}
          onRequest={handleCallRequest}
          required
        />
        <PermCard
          icon="🔔"
          title="Thông báo"
          description="Gửi cảnh báo rủi ro cao ngay lập tức."
          steps={[
            'Vào Cài đặt → Ứng dụng',
            'Chọn ScamShield',
            'Chọn Thông báo → Bật tất cả',
          ]}
          status={notifStatus}
          onRequest={handleNotifRequest}
          required
        />
        <PermCard
          icon="📋"
          title="Danh bạ"
          description="Nhận biết số lạ không có trong danh bạ của bạn."
          steps={[
            'Vào Cài đặt → Ứng dụng',
            'Chọn ScamShield → Quyền',
            'Bật Danh bạ',
          ]}
          status={contactStatus}
          onRequest={handleContactRequest}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
