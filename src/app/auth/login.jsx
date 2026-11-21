import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View, Image } from 'react-native';
import { Link, router } from 'expo-router';
import AppButton from '../../components/AppButton';
import AppScreen from '../../components/AppScreen';
import TextField from '../../components/TextField';
import { useAuth } from '../../context/AuthContext';
import theme from '../../styles/theme';

export default function LoginScreen() {
  const { login, user, loading: restoring } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!restoring && user) router.replace('/products');
  }, [restoring, user]);

  async function handleLogin() {
    setError('');
    if (!email.trim() || !password) return setError('Escribe tu correo y contraseña.');
    setSubmitting(true);
    try {
      await login({ email: email.trim(), password });
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
          <View style={styles.logoContainer}>
            <Image
              source={require('../../../assets/icon.png')}
              style={styles.logo}
              resizeMode="contain"
            />
          </View>
          <View style={styles.card}>
            <Text style={styles.title}>Inicia sesión</Text>
            <Text style={styles.subtitle}>Entra para ver el catálogo y tu carrito.</Text>
            <TextField label="Correo electrónico" value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" />
            <TextField label="Contraseña" value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" />
            {error ? <Text accessibilityRole="alert" style={styles.error}>{error}</Text> : null}
            <AppButton title="Iniciar sesión" onPress={handleLogin} loading={submitting} />
            <View style={styles.switchRow}><Text style={styles.switchText}>¿Aún no tienes cuenta?</Text><Link href="/auth/register" style={styles.link}> Crear cuenta</Link></View>
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
  logoContainer: {
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: 24,
},

logo: {
  width: 200,
  height: 200,
},
});
