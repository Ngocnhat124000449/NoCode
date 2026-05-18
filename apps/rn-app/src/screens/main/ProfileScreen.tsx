import React, { useState } from 'react';
import {
  View, Text, ScrollView, Pressable, StyleSheet, SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, typography, radius } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { Card, Divider, Row } from '../../components/ui/Card';
import { RiskBadge } from '../../components/ui/RiskBadge';
import { Avatar } from '../../components/ui/PhoneAvatar';
import { Toggle } from '../../components/ui/Toggle';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';
import { getInitials, formatPhone } from '../../utils/riskUtils';
import { useAuth } from '../../context/AuthContext';

type Nav = NativeStackNavigationProp<RootStackParamList>;

interface SettingRowProps {
  icon: string;
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  onPress?: () => void;
  titleColor?: string;
  divider?: boolean;
}

function SettingRow({ icon, title, subtitle, right, onPress, titleColor, divider }: SettingRowProps) {
  const { theme } = useTheme();
  const inner = (
    <Row style={styles.settingRow}>
      <Text style={{ fontSize: 18, width: 28 }}>{icon}</Text>
      <View style={{ flex: 1 }}>
        <Text style={[typography.bodySmall, { color: titleColor ?? theme.colors.textPrimary, fontWeight: '500' }]}>
          {title}
        </Text>
        {subtitle && (
          <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>{subtitle}</Text>
        )}
      </View>
      {right}
    </Row>
  );

  return (
    <>
      {onPress
        ? <Pressable onPress={onPress} android_ripple={{ color: theme.colors.overlay }}>{inner}</Pressable>
        : inner
      }
      {divider && <Divider />}
    </>
  );
}

function StatCard({ label, value, valueColor }: { label: string; value: number; valueColor?: string }) {
  const { theme } = useTheme();
  return (
    <Card style={{ flex: 1, alignItems: 'center' }}>
      <Text style={[typography.h2, { color: valueColor ?? theme.colors.textPrimary }]}>{value}</Text>
      <Text style={[typography.caption, { color: theme.colors.textSecondary }]}>{label}</Text>
    </Card>
  );
}

export function ProfileScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const { user, logout } = useAuth();
  const [callScreening, setCallScreening]   = useState(true);
  const [highRiskNotif, setHighRiskNotif]   = useState(true);
  const [autoReport, setAutoReport]         = useState(false);

  const displayName = user?.name ?? 'Người dùng';
  const displayPhone = user?.phone ?? '';

  const handleLogout = () => {
    logout();
    navigation.replace('Login');
  };

  return (
    <SafeAreaView testID="profile-screen" style={[styles.safe, { backgroundColor: theme.colors.bgSecondary }]}>
      <ScreenHeader title="Tài khoản" />
      <ScrollView>
        <Card style={{ margin: spacing.lg }}>
          <Row style={{ gap: spacing.md, alignItems: 'center' }}>
            <Avatar initials={getInitials(displayName)} size={56} />
            <View style={{ flex: 1 }}>
              <Text style={[typography.h4, { color: theme.colors.textPrimary }]}>{displayName}</Text>
              {displayPhone ? (
                <Text style={[typography.bodySmall, { color: theme.colors.textSecondary }]}>
                  {formatPhone(displayPhone)}
                </Text>
              ) : null}
              <RiskBadge level="low" customLabel="Thành viên tích cực" size="sm" style={{ marginTop: spacing.xs }} />
            </View>
          </Row>
        </Card>

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.md }}>
          <Text style={[typography.h4, { color: theme.colors.textPrimary, marginBottom: spacing.xs }]}>
            Cài đặt bảo vệ
          </Text>
          <SettingRow icon="📞" title="Cảnh báo cuộc gọi đến" subtitle="CallScreeningService" right={<Toggle value={callScreening} onValueChange={setCallScreening} />} divider />
          <SettingRow icon="🔔" title="Thông báo rủi ro cao" subtitle="Khi điểm ≥ 60" right={<Toggle value={highRiskNotif} onValueChange={setHighRiskNotif} />} divider />
          <SettingRow icon="🗄️" title="Báo cáo ẩn danh tự động" subtitle="Đóng góp cho cộng đồng" right={<Toggle value={autoReport} onValueChange={setAutoReport} />} />
        </Card>

        <Card style={{ marginHorizontal: spacing.lg, marginTop: spacing.md, marginBottom: spacing.xl }}>
          <SettingRow icon="🔒" title="Chính sách bảo mật" right={<Text>›</Text>} onPress={() => navigation.navigate('PrivacyPolicy')} divider />
          <SettingRow icon="📄" title="Điều khoản sử dụng" right={<Text>›</Text>} onPress={() => navigation.navigate('TermsOfService')} divider />
          <SettingRow icon="🔔" title="Cài đặt thông báo" right={<Text>›</Text>} onPress={() => navigation.navigate('NotificationSettings')} divider />
          <SettingRow icon="🗑️" title="Xóa tài khoản" titleColor={theme.colors.danger} right={<Text style={{ color: theme.colors.danger }}>›</Text>} onPress={() => navigation.navigate('DataDeletion')} divider />
          <SettingRow icon="🚪" title="Đăng xuất" titleColor={theme.colors.danger} right={<Text style={{ color: theme.colors.danger }}>›</Text>} onPress={handleLogout} />
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:       { flex: 1 },
  settingRow: { alignItems: 'center', gap: spacing.md, paddingVertical: spacing.md },
});
