import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Linking,
  PermissionsAndroid, Platform, AppState,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Permission'>;
type PermStatus = 'granted' | 'denied' | 'blocked' | 'not_asked';

interface PermItemProps {
  icon: string;
  title: string;
  description: string;
  status: PermStatus;
  onRequest: () => void;
  required?: boolean;
}

function PermissionItem({ icon, title, description, status, onRequest, required }: PermItemProps) {
  const { theme } = useTheme();
  return (
    <View style={styles.permItem}>
      <View style={styles.permHeader}>
        <Text style={{ fontSize: 22, marginRight: spacing.sm }}>{icon}</Text>
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: spacing.xs }}>
            <Text style={[typography.h4, { color: theme.colors.textPrimary }]}>{title}</Text>
            {required && (
              <View style={[styles.requiredBadge, { backgroundColor: theme.colors.riskHighBg }]}>
                <Text style={[typography.caption, { color: theme.colors.riskHighText }]}>Bắt buộc</Text>
              </View>
            )}
          </View>
          <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, marginTop: 4 }]}>
            {description}
          </Text>
        </View>
      </View>
      <View style={{ marginTop: spacing.sm, alignItems: 'flex-end' }}>
        {status === 'granted'
          ? <Text style={[typography.label, { color: theme.colors.riskLow }]}>✓ Đã cấp</Text>
          : status === 'blocked'
            ? <Button label="Mở Cài đặt" onPress={() => Linking.openSettings()} variant="outline" size="sm" />
            : <Button label="Cấp quyền" onPress={onRequest} variant="primary" size="sm" />
        }
      </View>
    </View>
  );
}

/**
 * Map a single Android permission result to our internal PermStatus.
 *
 * Android returns 'never_ask_again' when the user has dismissed the prompt
 * twice — at that point we cannot show the prompt again and must send
 * the user into Settings via Linking.openSettings().
 */
function mapResult(result: string): PermStatus {
  if (result === PermissionsAndroid.RESULTS.GRANTED) return 'granted';
  if (result === PermissionsAndroid.RESULTS.NEVER_ASK_AGAIN) return 'blocked';
  return 'denied';
}

async function checkSingle(permission: string): Promise<PermStatus> {
  try {
    const granted = await PermissionsAndroid.check(permission as any);
    return granted ? 'granted' : 'not_asked';
  } catch {
    return 'not_asked';
  }
}

async function requestSingle(
  permission: string,
  rationale: { title: string; message: string },
): Promise<PermStatus> {
  try {
    const result = await PermissionsAndroid.request(permission as any, {
      title: rationale.title,
      message: rationale.message,
      buttonPositive: 'Cấp quyền',
      buttonNegative: 'Từ chối',
      buttonNeutral: 'Để sau',
    });
    return mapResult(result);
  } catch {
    return 'denied';
  }
}

