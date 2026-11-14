import { StyleSheet, Text, TextInput, View } from 'react-native';
import theme from '../styles/theme';

export default function TextField({ label, error, multiline = false, style, inputStyle, ...inputProps }) {
  return (
    <View style={[styles.field, style]}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        {...inputProps}
        accessibilityLabel={label}
        multiline={multiline}
        placeholderTextColor={theme.colors.muted}
        style={[styles.input, multiline && styles.multiline, error && styles.inputError, inputStyle]}
      />
      {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { marginBottom: 16 },
  label: { color: theme.colors.text, fontSize: 14, fontWeight: '600', marginBottom: 7 },
  input: {
    minHeight: 48,
    paddingHorizontal: 13,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 11,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    fontSize: 16,
  },
  multiline: { minHeight: 100, paddingTop: 12, textAlignVertical: 'top' },
  inputError: { borderColor: theme.colors.danger },
  error: { marginTop: 5, color: theme.colors.danger, fontSize: 12 },
});
