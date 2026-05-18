import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView,
  Pressable, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AppInput } from '../../components/ui/AppInput';
import { Card, Row } from '../../components/ui/Card';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { isValidPhone } from '../../utils/riskUtils';
import { reportApi } from '../../api/apiClient';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const SCAM_TYPES = [
  { id: 'impersonation',   label: 'Mạo danh',     icon: '👤' },
  { id: 'financial_fraud', label: 'Thúc ép tiền', icon: '💰' },
  { id: 'prize_scam',      label: 'Trúng thưởng', icon: '🎟' },
  { id: 'loan_fraud',      label: 'Cho vay',       icon: '🏦' },
  { id: 'romance_scam',    label: 'Tình cảm',      icon: '❤️' },
  { id: 'other',           label: 'Khác',           icon: '…'  },
];

const FILTERS = ['Mới nhất', 'Phổ biến nhất'];

export function ReportScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [phone, setPhone]           = useState('');
  const [selectedType, setType]     = useState<string | null>(null);
  const [activeFilter, setFilter]   = useState('Mới nhất');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted]   = useState(false);
  const [submitErr, setSubmitErr]   = useState('');

  const handleSubmit = async () => {
    if (!isValidPhone(phone) || !selectedType) return;
    setSubmitting(true);
    setSubmitErr('');
    try {
      await reportApi.create({ phone, scenarioType: selectedType });
      setSubmitted(true);
      setPhone('');
      setType(null);
      setTimeout(() => setSubmitted(false), 3000);
    } catch (err: any) {
      setSubmitErr(err.message ?? 'Gửi báo cáo thất bại');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <SafeAreaView testID="report-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader title="Báo cáo & Cộng đồng" />
      <ScrollView>
        <Card style={{ margin: spacing.lg }}>
          <Text style={[typography.h4, { color: theme.colors.textPrimary, marginBottom: spacing.md }]}>
            Báo cáo cuộc gọi mới
          </Text>
          <AppInput
            label="Số điện thoại đáng ngờ"
            placeholder="0901 234 567"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={setPhone}
            testID="input-report-phone"
          />
          <Text style={[typography.label, { color: theme.colors.textSecondary, marginTop: spacing.md, marginBottom: spacing.sm }]}>
            Loại lừa đảo
          </Text>
          <View style={styles.typeGrid}>
            {SCAM_TYPES.map(t => (
              <Pressable
                key={t.id}
                testID={`scam-type-${t.id}`}
                onPress={() => setType(t.id)}
                style={[
                  styles.typeChip,
                  {
                    backgroundColor: selectedType === t.id ? theme.colors.accentLight : theme.colors.bgSecondary,
                    borderColor:     selectedType === t.id ? theme.colors.accent      : theme.colors.borderLight,
                  },
                ]}>
                <Text style={{ fontSize: 14 }}>{t.icon}</Text>
                <Text style={[
                  typography.bodySmall,
                  { color: selectedType === t.id ? theme.colors.accentText : theme.colors.textSecondary },
                ]}>
                  {t.label}
                </Text>
              </Pressable>
            ))}
          </View>
          {submitted && (
            <Text style={[typography.bodySmall, { color: theme.colors.riskLow, marginTop: spacing.sm }]}>
              ✓ Báo cáo đã gửi thành công
            </Text>
          )}
          {submitErr ? (
            <Text style={[typography.bodySmall, { color: theme.colors.danger, marginTop: spacing.sm }]}>
              {submitErr}
            </Text>
          ) : null}
          <Button
            label="Gửi báo cáo ẩn danh"
            onPress={handleSubmit}
            variant="primary"
            fullWidth
            loading={submitting}
            disabled={!isValidPhone(phone) || !selectedType}
            style={{ marginTop: spacing.md }}
            testID="btn-submit-report"
          />
          <Text style={[typography.caption, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing.sm }]}>
            Số điện thoại được mã hóa trước khi gửi
          </Text>
        </Card>

        <Row style={{ marginHorizontal: spacing.lg, marginBottom: spacing.sm, gap: spacing.sm }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterTab,
                {
                  backgroundColor: activeFilter === f ? theme.colors.accent : theme.colors.bgPrimary,
                  borderColor: activeFilter === f ? theme.colors.accent : theme.colors.borderMedium,
                },
              ]}>
              <Text style={[typography.label, { color: activeFilter === f ? '#fff' : theme.colors.textSecondary }]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </Row>

        <Card style={{ marginHorizontal: spacing.lg, marginBottom: spacing.xl }}>
          <Text style={[typography.bodySmall, { color: theme.colors.textSecondary, padding: spacing.md, textAlign: 'center' }]}>
            Danh sách báo cáo cộng đồng sẽ hiển thị ở đây
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:      { flex: 1 },
  typeGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  typeChip:  { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.md, borderWidth: 1 },
  filterTab: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
});
