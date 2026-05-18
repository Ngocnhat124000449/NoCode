import React, { useEffect, useState, useCallback } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet, ActivityIndicator,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Divider, Row } from '../../components/ui/Card';
import { ScreenHeader, EmptyState } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatDateTime } from '../../utils/riskUtils';
import { reportApi, ReportItem } from '../../api/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ReportDetail'>;

export function ReportDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { reportId } = route.params;

  const [report, setReport] = useState<ReportItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setNotFound(false);
    try {
      const data = await reportApi.getById(reportId);
      setReport(data);
    } catch {
      setNotFound(true);
    } finally {
      setLoading(false);
    }
  }, [reportId]);

  useEffect(() => { load(); }, [load]);

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
        <ScreenHeader leftAction="back" title="Chi tiết báo cáo" />
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </View>
      </SafeAreaView>
    );
  }

  if (notFound || !report) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
        <ScreenHeader leftAction="back" title="Chi tiết báo cáo" />
        <View style={{ flex: 1, justifyContent: 'center', padding: spacing.xl }}>
          <EmptyState
            icon="file-x"
            message={'Không tìm thấy báo cáo này.\nCó thể báo cáo đã bị xóa hoặc không thuộc tài khoản của bạn.'}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView testID="report-detail-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title="Chi tiết báo cáo" />
      <ScrollView>
        <Card style={{ margin: spacing.lg }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <View style={{ flex: 1 }}>
              <Text style={[typography.label, { color: theme.colors.textSecondary }]}>Mã báo cáo</Text>
              <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, fontFamily: 'monospace' }]} numberOfLines={1}>
                {report.id}
              </Text>
            </View>
          </Row>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={[
            styles.scamTypeBadge,
            { backgroundColor: theme.colors.riskHighBg, borderColor: theme.colors.riskHigh },
          ]}>
            <Text style={[typography.label, { color: theme.colors.riskHighText }]}>
              {report.scenarioType}
            </Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.label, { color: theme.colors.textSecondary }]}>Số điện thoại (đã băm)</Text>
            <Text
              style={[typography.caption, { color: theme.colors.textTertiary, fontFamily: 'monospace', marginTop: 2 }]}
              numberOfLines={1}>
              {report.phoneHash}
            </Text>
            <Text style={[typography.caption, { color: theme.colors.textTertiary, marginTop: spacing.xs, fontStyle: 'italic' }]}>
              Vì lý do bảo mật, số điện thoại được lưu dưới dạng băm không thể đảo ngược.
            </Text>
          </View>

          <View style={{ marginTop: spacing.md }}>
            <Text style={[typography.label, { color: theme.colors.textSecondary }]}>Thời gian báo cáo</Text>
            <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, marginTop: 2 }]}>
              {formatDateTime(report.reportedAt)}
            </Text>
          </View>
        </Card>

        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl }}>
          <Button
            label="Báo cáo thêm số khác"
            variant="primary"
            fullWidth
            onPress={() => (navigation as any).navigate('Report')}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:          { flex: 1 },
  scamTypeBadge: { alignSelf: 'flex-start', paddingHorizontal: spacing.md, paddingVertical: spacing.xs, borderRadius: radius.md, borderWidth: 1 },
});
