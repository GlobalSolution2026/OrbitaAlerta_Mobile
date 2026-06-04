import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { API_CONFIG } from '@/src/config/api';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

export default function AboutModal() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.logoSection}>
        <View style={[styles.logoIcon, { backgroundColor: colors.primary + '15' }]}>
          <SymbolView name="flame.fill" tintColor={colors.primary} size={32} />
        </View>
        <Text style={[typography.h2, { color: colors.text }]}>OrbitaAlerta</Text>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          Plataforma space-tech de resposta a queimadas
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
        <Text style={[typography.body, { color: colors.text, lineHeight: 24 }]}>
          Dashboard mobile offline-first da Global Solution — conectando ingestão orbital (NASA FIRMS),
          visão computacional Sentinel, ML com SHAP e operação de campo.
        </Text>
      </View>
      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
        <Text style={[typography.label, { color: colors.textMuted }]}>Modo atual</Text>
        <View style={[styles.statusBadge, { backgroundColor: API_CONFIG.useMockData ? colors.warning + '15' : colors.success + '15' }]}>
          <View style={[styles.statusDot, { backgroundColor: API_CONFIG.useMockData ? colors.warning : colors.success }]} />
          <Text style={[typography.bodySmall, { color: API_CONFIG.useMockData ? colors.warning : colors.success, fontWeight: '600' }]}>
            {API_CONFIG.useMockData ? 'Dados simulados (mock)' : `Dados reais NASA FIRMS`}
          </Text>
        </View>
      </View>
      <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.lg }]}>
        Global Solution · FIAP
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  logoSection: {
    alignItems: 'center',
    marginBottom: spacing.xl,
    marginTop: spacing.md,
  },
  logoIcon: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  card: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    marginTop: spacing.md,
    alignSelf: 'flex-start',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
});
