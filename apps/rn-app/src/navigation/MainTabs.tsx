import React from 'react';
import { Text } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useTheme } from '../theme/ThemeContext';
import { HomeScreen } from '../screens/main/HomeScreen';
import { LookupScreen } from '../screens/main/LookupScreen';
import { ReportScreen } from '../screens/main/ReportScreen';
import { ProfileScreen } from '../screens/main/ProfileScreen';

const Tab = createBottomTabNavigator();

const TAB_ICONS: Record<string, string> = {
  Home:    '🏠',
  Lookup:  '🔍',
  Report:  '🚩',
  Profile: '👤',
};

export function MainTabs() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused }) => (
          <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.5 }}>
            {TAB_ICONS[route.name]}
          </Text>
        ),
        tabBarActiveTintColor:   theme.colors.accent,
        tabBarInactiveTintColor: theme.colors.textTertiary,
        tabBarStyle: {
          backgroundColor: theme.colors.bgPrimary,
          borderTopWidth: 0.5,
          borderTopColor: theme.colors.borderLight,
          height: 60,
        },
        tabBarLabelStyle: { fontSize: 10, fontWeight: '500', paddingBottom: 4 },
      })}>
      <Tab.Screen name="Home"    component={HomeScreen}    options={{ tabBarLabel: 'Trang chủ' }} />
      <Tab.Screen name="Lookup"  component={LookupScreen}  options={{ tabBarLabel: 'Tra cứu' }} />
      <Tab.Screen name="Report"  component={ReportScreen}  options={{ tabBarLabel: 'Báo cáo' }} />
      <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: 'Tài khoản' }} />
    </Tab.Navigator>
  );
}
