import React from 'react';
import { View, SafeAreaView, ActivityIndicator } from 'react-native';
import WebView from 'react-native-webview';
import { useTheme } from '../../theme/ThemeContext';
import { ScreenHeader } from '../../components/layout/ScreenHeader';

const PRIVACY_URL = 'https://ngocnhat124000449.github.io/NoCode/privacy-policy.html';

export function PrivacyPolicyScreen() {
  const { theme } = useTheme();

  const darkModeScript = theme.dark
    ? `document.documentElement.style.filter='invert(0.85) hue-rotate(180deg)';true;`
    : undefined;

  return (
    <SafeAreaView testID="privacy-policy-screen" style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}>
      <ScreenHeader leftAction="back" title="Chính sách bảo mật" />
      <WebView
        source={{ uri: PRIVACY_URL }}
        style={{ flex: 1, backgroundColor: theme.colors.bgPrimary }}
        startInLoadingState
        injectedJavaScript={darkModeScript}
        renderLoading={() => (
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: theme.colors.bgPrimary }}>
            <ActivityIndicator color={theme.colors.accent} size="large" />
          </View>
        )}
      />
    </SafeAreaView>
  );
}
