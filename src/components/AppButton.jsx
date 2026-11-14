import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import theme from '../styles/theme';

const variants = {
  primary: { backgroundColor: theme.colors.primary, color: '#FFFFFF', borderColor: theme.colors.primary },
  accent: { backgroundColor: theme.colors.accent, color: theme.colors.text, borderColor: theme.colors.accent },
  outline: { backgroundColor: 'transparent', color: theme.colors.primary, borderColor: theme.colors.border },
  danger: { backgroundColor: theme.colors.danger, color: '#FFFFFF', borderColor: theme.colors.danger },
};

export default function AppButton({ title, onPress, variant = 'primary', loading = false, disabled = false, style }) {
  const colors = variants[variant] ?? variants.primary;
  const unavailable = disabled || loading;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ disabled: unavailable, busy: loading }}
      onPress={onPress}
      disabled={unavailable}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.backgroundColor, borderColor: colors.borderColor },
        pressed && !unavailable && styles.pressed,
        unavailable && styles.disabled,
        style,
      ]}
    >
      {loading ? <ActivityIndicator color={colors.color} /> : <Text style={[styles.label, { color: colors.color }]}>{title}</Text>}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    minHeight: 48,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: { fontSize: 15, fontWeight: '700' },
  pressed: { opacity: 0.82 },
  disabled: { opacity: 0.6 },
});
