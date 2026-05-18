import React, { useRef, useState } from 'react';
import {
  View, Text, FlatList, Pressable,
  StyleSheet, SafeAreaView, Dimensions,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, typography } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Nav = NativeStackNavigationProp<RootStackParamList, 'Onboarding'>;
const { width: SCREEN_WIDTH } = Dimensions.get('window');

const slides = [
  {
    key: '1',
    icon: '🛡️',
    title: 'Phát hiện cuộc gọi lừa đảo',
    description: 'ScamShield tự động phân tích cuộc gọi đến và cảnh báo ngay khi phát hiện dấu hiệu nguy hiểm — trước khi bạn kịp chuyển tiền.',
  },
  {
    key: '2',
    icon: '📊',
    title: 'Chấm điểm rủi ro có giải thích',
    description: 'Điểm rủi ro từ 0–100 kèm lý do cụ thể. Không có hộp đen — bạn luôn biết tại sao cuộc gọi bị đánh dấu nguy hiểm.',
  },
  {
    key: '3',
    icon: '👥',
    title: 'Sức mạnh cộng đồng',
    description: 'Mỗi báo cáo của bạn bảo vệ hàng nghìn người khác. Dữ liệu được ẩn danh và chia sẻ để cảnh báo nhanh hơn cho cộng đồng.',
  },
];

function Slide({ item }: { item: typeof slides[0] }) {
  const { theme } = useTheme();
  return (
    <View style={[styles.slide, { width: SCREEN_WIDTH }]}>
      <View style={[styles.illustration, { backgroundColor: theme.colors.bgSecondary, borderRadius: radius.xl }]}>
        <Text style={{ fontSize: 80 }}>{item.icon}</Text>
      </View>
      <Text style={[typography.h2, { color: theme.colors.textPrimary, textAlign: 'center', marginTop: spacing.xl }]}>
        {item.title}
      </Text>
      <Text style={[typography.body, { color: theme.colors.textSecondary, textAlign: 'center', marginTop: spacing.md }]}>
        {item.description}
      </Text>
    </View>
  );
}

export function OnboardingScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation<Nav>();
  const flatRef = useRef<FlatList>(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const goNext = () => {
    if (currentIndex < slides.length - 1) {
      flatRef.current?.scrollToIndex({ index: currentIndex + 1 });
      setCurrentIndex(i => i + 1);
    }
  };

  const goToPermission = () => navigation.replace('Permission');

  return (
    <SafeAreaView testID="onboarding-screen" style={[styles.safe, { backgroundColor: theme.colors.bgPrimary }]}>
      <FlatList
        ref={flatRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEventThrottle={16}
        showsHorizontalScrollIndicator={false}
        renderItem={({ item }) => <Slide item={item} />}
        keyExtractor={item => item.key}
        onMomentumScrollEnd={e => {
          setCurrentIndex(Math.round(e.nativeEvent.contentOffset.x / SCREEN_WIDTH));
        }}
        style={{ flex: 1 }}
      />

      <View style={styles.dots}>
        {slides.map((_, i) => (
          <View
            key={i}
            style={[
              styles.dot,
              {
                backgroundColor: i === currentIndex ? theme.colors.accent : theme.colors.borderMedium,
                width: i === currentIndex ? 20 : 8,
              },
            ]}
          />
        ))}
      </View>

      <View style={{ padding: spacing.xl, gap: spacing.sm }}>
        {currentIndex < slides.length - 1
          ? <Button label="Tiếp theo" onPress={goNext} variant="primary" fullWidth />
          : <Button label="Bắt đầu" onPress={goToPermission} variant="primary" fullWidth />
        }
        {currentIndex < slides.length - 1 && (
          <Button label="Bỏ qua" onPress={goToPermission} variant="ghost" fullWidth />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe:         { flex: 1 },
  slide:        { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  illustration: { width: 260, height: 260, alignItems: 'center', justifyContent: 'center' },
  dots:         { flexDirection: 'row', justifyContent: 'center', gap: spacing.xs, marginBottom: spacing.lg },
  dot:          { height: 8, borderRadius: radius.full },
});
