import React from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet, Linking,
} from 'react-native';
import { useRoute, RouteProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Divider, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ScoreCircle } from '../../components/ui/ScoreCircle';
import { ScreenHeader, SectionHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, formatRelativeTime, getRiskFromScore } from '../../utils/riskUtils';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'RiskDetail'>;

const MOCK = {
  score: 97, confidence: 89, reportCount: 142,
  updatedAt: new Date(Date.now() - 3600000).toISOString(),
  reasons: [
    { code: 'RC001', title: 'Mạo danh cơ quan nhà nước', description: 'Tự xưng là công an, viện kiểm sát, hay cơ quan nhà nước.', weight: 0.9 },
    { code: 'RC010', title: 'Thúc ép chuyển tiền', description: 'Yêu cầu chuyển tiền ngay lập tức không cho thời gian kiểm tra.', weight: 0.85 },
    { code: 'RC020', title: 'Yêu cầu giữ bí mật', description: 'Dặn dò không được kể cho người thân hay bạn bè nghe.', weight: 0.7 },
  ],
  community: [
    { user: 'Ẩn danh', type: 'Mạo danh', time: new Date(Date.now() - 7200000).toISOString(), confirmCount: 15 },
    { user: 'Ẩn danh', type: 'Thúc ép tiền', time: new Date(Date.now() - 86400000).toISOString(), confirmCount: 8 },
  ],
};

export function RiskDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone } = route.params;
  const level = getRiskFromScore(MOCK.score);

  return (
    <SafeAreaView testID="risk-detail-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title={formatPhone(phone)} />
      <ScrollView>
        <Card style={{ margin: spacing.lg, alignItems: 'center' }}>
          <ScoreCircle score={MOCK.score} size={100} animated />
          <Text style={[typography.h3, { color: theme.colors.textPrimary, marginTop: spacing.md }]}>
            {formatPhone(phone)}
          </Text>
          <RiskBadge level={level} size="md" style={{ marginTop: spacing.sm }} />
          <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
            {MOCK.reportCount} báo cáo · Độ tin cậy {MOCK.confidence}%
          </Text>
          <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
            Cập nhật {formatRelativeTime(MOCK.updatedAt)}
          </Text>
        </Card>

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={[typography.label, { color: theme.colors.textSecondary }]}>Độ tin cậy dữ liệu</Text>
            <Text style={[typography.label, { color: theme.colors.accent }]}>{MOCK.confidence}%</Text>
          </Row>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.bgTertiary }]}>
            <View style={[styles.progressFill, { width: `${MOCK.confidence}%` as any, backgroundColor: theme.colors.accent }]} />
          </View>
          <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
            Dựa trên {MOCK.reportCount} báo cáo từ cộng đồng
          </Text>
        </Card>

        <SectionHeader title="Chi tiết lý do" style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }} />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          {MOCK.reasons.map((reason, i) => (
            <React.Fragment key={reason.code}>
              <View style={{ paddingVertical: spacing.md }}>
                <Row style={{ gap: spacing.sm }}>
                  <Text style={{ color: reason.weight > 0.8 ? theme.colors.danger : theme.colors.warning, fontSize: 16 }}>⚠</Text>
                  <View style={{ flex: 1 }}>
                    <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                      [{reason.code}] {reason.title}
                    </Text>
                    <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: 4 }]}>
                      {reason.description}
                    </Text>
                  </View>
                </Row>
              </View>
              {i < MOCK.reasons.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>

        <SectionHeader
          title="Báo cáo từ cộng đồng"
          actionLabel={`${MOCK.reportCount} báo cáo`}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
        />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          {MOCK.community.map((c, i) => (
            <React.Fragment key={i}>
              <View style={{ paddingVertical: spacing.md }}>
                <Row style={{ justifyContent: 'space-between' }}>
                  <Text style={[typography.bodySmall, { color: theme.colors.textPrimary }]}>{c.type}</Text>
                  <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
                    {c.confirmCount} xác nhận
                  </Text>
                </Row>
                <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
                  {formatRelativeTime(c.time)}
                </Text>
              </View>
              {i < MOCK.community.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </Card>

        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl, gap: spacing.sm }}>
          <Button label="Không chuyển tiền" onPress={() => {}} variant="danger" fullWidth testID="btn-dont-transfer" />
          <Button label="Gọi số chính thức" onPress={() => Linking.openURL('tel:18005999920')} variant="primary" fullWidth />
          <Button label="Báo cáo số này" onPress={() => (navigation as any).navigate('Report')} variant="outline" fullWidth />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  progressBg:  { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill:{ height: '100%', borderRadius: 3 },
});
