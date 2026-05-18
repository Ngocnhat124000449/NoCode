import React, { useState } from 'react';
import {
  View, Text, ScrollView, SafeAreaView, StyleSheet,
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

type Nav = NativeStackNavigationProp<RootStackParamList>;

const CONFIRM_TEXT = 'XÓA TÀI KHOẢN';

const DELETION_ITEMS = [
  { icon: '👤', label: 'Thông tin tài khoản của bạn' },
  { icon: '🚩', label: 'Tất cả báo cáo bạn đã gửi' },
  { icon: '🕐', label: 'Lịch sử tra cứu và cuộc gọi' },
  { icon: '🗄️', label: 'Điểm tín nhiệm và đóng góp' },
];

export function DataDeletionScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const [confirmText, setConfirmText] = useState('');
  const [isDeleting, setDeleting]     = useState(false);
  const [error, setError]             = useState('');

  const handleDelete = () => {
    if (confirmText !== CONFIRM_TEXT) {
      setError(`Nhập chính xác "${CONFIRM_TEXT}"`);
      return;
    }
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      navigation.replace('Login');
    }, 1000);
  };

  return (
    <SafeAreaView testID="data-deletion-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <ScreenHeader leftAction="back" title="Xóa dữ liệu" />
      <ScrollView contentContainerStyle={{ padding: spacing.xl }}>
        <View style={{ alignItems: 'center', marginBottom: spacing.lg }}>
          <Text style={{ fontSize: 48 }}>🗑️</Text>
          <Text style={[typography.h3, { color: theme.colors.danger, textAlign: 'center', marginTop: spacing.md }]}>
            Xóa toàn bộ dữ liệu
          </Text>
          <Text style={[typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
            Hành động này sẽ xóa vĩnh viễn:
          </Text>
        </View>

        <Card style={{ marginBottom: spacing.lg }}>
          {DELETION_ITEMS.map((item, i) => (
            <Row key={i} style={{ alignItems: 'center', gap: spacing.md, paddingVertical: spacing.sm }}>
              <Text style={{ fontSize: 18, width: 28 }}>{item.icon}</Text>
              <Text style={[typography.bodySmall, { color: theme.colors.textPrimary, flex: 1 }]}>
                {item.label}
              </Text>
            </Row>
          ))}
        </Card>

        <View style={[
          styles.warningCard,
          { backgroundColor: theme.colors.riskMediumBg, borderColor: theme.colors.riskMedium },
        ]}>
          <Row style={{ gap: spacing.sm, alignItems: 'flex-start' }}>
            <Text style={{ fontSize: 18 }}>⚠️</Text>
            <Text style={[typography.bodySmall, { color: theme.colors.riskMediumText, flex: 1 }]}>
              Dữ liệu đã xóa không thể khôi phục. Báo cáo cộng đồng đã được ẩn danh sẽ được giữ lại để bảo vệ người dùng khác.
            </Text>
          </Row>
        </View>

        <AppInput
          label={`Nhập "${CONFIRM_TEXT}" để xác nhận`}
          placeholder={CONFIRM_TEXT}
          value={confirmText}
          onChangeText={text => { setConfirmText(text); setError(''); }}
          error={error}
          style={{ marginTop: spacing.xl }}
          testID="input-confirm-delete"
        />

        <Button
          label="Xóa vĩnh viễn"
          onPress={handleDelete}
          variant="danger"
          fullWidth
          disabled={confirmText !== CONFIRM_TEXT}
          loading={isDeleting}
          style={{ marginTop: spacing.lg }}
          testID="btn-delete"
        />
        <Button
          label="Hủy"
          onPress={() => navigation.goBack()}
          variant="ghost"
          fullWidth
          style={{ marginTop: spacing.sm }}
          testID="btn-cancel"
        />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:        { flex: 1 },
  warningCard: { padding: spacing.md, borderRadius: radius.lg, borderWidth: 1, marginTop: spacing.xl },
});
