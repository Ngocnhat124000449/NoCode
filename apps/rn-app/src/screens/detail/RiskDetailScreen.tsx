import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet, Linking, ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Divider, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ScoreCircle } from '../../components/ui/ScoreCircle';
import { ScreenHeader, SectionHeader, EmptyState } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, formatRelativeTime, getRiskFromScore } from '../../utils/riskUtils';
import { riskApi, RiskLookupResponse } from '../../api/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'RiskDetail'>;

/**
 * Parse a "[RC040] Giả mạo nhân viên ngân hàng" string into structured pieces.
 * If the backend ever stops bracketing reasons, fall back to the full string
 * so we still render something useful.
 */
function parseReason(raw: string): { code: string; title: string } {
  const match = raw.match(/^\[(RC\d+)\]\s*(.+)$/);
  if (!match) return { code: '?', title: raw };
  return { code: match[1], title: match[2] };
}

export function RiskDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { phone } = route.params;

  const [data, setData] = useState<RiskLookupResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const result = await riskApi.lookup(phone);
      if (result) setData(result); else setNotFound(true);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [phone]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
        <ScreenHeader leftAction="back" title={formatPhone(phone)} />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound || !data) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
        <ScreenHeader leftAction="back" title={formatPhone(phone)} />
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
          <EmptyState
            icon="search"
            message={`Chưa có dữ liệu cảnh báo cho số ${formatPhone(phone)}.\nNếu bạn nghi ngờ, hãy gửi báo cáo để cộng đồng cùng cảnh giác.`}
          />
          <Button
            label="Báo cáo số này"
            variant="primary"
            fullWidth
            onPress={() => (navigation as any).navigate('Report')}
            style={{ marginTop: spacing.lg }}
          />
        </View>
      </SafeAreaView>
    );
  }

  const level = getRiskFromScore(data.score) as 'critical' | 'high' | 'medium' | 'low';
  const confidencePct = Math.round((data.confidence ?? 0) * 100);
  const reasons = (data.reasons ?? []).map(parseReason);

  return (
    <SafeAreaView testID="risk-detail-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title={formatPhone(phone)} />
      <ScrollView>
        <Card style={{ margin: spacing.lg, alignItems: 'center' }}>
          <ScoreCircle score={data.score} size={100} animated />
          <Text style={[typography.h3, { color: theme.colors.textPrimary, marginTop: spacing.md }]}>
            {formatPhone(phone)}
          </Text>
          <RiskBadge level={level} size="md" style={{ marginTop: spacing.sm }} />
          <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
            {data.reportCount} báo cáo · Độ tin cậy {confidencePct}%
          </Text>
          {data.updatedAt ? (
            <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
              Cập nhật {formatRelativeTime(data.updatedAt)}
            </Text>
          ) : null}
        </Card>

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          <Row style={{ justifyContent: 'space-between', marginBottom: spacing.sm }}>
            <Text style={[typography.label, { color: theme.colors.textSecondary }]}>Độ tin cậy dữ liệu</Text>
            <Text style={[typography.label, { color: theme.colors.accent }]}>{confidencePct}%</Text>
          </Row>
          <View style={[styles.progressBg, { backgroundColor: theme.colors.bgTertiary }]}>
            <View style={[styles.progressFill, { width: `${confidencePct}%` as any, backgroundColor: theme.colors.accent }]} />
          </View>
          <Text style={[typography.caption, { color: theme.colors.textSecondary, marginTop: spacing.sm }]}>
            Dựa trên {data.reportCount} báo cáo từ cộng đồng
          </Text>
        </Card>

        <SectionHeader title="Chi tiết lý do" style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }} />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          {reasons.length === 0 ? (
            <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, paddingVertical: spacing.md }]}>
              Không có lý do cảnh báo cụ thể.
            </Text>
          ) : (
            reasons.map((reason, i) => (
              <React.Fragment key={`${reason.code}-${i}`}>
                <View style={{ paddingVertical: spacing.md }}>
                  <Row style={{ gap: spacing.sm }}>
                    <Text style={{ color: theme.colors.danger, fontSize: 16 }}>⚠</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, fontWeight: '600' }]}>
                        [{reason.code}] {reason.title}
                      </Text>
                    </View>
                  </Row>
                </View>
                {i < reasons.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Card>

        <SectionHeader
          title="Báo cáo gần nhất"
          actionLabel={`${data.reportCount} báo cáo`}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
        />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm }}>
          {data.recentReports.length === 0 ? (
            <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, paddingVertical: spacing.md }]}>
              Chưa có báo cáo nào trong cơ sở dữ liệu cộng đồng.
            </Text>
          ) : (
            data.recentReports.map((report, i) => (
              <React.Fragment key={report.id}>
                <View style={{ paddingVertical: spacing.md }}>
                  <Row style={{ justifyContent: 'space-between' }}>
                    <Text style={[typography.bodySmall, { color: theme.colors.textPrimary }]}>
                      {report.scenarioType}
                    </Text>
                    <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
                      {formatRelativeTime(report.reportedAt)}
                    </Text>
                  </Row>
                </View>
                {i < data.recentReports.length - 1 && <Divider />}
              </React.Fragment>
            ))
          )}
        </Card>

        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl, gap: spacing.sm }}>
          <Button label="Không chuyển tiền" onPress={() => {}} variant="danger" fullWidth testID="btn-dont-transfer" />
          <Button label="Gọi số chính thức" onPress={() => Linking.openURL('tel:113')} variant="primary" fullWidth />
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