export function PermissionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [callStatus, setCallStatus] = useState<PermStatus>('not_asked');
  const [notifStatus, setNotifStatus] = useState<PermStatus>('not_asked');
  const [contactStatus, setContactStatus] = useState<PermStatus>('not_asked');

  // Android 13+ exposes POST_NOTIFICATIONS as a runtime permission.
  // On older versions it is auto-granted at install time.
  const NOTIF_PERMISSION = typeof Platform.Version === 'number' && Platform.Version >= 33
    ? 'android.permission.POST_NOTIFICATIONS'
    : null;

  const refreshAll = useCallback(async () => {
    if (Platform.OS !== 'android') {
      setCallStatus('granted');
      setNotifStatus('granted');
      setContactStatus('granted');
      return;
    }
    setCallStatus(await checkSingle(PermissionsAndroid.PERMISSIONS.READ_CALL_LOG));
    setContactStatus(await checkSingle(PermissionsAndroid.PERMISSIONS.READ_CONTACTS));
    if (NOTIF_PERMISSION) {
      setNotifStatus(await checkSingle(NOTIF_PERMISSION));
    } else {
      setNotifStatus('granted');
    }
  }, [NOTIF_PERMISSION]);

  // Re-check on mount and whenever the user returns from Settings — this is
  // how we detect a previously-blocked permission being toggled on.
  useEffect(() => {
    refreshAll();
    const sub = AppState.addEventListener('change', state => {
      if (state === 'active') refreshAll();
    });
    return () => sub.remove();
  }, [refreshAll]);

  const handleCallRequest = async () => {
    const status = await requestSingle(
      PermissionsAndroid.PERMISSIONS.READ_CALL_LOG,
      {
        title: 'Sàng lọc cuộc gọi',
        message: 'ScamShield cần đọc lịch sử cuộc gọi để hiển thị cảnh báo khi có số lạ gọi đến.',
      },
    );
    setCallStatus(status);
  };

  const handleNotifRequest = async () => {
    if (!NOTIF_PERMISSION) {
      setNotifStatus('granted');
      return;
    }
    const status = await requestSingle(NOTIF_PERMISSION, {
      title: 'Thông báo',
      message: 'ScamShield gửi cảnh báo rủi ro cao ngay lập tức khi có cuộc gọi đáng ngờ.',
    });
    setNotifStatus(status);
  };

  const handleContactRequest = async () => {
    const status = await requestSingle(
      PermissionsAndroid.PERMISSIONS.READ_CONTACTS,
      {
        title: 'Danh bạ',
        message: 'Giúp ScamShield nhận ra số không có trong danh bạ — bổ sung tín hiệu cảnh báo.',
      },
    );
    setContactStatus(status);
  };

  const allRequired = callStatus === 'granted' && notifStatus === 'granted';

  return (
    <SafeAreaView testID="permission-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScreenHeader title="Cần cấp quyền" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <Card style={{ marginBottom: spacing.md, backgroundColor: theme.colors.accentLight }}>
          <View style={{ flexDirection: 'row', gap: spacing.md }}>
            <Text style={{ fontSize: 24 }}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: theme.colors.accentText }]}>Tại sao cần những quyền này?</Text>
              <Text style={[typography.bodySmall, { color: theme.colors.accentText, marginTop: 4, opacity: 0.85 }]}>
                ScamShield cần quyền để hoạt động ngay khi có cuộc gọi — không cần bạn mở app thủ công.
              </Text>
            </View>
          </View>
        </Card>

        <Card>
          <PermissionItem
            icon="📞"
            title="Sàng lọc cuộc gọi"
            description="Cho phép ScamShield kiểm tra số gọi đến và hiển thị cảnh báo trước khi bạn nghe máy."
            status={callStatus}
            onRequest={handleCallRequest}
            required
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          <PermissionItem
            icon="🔔"
            title="Thông báo"
            description="Gửi cảnh báo rủi ro cao ngay lập tức, kể cả khi màn hình đang khóa."
            status={notifStatus}
            onRequest={handleNotifRequest}
            required
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          <PermissionItem
            icon="📋"
            title="Danh bạ (tùy chọn)"
            description="Giúp nhận ra số lạ không có trong danh bạ của bạn — tín hiệu bổ sung cho việc chấm điểm."
            status={contactStatus}
            onRequest={handleContactRequest}
          />
        </Card>
      </ScrollView>

      <View style={{ padding: spacing.lg }}>
        <Button
          label={allRequired ? 'Tiếp tục' : 'Cấp quyền bắt buộc trước'}
          onPress={() => navigation.replace('Login')}
          variant="primary"
          fullWidth
          disabled={!allRequired}
        />
        <Text style={[typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
          Chúng tôi không thu thập nội dung cuộc gọi. Chỉ phân tích metadata.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  permItem:      { paddingVertical: spacing.md },
  permHeader:    { flexDirection: 'row', alignItems: 'flex-start' },
  requiredBadge: { paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4 },
  divider:       { height: 0.5, marginVertical: spacing.sm },
});
