import React, { useState } from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { useRoute, RouteProp, useNavigation } from '@react-navigation/native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing } from '../../theme/tokens';
import { Button } from '../../components/ui/Button';
import { ScreenHeader } from '../../components/layout/ScreenHeader';
import { RootStackParamList } from '../../navigation/AppNavigator';

type Route = RouteProp<RootStackParamList, 'TermsOfService'>;

const TERMS_URL = 'https://ngocnhat124000449.github.io/NoCode/terms-of-service.html';

export function TermsOfServiceScreen() {
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute<Route>();
  const showAgreeButton = route.params?.showAgreeButton ?? false;
  const [scrolledToBottom, setScrolled] = useState(false);

  const darkModeScript = theme.dark
    ? `document.documentElement.style.filter='invert(0.85) hue-rotate(180deg)';true;`
    : undefined;

  return (
    <SafeAreaView testID="terms-of-service-screen" style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader leftAction="back" title="Điều khoản sử dụng" />
      <WebView
        source={{ uri: TERMS_URL }}
        style={{ flex: 1 }}
        startInLoadingState
        injectedJavaScript={darkModeScript}
        onScroll={e => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
            setScrolled(true);
          }
        }}
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgPrimary }}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
          </View>
        )}
      />
      {showAgreeButton && (
        <View style={{ padding: spacing.lg, backgroundColor: theme.colors.bgPrimary, borderTopWidth: 0.5, borderTopColor: theme.colors.borderLight }}>
          <Button
            label="Tôi đồng ý"
            onPress={() => navigation.goBack()}
            variant="primary"
            fullWidth
            disabled={!scrolledToBottom}
            testID="btn-agree"
          />
        </View>
      )}
    </SafeAreaView>
  );
}
