import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Link, router } from 'expo-router';
import AppButton from '../../components/AppButton';
import AppScreen from '../../components/AppScreen';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

export default function RegisterScreen() {
  const { register, user, loading: restoring } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!restoring && user) router.replace('/products');
  }, [restoring, user]);

  async function handleRegister() {
    setError('');
    if (!name.trim() || !email.trim() || !password || !confirmation) return setError('Completa todos los campos.');
    if (password.length < 8) return setError('La contraseña debe tener al menos 8 caracteres.');
    if (password !== confirmation) return setError('Las contraseñas no coinciden.');
    setSubmitting(true);
    try {
      await register({ name: name.trim(), email: email.trim(), password });
      router.replace('/products');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <AppScreen>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          <View style={styles.brand}><Text style={styles.brandIcon}>🛍️</Text><Text style={styles.brandName}>FINazon</Text></View>
          <View style={styles.card}>
            <Text style={styles.title}>Crea tu cuenta</Text>
            <Text style={styles.subtitle}>Regístrate para explorar el catálogo.</Text>
            <TextField label="Nombre" value={name} onChangeText={setName} autoComplete="name" />
            <TextField label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <TextField label="Contraseña (mínimo 8 caracteres)" value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" />
            <TextField label="Repite tu contraseña" value={confirmation} onChangeText={setConfirmation} secureTextEntry autoComplete="new-password" />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <AppButton title="Crear cuenta" onPress={handleRegister} loading={submitting} />
            <View style={styles.switchRow}><Text style={styles.switchText}>¿Ya tienes cuenta?</Text><Link href="/auth/login" style={styles.link}> Inicia sesión</Link></View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AppScreen>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  brand: { alignItems: 'center', marginBottom: 24 },
  brandIcon: { fontSize: 42, marginBottom: 4 },
  brandName: { color: theme.colors.primary, fontSize: 22, fontWeight: '800' },
  card: { width: '100%', maxWidth: 440, alignSelf: 'center', backgroundColor: theme.colors.surface, borderRadius: 18, borderWidth: 1, borderColor: theme.colors.border, padding: 22 },
  title: { color: theme.colors.text, fontSize: 25, fontWeight: '800' },
  subtitle: { color: theme.colors.muted, fontSize: 14, marginTop: 5, marginBottom: 22 },
  error: { color: theme.colors.danger, marginBottom: 12, fontSize: 14 },
  switchRow: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap', marginTop: 20 },
  switchText: { color: theme.colors.muted, fontSize: 14 },
  link: { color: theme.colors.primary, fontSize: 14, fontWeight: '700' },
});
