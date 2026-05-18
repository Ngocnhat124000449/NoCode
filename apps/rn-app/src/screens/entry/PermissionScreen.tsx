import React, { useState } from 'react';
import {
  View, Text, ScrollView, StyleSheet, SafeAreaView, Linking,
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

export function PermissionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [callStatus, setCallStatus]     = useState<PermStatus>('not_asked');
  const [notifStatus, setNotifStatus]   = useState<PermStatus>('not_asked');
  const [contactStatus, setContactStatus] = useState<PermStatus>('not_asked');

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
            onRequest={() => setCallStatus('granted')}
            required
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          <PermissionItem
            icon="🔔"
            title="Thông báo"
            description="Gửi cảnh báo rủi ro cao ngay lập tức, kể cả khi màn hình đang khóa."
            status={notifStatus}
            onRequest={() => setNotifStatus('granted')}
            required
          />
          <View style={[styles.divider, { backgroundColor: theme.colors.borderLight }]} />
          <PermissionItem
            icon="📋"
            title="Danh bạ (tùy chọn)"
            description="Giúp nhận ra số lạ không có trong danh bạ của bạn — tín hiệu bổ sung cho việc chấm điểm."
            status={contactStatus}
            onRequest={() => setContactStatus('granted')}
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
