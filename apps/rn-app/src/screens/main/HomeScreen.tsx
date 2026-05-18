import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StatusBar, StyleSheet,
  RefreshControl,
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Row } from '../../components/ui/Card';
import { SectionHeader, EmptyState } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { useAuth } from '../../context/AuthContext';
import { reportApi, UserStatsResponse } from '../../api/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

function StatCard({ label, value, sub, valueColor }: { label: string; value: number | string; sub?: string; valueColor?: string }) {
  const { theme } = useTheme();
  return (
    <Card style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[typography.h2, { color: valueColor ?? theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[typography.label, { color: theme.colors.textSecondary, marginTop: 2, textAlign: 'center' }]}>
        {label}
      </Text>
      {sub ? (
        <Text style={[typography.caption, { color: theme.colors.textTertiary }]}>{sub}</Text>
      ) : null}
    </Card>
  );
}

export function HomeScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user } = useAuth();
  const [stats, setStats] = useState<UserStatsResponse | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = useCallback(async () => {
    try {
      const data = await reportApi.myStats();
      setStats(data);
    } catch {
      // Network down or token expired — keep last good values, show zeros below.
    }
  }, []);

  useFocusEffect(useCallback(() => { loadStats(); }, [loadStats]));

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadStats();
    setRefreshing(false);
  }, [loadStats]);

  const trustScoreColor = !stats
    ? theme.colors.textTertiary
    : stats.trustScore >= 75 ? theme.colors.riskLow
      : stats.trustScore >= 50 ? theme.colors.warning
        : theme.colors.danger;

  return (
    <SafeAreaView testID="home-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <StatusBar barStyle={theme.dark ? 'light-content' : 'dark-content'} />

      <View style={[styles.headerBar, { backgroundColor: theme.colors.bgPrimary, borderBottomColor: theme.colors.borderLight }]}>
        <Row style={{ justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <View>
            <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>Xin chào,</Text>
            <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>{user?.name ?? 'Người dùng'} 👋</Text>
          </View>
          <Text style={{ fontSize: 24 }}>🔔</Text>
        </Row>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={theme.colors.accent} />}>
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
          <StatCard
            label="Báo cáo của bạn"
            value={stats?.reportCount ?? 0}
            sub={stats ? 'Đóng góp cộng đồng' : undefined}
          />
          <StatCard
            label="Điểm tín nhiệm"
            value={stats?.trustScore ?? '–'}
            valueColor={trustScoreColor}
            sub={
              !stats ? undefined
                : stats.trustScore >= 75 ? 'Đáng tin cậy'
                  : stats.trustScore >= 50 ? 'Trung bình'
                    : 'Cần xác minh thêm'
            }
          />
        </Row>

        <SectionHeader
          title="Hoạt động gần đây"
          actionLabel="Xem tất cả"
          onAction={() => navigation.navigate('CallHistory')}
          style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }}
        />
        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.sm, paddingVertical: spacing.lg }}>
          <EmptyState
            icon="phone"
            message={'Chưa có cuộc gọi nào được phân tích.\nLịch sử sẽ xuất hiện khi Call Screening hoạt động.'}
          />
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
