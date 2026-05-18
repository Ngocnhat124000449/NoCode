import React, { useState } from 'react';
import {
  View, Text, FlatList, SafeAreaView, Pressable, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Card, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { PhoneAvatar } from '../../components/ui/PhoneAvatar';
import { ScreenHeader, EmptyState } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { formatPhone, formatDateTime, getRiskFromScore, RiskLevel } from '../../utils/riskUtils';

type Nav = NativeStackNavigationProp<RootStackParamList>;

const FILTERS = ['Tất cả', 'Rủi ro cao', 'Trung bình', 'Thấp'];

const MOCK_CALLS = [
  { phone: '0988000111', score: 97, timestamp: new Date(Date.now() - 5 * 60000).toISOString(), topReason: 'Mạo danh công an' },
  { phone: '0901234567', score: 75, timestamp: new Date(Date.now() - 30 * 60000).toISOString(), topReason: 'Thúc ép chuyển tiền' },
  { phone: '0909876543', score: 45, timestamp: new Date(Date.now() - 2 * 3600000).toISOString(), topReason: 'Giả ngân hàng' },
  { phone: '0912345678', score: 15, timestamp: new Date(Date.now() - 5 * 3600000).toISOString(), topReason: '' },
  { phone: '0977000222', score: 82, timestamp: new Date(Date.now() - 24 * 3600000).toISOString(), topReason: 'Đầu tư giả mạo' },
];

const FILTER_MAP: Record<string, (s: number) => boolean> = {
  'Tất cả':     () => true,
  'Rủi ro cao': s => s >= 55,
  'Trung bình': s => s >= 30 && s < 55,
  'Thấp':       s => s < 30,
};

export function CallHistoryScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [activeFilter, setFilter] = useState('Tất cả');

  const filtered = MOCK_CALLS.filter(c => FILTER_MAP[activeFilter](c.score));

  return (
    <SafeAreaView testID="call-history-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader leftAction="back" title="Lịch sử cuộc gọi" />

      <View style={[styles.filterBar, { backgroundColor: theme.colors.bgPrimary, borderBottomColor: theme.colors.borderLight }]}>
        <Row style={{ gap: spacing.sm }}>
          {FILTERS.map(f => (
            <Pressable
              key={f}
              onPress={() => setFilter(f)}
              style={[
                styles.filterChip,
                {
                  backgroundColor: activeFilter === f ? theme.colors.accent : 'transparent',
                  borderColor:     activeFilter === f ? theme.colors.accent  : theme.colors.borderMedium,
                },
              ]}>
              <Text style={[
                typography.label,
                { color: activeFilter === f ? '#fff' : theme.colors.textSecondary },
              ]}>
                {f}
              </Text>
            </Pressable>
          ))}
        </Row>
      </View>

      <FlatList
        data={filtered}
        contentContainerStyle={{ padding: spacing.lg, gap: spacing.sm }}
        keyExtractor={(item, i) => item.phone + i}
        ListEmptyComponent={<EmptyState icon="phone-off" message="Không có cuộc gọi nào trong bộ lọc này" />}
        renderItem={({ item }) => {
          const level = getRiskFromScore(item.score);
          return (
            <Card
              onPress={() => navigation.navigate('RiskDetail', { phone: item.phone })}
              padding="md">
              <Row style={{ alignItems: 'center', gap: spacing.md }}>
                <PhoneAvatar riskLevel={level} />
                <View style={{ flex: 1 }}>
                  <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, fontWeight: '500' }]}>
                    {formatPhone(item.phone)}
                  </Text>
                  <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>
                    {formatDateTime(item.timestamp)}
                  </Text>
                </View>
                <RiskBadge level={level} score={item.score} />
              </Row>
              {item.topReason ? (
                <Row style={{ gap: spacing.xs, marginTop: spacing.sm, paddingHorizontal: spacing.xs }}>
                  <Text style={{ color: theme.colors.warning, fontSize: 11 }}>⚠</Text>
                  <Text style={[typography.caption, { color: theme.colors.textSecondary, flex: 1 }]}>
                    {item.topReason}
                  </Text>
                </Row>
              ) : null}
            </Card>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  filterBar:  { paddingHorizontal: spacing.lg, paddingVertical: spacing.md, borderBottomWidth: 0.5 },
  filterChip: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: radius.full, borderWidth: 1 },
});
