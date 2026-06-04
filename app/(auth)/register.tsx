import { useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { AuthScreenLayout } from '@/components/AuthScreenLayout';
import { AuthTextInput } from '@/components/AuthTextInput';
import { useColorScheme } from '@/components/useColorScheme';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/utils/routes';
import { isValidEmail, isValidPassword } from '@/src/utils/validation';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

export default function RegisterScreen() {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { register, loading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});

  function validate(): boolean {
    const next: { email?: string; password?: string } = {};
    if (!isValidEmail(email)) next.email = 'E-mail inválido';
    if (!isValidPassword(password)) next.password = 'Mínimo 6 caracteres';
    setFieldErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    clearError();
    if (!validate()) return;
    try {
      await register(email, password);
      router.replace(ROUTES.tabs);
    } catch {
      // erro exibido pelo store
    }
  }

  return (
    <AuthScreenLayout
      title="Criar conta"
      subtitle="Cadastre-se para operar alertas em campo">
      <AuthTextInput
        label="E-mail"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoComplete="email"
        textContentType="emailAddress"
        error={fieldErrors.email}
      />
      <AuthTextInput
        label="Senha"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoComplete="password-new"
        textContentType="newPassword"
        error={fieldErrors.password}
      />

      {error ? (
        <View style={[styles.errorBox, { backgroundColor: colors.danger + '10', borderColor: colors.danger + '20' }]}>
          <SymbolView name="exclamationmark.circle.fill" tintColor={colors.danger} size={14} />
          <Text style={[typography.caption, { color: colors.danger, marginLeft: spacing.sm, flex: 1 }]}>
            {error}
          </Text>
        </View>
      ) : null}

      <Pressable
        onPress={handleRegister}
        disabled={loading}
        style={[styles.button, { backgroundColor: colors.primary, opacity: loading ? 0.7 : 1 }, shadow(colors.shadow)]}>
        {loading ? (
          <ActivityIndicator color="#FFF" size="small" />
        ) : (
          <>
            <SymbolView name="person.badge.plus" tintColor="#FFF" size={16} />
            <Text style={[styles.buttonText, { marginLeft: spacing.sm }]}>Cadastrar</Text>
          </>
        )}
      </Pressable>

      <View style={styles.footer}>
        <Text style={{ color: colors.textSecondary }}>Já tem conta? </Text>
        <Pressable onPress={() => router.push(ROUTES.login)}>
          <Text style={{ color: colors.primary, fontWeight: '700' }}>Entrar</Text>
        </Pressable>
      </View>
    </AuthScreenLayout>
  );
}

const styles = StyleSheet.create({
  button: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    marginTop: spacing.sm,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.sm + 2,
    borderRadius: radius.sm,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: spacing.xl,
  },
});
