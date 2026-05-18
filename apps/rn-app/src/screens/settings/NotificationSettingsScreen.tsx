import React, { useState } from 'react';
import { View, Text, ScrollView, SafeAreaView } from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Card } from '../../components/ui/Card';
import { Toggle } from '../../components/ui/Toggle';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { ListItem } from '../../components/ui/ListItem';

const NOTIFICATION_TYPES = [
  { id: 'incoming_high',  label: 'Cuộc gọi rủi ro cao', description: 'Khi phát hiện cuộc gọi nguy hiểm đang đến' },
  { id: 'report_confirm', label: 'Xác nhận báo cáo',    description: 'Khi báo cáo của bạn được cộng đồng xác nhận' },
  { id: 'weekly_summary', label: 'Tóm tắt hàng tuần',   description: 'Thống kê hoạt động bảo vệ hàng tuần' },
  { id: 'community_alert',label: 'Cảnh báo cộng đồng',  description: 'Xu hướng lừa đảo mới trong khu vực' },
];

export function NotificationSettingsScreen() {
  const { theme } = useTheme();
  const [allOn, setAllOn]           = useState(true);
  const [highRiskOnly, setHighRisk] = useState(false);
  const [enabled, setEnabled]       = useState<string[]>(['incoming_high', 'report_confirm']);

  const toggle = (id: string) =>
    setEnabled(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  return (
    <SafeAreaView testID="notification-settings-screen" style={{ flex: 1, backgroundColor: theme.colors.bgSecondary }}>
      <ScreenHeader leftAction="back" title="Cài đặt thông báo" />
      <ScrollView>
        <Card style={{ margin: spacing.lg }}>
          <ListItem
            title="Bật thông báo"
            left={<Text style={{ fontSize: 18 }}>🔔</Text>}
            right={<Toggle value={allOn} onValueChange={setAllOn} />}
            divider
          />
          <ListItem
            title="Chỉ cảnh báo rủi ro cao"
            subtitle="Điểm từ 60 trở lên"
            left={<Text style={{ fontSize: 18 }}>⚠️</Text>}
            right={<Toggle value={highRiskOnly} onValueChange={setHighRisk} />}
            divider
          />
          <ListItem
            title="Giờ im lặng"
            subtitle="22:00 – 07:00"
            left={<Text style={{ fontSize: 18 }}>🌙</Text>}
            right={<Text style={{ color: theme.colors.accent }}>›</Text>}
          />
        </Card>

        <Card style={{ marginHorizontal: spacing.lg }}>
          <Text style={[typography.label, { color: theme.colors.textSecondary, marginBottom: spacing.md }]}>
            Loại thông báo
          </Text>
          {NOTIFICATION_TYPES.map((type, i) => (
            <ListItem
              key={type.id}
              title={type.label}
              subtitle={type.description}
              right={
                <Toggle
                  value={enabled.includes(type.id)}
                  onValueChange={() => toggle(type.id)}
                  disabled={!allOn}
                />
              }
              divider={i < NOTIFICATION_TYPES.length - 1}
            />
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}
