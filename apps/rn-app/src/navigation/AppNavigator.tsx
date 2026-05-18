import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '../theme/ThemeContext';

import { SplashScreen }      from '../screens/entry/SplashScreen';
import { OnboardingScreen }  from '../screens/entry/OnboardingScreen';
import { PermissionScreen }  from '../screens/entry/PermissionScreen';
import { LoginScreen }       from '../screens/auth/LoginScreen';
import { RegisterScreen }    from '../screens/auth/RegisterScreen';
import { OTPScreen }         from '../screens/auth/OTPScreen';
import { ForgotPasswordScreen } from '../screens/auth/ForgotPasswordScreen';
import { MainTabs }          from './MainTabs';
import { RiskDetailScreen }  from '../screens/detail/RiskDetailScreen';
import { CallHistoryScreen } from '../screens/detail/CallHistoryScreen';
import { ReportDetailScreen } from '../screens/detail/ReportDetailScreen';
import { NotificationSettingsScreen }  from '../screens/settings/NotificationSettingsScreen';
import { PermissionManagementScreen }  from '../screens/settings/PermissionManagementScreen';
import { PrivacyPolicyScreen }   from '../screens/legal/PrivacyPolicyScreen';
import { TermsOfServiceScreen }  from '../screens/legal/TermsOfServiceScreen';
import { DataDeletionScreen }    from '../screens/legal/DataDeletionScreen';

export type RootStackParamList = {
  Splash:         undefined;
  Onboarding:     undefined;
  Permission:     undefined;
  Login:          undefined;
  Register:       undefined;
  OTP:            { phone: string; userId: string };
  ForgotPassword: undefined;
  MainTabs:       undefined;
  RiskDetail:     { phone: string };
  CallHistory:    undefined;
  ReportDetail:   { reportId: string };
  NotificationSettings:  undefined;
  PermissionManagement:  undefined;
  PrivacyPolicy:  undefined;
  TermsOfService: { showAgreeButton?: boolean } | undefined;
  DataDeletion:   undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export function AppNavigator() {
  const { theme } = useTheme();

  return (
    <NavigationContainer
      theme={{
        dark: theme.dark,
        colors: {
          primary:      theme.colors.accent,
          background:   theme.colors.bgPrimary,
          card:         theme.colors.bgPrimary,
          text:         theme.colors.textPrimary,
          border:       theme.colors.borderLight,
          notification: theme.colors.danger,
        },
      }}>
      <Stack.Navigator screenOptions={{ headerShown: false, animation: 'slide_from_right' }} initialRouteName="Splash">
        <Stack.Screen name="Splash"         component={SplashScreen} />
        <Stack.Screen name="Onboarding"     component={OnboardingScreen} />
        <Stack.Screen name="Permission"     component={PermissionScreen} />
        <Stack.Screen name="Login"          component={LoginScreen} />
        <Stack.Screen name="Register"       component={RegisterScreen} />
        <Stack.Screen name="OTP"            component={OTPScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="MainTabs"       component={MainTabs} />
        <Stack.Screen name="RiskDetail"     component={RiskDetailScreen} />
        <Stack.Screen name="CallHistory"    component={CallHistoryScreen} />
        <Stack.Screen name="ReportDetail"   component={ReportDetailScreen} />
        <Stack.Screen name="NotificationSettings" component={NotificationSettingsScreen} />
        <Stack.Screen name="PermissionManagement" component={PermissionManagementScreen} />
        <Stack.Screen name="PrivacyPolicy"  component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfService" component={TermsOfServiceScreen} />
        <Stack.Screen name="DataDeletion"   component={DataDeletionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
