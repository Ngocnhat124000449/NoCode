import React from 'react';
import {
  View, Text, StyleSheet, Linking,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Row } from '../../components/ui/Card';
import { RiskLevel, getRiskColors, formatPhone } from '../../utils/riskUtils';

interface CallRiskOverlayProps {
  callerPhone: string;
  score: number;
  riskLevel: RiskLevel;
  reasons: Array<{ code: string; title: string }>;
  officialNumber?: string;
  onDismiss: () => void;
  onReport: () => void;
}

export function CallRiskOverlay({
  callerPhone, score, riskLevel, reasons,
  officialNumber = '18005999920',
  onDismiss, onReport,
}: CallRiskOverlayProps) {
  const { theme } = useTheme();
  const { color, bg } = getRiskColors(riskLevel, theme);

  return (
    <View
      testID="call-risk-overlay"
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.bgPrimary,
          borderColor: color,
          shadowColor: '#000',
        },
      ]}>
      <Row style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Row style={{ gap: spacing.sm, alignItems: 'center' }}>
          <Text style={{ fontSize: 16 }}>🛡️</Text>
          <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
            ScamShield · Phân tích đang chạy
          </Text>
        </Row>
        <Text
          style={{ fontSize: 18, color: theme.colors.textSecondary, padding: spacing.xs }}
          onPress={onDismiss}>
          ✕
        </Text>
      </Row>

      <Text style={[typography.h2, { color: theme.colors.textPrimary, marginTop: spacing.md }]}>
        {formatPhone(callerPhone)}
      </Text>
      <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>Cuộc gọi đến</Text>

      <View style={[styles.scoreBadge, { backgroundColor: theme.colors.bgSecondary, borderRadius: radius.lg }]}>
        <Text style={[typography.h1, { color, fontSize: 48, lineHeight: 56 }]}>{score}</Text>
        <RiskBadge level={riskLevel} size="md" style={{ marginTop: spacing.sm }} />
      </View>

      {reasons.slice(0, 2).length > 0 && (
        <View style={{ marginTop: spacing.md }}>
          <Text style={[typography.label, { color: theme.colors.textSecondary, marginBottom: spacing.xs }]}>
            Lý do nghi ngờ:
          </Text>
          {reasons.slice(0, 2).map(r => (
            <Row key={r.code} style={{ gap: spacing.sm, marginTop: spacing.xs }}>
              <Text style={{ color, fontSize: 12 }}>⚠</Text>
              <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, flex: 1 }]}>
                [{r.code}] {r.title}
              </Text>
            </Row>
          ))}
        </View>
      )}

      <Button label="Không chuyển tiền" onPress={() => {}} variant="danger" fullWidth style={{ marginTop: spacing.md }} />
      <Button
        label={`Gọi ${officialNumber}`}
        onPress={() => Linking.openURL(`tel:${officialNumber}`)}
        variant="primary"
        fullWidth
        style={{ marginTop: spacing.sm }}
      />
      <Button label="Báo cáo cuộc gọi này" onPress={onReport} variant="outline" fullWidth style={{ marginTop: spacing.sm }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: 320,
    borderRadius: radius.xl,
    borderWidth: 1.5,
    padding: spacing.lg,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 4 },
    elevation: 12,
  },
  scoreBadge: { padding: spacing.lg, marginTop: spacing.sm, alignItems: 'center' },
});
