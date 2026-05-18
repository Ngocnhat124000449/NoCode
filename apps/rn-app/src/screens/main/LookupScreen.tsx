import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView,
  Pressable, StyleSheet, Linking,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { AppInput } from '../../components/ui/AppInput';
import { Card, Divider, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { ScoreCircle } from '../../components/ui/ScoreCircle';
import { PhoneAvatar } from '../../components/ui/PhoneAvatar';
import { ScreenHeader, SectionHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, getRiskFromScore } from '../../utils/riskUtils';
import { useRiskLookup } from '../../hooks/useRiskLookup';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const RECENT_SEARCHES = ['0901234567', '0988000111', '0909876543'];

export function LookupScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [phone, setPhone]           = useState('');
  const [searchPhone, setSearchPhone] = useState('');

  const { data, isLoading, isStale, cacheAgeMinutes, error } = useRiskLookup(searchPhone);

  const handleLookup = () => {
    if (phone.length >= 9) setSearchPhone(phone);
  };

  const quickLookup = (p: string) => {
    setPhone(p);
    setSearchPhone(p);
  };

  return (
    <SafeAreaView testID="lookup-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader title="Tra cứu số điện thoại" />

      <View style={[styles.searchBar, { backgroundColor: theme.colors.bgPrimary, borderBottomColor: theme.colors.borderLight }]}>
        <Row style={{ gap: spacing.sm }}>
          <AppInput
            placeholder="Nhập số điện thoại..."
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            style={{ flex: 1 }}
            testID="input-phone-lookup"
          />
          <Button
            label="Tìm"
            onPress={handleLookup}
            variant="primary"
            disabled={phone.length < 9}
            loading={isLoading}
            size="md"
            style={{ width: 72 }}
            testID="btn-search"
          />
        </Row>
      </View>

      <ScrollView>
        {searchPhone && data ? (
          <Card style={{ margin: spacing.lg }}>
            {isStale && cacheAgeMinutes !== null && (
              <View style={[styles.staleBanner, { backgroundColor: theme.colors.riskMediumBg }]}>
                <Text style={[typography.caption, { color: theme.colors.riskMediumText }]}>
                  Dữ liệu cache từ {cacheAgeMinutes} phút trước
                </Text>
              </View>
            )}
            <Row style={{ gap: spacing.md, alignItems: 'center' }}>
              <ScoreCircle score={data.score} size={80} />
              <View style={{ flex: 1 }}>
                <Text style={[typography.h3, { color: theme.colors.textPrimary }]}>
                  {formatPhone(searchPhone)}
                </Text>
                <RiskBadge level={getRiskFromScore(data.score)} score={data.score} size="md" style={{ marginTop: spacing.xs }} />
              </View>
            </Row>

            {data.reasons.length > 0 && (
              <>
                <Divider style={{ marginVertical: spacing.md }} />
                <Text style={[typography.label, { color: theme.colors.textSecondary, marginBottom: spacing.sm }]}>
                  Lý do cảnh báo:
                </Text>
                {data.reasons.map((r, i) => (
                  <Row key={i} style={{ gap: spacing.sm, marginBottom: spacing.sm }}>
                    <Text style={{ color: theme.colors.warning }}>⚠</Text>
                    <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, flex: 1 }]}>{r}</Text>
                  </Row>
                ))}
              </>
            )}

            <Divider style={{ marginVertical: spacing.md }} />
            <Button
              label="Gọi 1800 599 920 (VNCERT)"
              onPress={() => Linking.openURL('tel:18005999920')}
              variant="primary"
              fullWidth
              style={{ marginBottom: spacing.sm }}
            />
            <Button
              label="Báo cáo số này"
              onPress={() => (navigation as any).navigate('Report')}
              variant="outline"
              fullWidth
            />
          </Card>
        ) : searchPhone && error ? (
          <Card style={{ margin: spacing.lg, alignItems: 'center' }}>
            <Text style={[typography.bodySmall, { color: theme.colors.danger }]}>{error}</Text>
          </Card>
        ) : searchPhone && isLoading ? (
          <Card style={{ margin: spacing.lg, alignItems: 'center', padding: spacing.xl }}>
            <Text style={[typography.bodySmall, { color: theme.colors.textSecondary }]}>Đang tra cứu...</Text>
          </Card>
        ) : (
          <>
            <SectionHeader title="Tìm kiếm gần đây" style={{ marginHorizontal: spacing.lg, marginTop: spacing.lg }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingVertical: spacing.sm, gap: spacing.sm }}>
              {RECENT_SEARCHES.map(p => (
                <Pressable
                  key={p}
                  onPress={() => quickLookup(p)}
                  style={[styles.chip, { backgroundColor: theme.colors.bgSecondary, borderColor: theme.colors.borderMedium }]}>
                  <Text style={[typography.bodySmall, { color: theme.colors.textSecondary }]}>{formatPhone(p)}</Text>
                </Pressable>
              ))}
            </ScrollView>
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  searchBar:   { padding: spacing.lg, borderBottomWidth: 0.5 },
  chip:        { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, borderRadius: radius.full, borderWidth: 1 },
  staleBanner: { padding: spacing.sm, borderRadius: radius.sm, marginBottom: spacing.md },
});
