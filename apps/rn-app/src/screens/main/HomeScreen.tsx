import React from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StatusBar, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Row, Divider } from '../../components/ui/Card';
import { ListItem } from '../../components/ui/ListItem';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PhoneAvatar } from '../../components/ui/PhoneAvatar';
import { SectionHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, formatRelativeTime, RiskLevel } from '../../utils/riskUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const MOCK_STATS = {
  callsScanned: 247, todayCalls: 12,
  alertsSent: 18, weekAlerts: 5,
  myReports: 4,   trustScore: 92,
};

const MOCK_CALLS = [
  { phone: '0988000111', riskLevel: 'critical' as const, score: 97, time: new Date(Date.now() - 5 * 60000).toISOString(), topReason: 'Mạo danh cơ quan nhà nước' },
  { phone: '0901234567', riskLevel: 'high'     as const, score: 75, time: new Date(Date.now() - 30 * 60000).toISOString(), topReason: 'Thúc ép chuyển tiền ngay' },
  { phone: '0909876543', riskLevel: 'medium'   as const, score: 45, time: new Date(Date.now() - 2 * 3600000).toISOString(), topReason: 'Giả danh ngân hàng' },
  { phone: '0912345678', riskLevel: 'low'      as const, score: 12, time: new Date(Date.now() - 5 * 3600000).toISOString(), topReason: '' },
];

function StatCard({ label, value, sub, valueColor }: { label: string; value: number; sub?: string; valueColor?: string }) {
  const { theme } = useTheme();
  return (
    <Card style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[typography.h2, { color: valueColor ?? theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[typography.label, { color: theme.colors.textSecondary, marginTop: 2, textAlign: 'center' }]}>
        {label}
      </Text>
      {sub && <Text style={[typography.caption, { color: theme.colors.textTertiary }]}>{sub}</Text>}
    </Card>
  );
}

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();

  return (
    <SafeAreaView testID="home-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <View style={[styles.headerBar, { backgroundColor: theme.colors.bgPrimary, borderBottomColor: theme.colors.borderLight }]}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>Xin chào,</Text>
            <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>Người dùng 👋</Text>
          </View>
          <Text style={{ fontSize: 24 }}>🔔</Text>
        </Row>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        <Card
          style={Object.assign({}, styles.protectionBanner, { margin: spacing.lg, backgroundColor: theme.colors.riskLowBg, borderColor: theme.colors.riskLow })}>
          <Row style={{ alignItems: 'center', gap: spacing.sm }}>
            <Text style={{ fontSize: 20 }}>🛡️</Text>
            <Text style={[typography.bodySmall, { color: theme.colors.riskLowText, flex: 1, fontWeight: '600' }]}>
              Bảo vệ đang hoạt động
            </Text>
          </Row>
        </Card>

        <Row style={{ marginHorizontal: spacing.lg, gap: spacing.sm }}>
          <StatCard label="Cuộc gọi đã quét" value={MOCK_STATS.callsScanned} sub={`+${MOCK_STATS.todayCalls} hôm nay`} />
          <StatCard label="Cảnh báo đã phát" value={MOCK_STATS.alertsSent} sub={`+${MOCK_STATS.weekAlerts} tuần này`} />
        </Row>
        <Row style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm, gap: spacing.sm }}>
          <StatCard label="Báo cáo của bạn" value={MOCK_STATS.myReports} />
          <StatCard label="Điểm tín nhiệm" value={MOCK_STATS.trustScore} valueColor={theme.colors.riskLow} sub="Đáng tin cậy" />
        </Row>

        <SectionHeader
          title="Hoạt động gần đây"
          actionLabel="Xem tất cả"
          onAction={() => navigation.navigate('CallHistory')}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
        />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          {MOCK_CALLS.map((call, i) => (
            <React.Fragment key={call.phone + i}>
              <ListItem
                title={formatPhone(call.phone)}
                subtitle={`${formatRelativeTime(call.time)}${call.topReason ? ' · ' + call.topReason : ''}`}
                left={<PhoneAvatar riskLevel={call.riskLevel} />}
                right={<RiskBadge level={call.riskLevel} showLabel />}
                onPress={() => navigation.navigate('RiskDetail', { phone: call.phone })}
              />
              {i < MOCK_CALLS.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>

        <Row style={{ margin: spacing.lg, gap: spacing.sm }}>
          <Button
            label="Tra cứu số"
            onPress={() => (navigation as any).navigate('Lookup')}
            variant="primary"
            style={{ flex: 1 }}
            testID="btn-lookup"
          />
          <Button
            label="Báo cáo"
            onPress={() => (navigation as any).navigate('Report')}
            variant="outline"
            style={{ flex: 1 }}
            testID="btn-report"
          />
        </Row>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:             { flex: 1 },
  headerBar:        { paddingHorizontal: spacing.lg, paddingTop: spacing.md, paddingBottom: spacing.lg, borderBottomWidth: 0.5 },
  protectionBanner: { borderWidth: 1 },
});
