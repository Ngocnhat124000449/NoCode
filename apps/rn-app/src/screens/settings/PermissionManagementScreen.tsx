import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView, Linking } from 'react-native';
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

export function PermissionManagementScreen() {
  const { theme } = useTheme();
  const [callStatus, setCallStatus]       = useState<PermStatus>('granted');
  const [notifStatus, setNotifStatus]     = useState<PermStatus>('denied');
  const [contactStatus, setContactStatus] = useState<PermStatus>('blocked');

  return (
    <SafeAreaView testID="permission-management-screen" style={{ flex: 1, backgroundColor: theme.colors.bgSecondary }}>
      <ScreenHeader leftAction="back" title="Quản lý quyền" />
      <ScrollView contentContainerStyle={{ padding: spacing.lg }}>
        <PermCard
          icon="📞"
          title="Sàng lọc cuộc gọi"
          description="Phân tích cuộc gọi đến theo thời gian thực và hiển thị cảnh báo."
          status={callStatus}
          onRequest={() => setCallStatus('granted')}
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
          onRequest={() => setNotifStatus('granted')}
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
          onRequest={() => setContactStatus('granted')}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
