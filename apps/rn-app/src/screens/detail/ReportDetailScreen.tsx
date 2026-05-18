import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet,
} from 'react-native';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Divider, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PhoneAvatar } from '../../components/ui/PhoneAvatar';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, formatDateTime, getRiskFromScore } from '../../utils/riskUtils';

type Nav   = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ReportDetail'>;

const MOCK_REPORT = {
  phone: '0988000111', score: 97,
  scamType: 'Mạo danh công an',
  description: 'Người gọi tự xưng là điều tra viên, yêu cầu chuyển tiền vào tài khoản đặc biệt để "giải tỏa" vụ án liên quan.',
  createdAt: new Date(Date.now() - 7200000).toISOString(),
  confirmCount: 45,
};

export function ReportDetailScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const [hasConfirmed, setConfirmed] = useState(false);

  const report = MOCK_REPORT;
  const level = getRiskFromScore(report.score);

  return (
    <SafeAreaView testID="report-detail-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title="Chi tiết báo cáo" />
      <ScrollView>
        <Card style={{ margin: spacing.lg }}>
          <Row style={{ gap: spacing.md, alignItems: 'center' }}>
            <PhoneAvatar riskLevel={level} size={48} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: theme.colors.textPrimary }]}>
                {formatPhone(report.phone)}
              </Text>
              <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
                {formatDateTime(report.createdAt)}
              </Text>
            </View>
            <RiskBadge level={level} score={report.score} />
          </Row>

          <Divider style={{ marginVertical: spacing.md }} />

          <View style={[
            styles.scamTypeBadge,
            { backgroundColor: theme.colors.riskHighBg, borderColor: theme.colors.riskHigh },
          ]}>
            <Text style={[typography.label, { color: theme.colors.riskHighText }]}>
              {report.scamType}
            </Text>
          </View>

          {report.description && (
            <Text style={[typography.body, { color: theme.colors.textSecondary, marginTop: spacing.md }]}>
              {report.description}
            </Text>
          )}
        </Card>

        <Card style={{ marginHorizontal: spacing.lg }}>
          <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
            <Text style={[typography.bodySmall, { color: theme.colors.textSecondary }]}>
              {report.confirmCount} người xác nhận báo cáo này
            </Text>
            <Button
              label={hasConfirmed ? 'Đã xác nhận' : 'Xác nhận'}
              variant={hasConfirmed ? 'ghost' : 'primary'}
              size="sm"
              onPress={() => setConfirmed(c => !c)}
              testID="btn-confirm"
            />
          </Row>
        </Card>

        <View style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl }}>
          <Button
            label="Tra cứu số này"
            variant="primary"
            fullWidth
            onPress={() => (navigation as any).navigate('Lookup')}
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
