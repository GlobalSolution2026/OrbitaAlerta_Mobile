import { StatusBar } from 'expo-status-bar';
import { Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { API_CONFIG } from '@/src/config/api';
import { spacing, typography } from '@/src/theme/styles';

export default function AboutModal() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.h2, { color: colors.text }]}>OrbitaAlerta</Text>
      <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.md }]}>
        Plataforma space-tech brasileira de resposta rápida a queimadas. Este app é o dashboard mobile
        offline-first da Global Solution — conectando ingestão orbital, CV Sentinel, ML com SHAP e operação
        de campo.
      </Text>
      <View style={[styles.box, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.label, { color: colors.textSecondary }]}>Modo atual</Text>
        <Text style={{ color: colors.text, marginTop: spacing.sm }}>
          {API_CONFIG.useMockData ? 'Dados simulados (mock)' : `API: ${API_CONFIG.baseUrl}`}
        </Text>
      </View>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.lg }]}>
        Global Solution · FIAP
      </Text>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: spacing.lg },
  box: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
});
