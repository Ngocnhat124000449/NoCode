import React, { useState } from 'react';
import {
  View, Text, TextInput, StyleSheet,
  KeyboardTypeOptions, ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/ThemeContext';
import { spacing, radius, typography } from '../../theme/tokens';

interface AppInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChangeText: (text: string) => void;
  keyboardType?: KeyboardTypeOptions;
  rightElement?: React.ReactNode;
  error?: string;
  secureTextEntry?: boolean;
  style?: ViewStyle;
  testID?: string;
}

export function AppInput({
  label, placeholder, value, onChangeText, keyboardType,
  rightElement, error, secureTextEntry, style, testID,
}: AppInputProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = useState(false);

  const borderColor = error
    ? theme.colors.danger
    : focused
      ? theme.colors.accent
      : theme.colors.borderLight;

  return (
    <View style={style}>
      {label ? (
        <Text style={[typography.caption, { color: theme.colors.textSecondary, marginBottom: 6 }]}>
          {label}
        </Text>
      ) : null}
      <View style={[
        styles.inputContainer,
        {
          backgroundColor: theme.colors.bgSecondary,
          borderColor,
          borderWidth: 1.5,
          borderRadius: radius.md,
        },
      ]}>
        <TextInput
          testID={testID}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          keyboardType={keyboardType}
          secureTextEntry={secureTextEntry}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          selectionColor={theme.colors.accent}
          keyboardAppearance={theme.dark ? 'dark' : 'light'}
          style={[
            styles.input,
            typography.body,
            { color: theme.colors.textPrimary, flex: 1 },
          ]}
        />
        {rightElement}
      </View>
      {error ? (
        <Text style={[typography.caption, { color: theme.colors.danger, marginTop: 4 }]}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  inputContainer: { flexDirection: 'row', alignItems: 'center', height: 48, paddingHorizontal: spacing.md },
  input:          { flex: 1 },
});
