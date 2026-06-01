import { useCallback, useEffect, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ShapExplanation } from '@/components/ShapExplanation';
import { useColorScheme } from '@/components/useColorScheme';
import { alertsService } from '@/src/services/alertsService';
import type { FireAlert } from '@/src/types';
import { formatDateTime, formatDistance, statusLabel } from '@/src/utils/format';
import { spacing, typography } from '@/src/theme/styles';

export default function AlertDetailScreen() {
  const { id: rawId } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(rawId) ? rawId[0] : rawId;
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [alert, setAlert] = useState<FireAlert | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    const data = await alertsService.getById(id);
    setAlert(data);
    setLoading(false);
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Carregando...' }} />
        <ActivityIndicator color={colors.primary} size="large" />
      </View>
    );
  }

  if (!alert) {
    return (
      <View style={[styles.centered, { backgroundColor: colors.background }]}>
        <Stack.Screen options={{ title: 'Alerta' }} />
        <Text style={{ color: colors.text }}>Alerta não encontrado.</Text>
      </View>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: alert.municipality }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.content}>
          <PriorityBadge level={alert.priorityLevel} score={alert.priorityScore} />
          <Text style={[typography.h2, { color: colors.text, marginTop: spacing.md }]}>{alert.title}</Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
            {alert.description}
          </Text>

          <InfoSection colors={colors} title="Localização">
            <Text style={{ color: colors.text }}>
              {alert.municipality}, {alert.state} · {formatDistance(alert.distanceKm)}
            </Text>
            <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
              {alert.coordinates.latitude.toFixed(4)}, {alert.coordinates.longitude.toFixed(4)}
            </Text>
          </InfoSection>

          <InfoSection colors={colors} title="Detecção">
            <Text style={{ color: colors.text }}>Fonte: {alert.source}</Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              Detectado: {formatDateTime(alert.detectedAt)}
            </Text>
            <Text style={{ color: colors.textSecondary }}>Status: {statusLabel(alert.status)}</Text>
          </InfoSection>

          <InfoSection colors={colors} title="Risco meteorológico">
            <Text style={{ color: colors.text }}>
              FWI {alert.weather.fireWeatherIndex} · {alert.weather.riskLabel.toUpperCase()}
            </Text>
            <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
              {alert.weather.temperatureC}°C · Umidade {alert.weather.humidityPercent}% · Vento{' '}
              {alert.weather.windSpeedKmh} km/h
            </Text>
          </InfoSection>

          {alert.cvValidation && (
            <InfoSection colors={colors} title="Validação CV (Sentinel)">
              <Text style={{ color: colors.text }}>
                {alert.cvValidation.sentinelPass} · Confiança{' '}
                {(alert.cvValidation.confidence * 100).toFixed(0)}%
              </Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                Modelo {alert.cvValidation.modelVersion}
              </Text>
            </InfoSection>
          )}

          {alert.iot && (
            <InfoSection colors={colors} title="Telemetria IoT">
              <Text style={{ color: colors.text }}>{alert.iot.stationName}</Text>
              <Text style={{ color: colors.textSecondary, marginTop: 4 }}>
                Umidade solo: {alert.iot.soilMoisturePercent ?? '—'}% · Temp local:{' '}
                {alert.iot.localTemperatureC ?? '—'}°C
              </Text>
            </InfoSection>
          )}

          <ShapExplanation factors={alert.shapFactors} />

          <Pressable
            onPress={() => router.push(`/field/${alert.id}`)}
            style={[styles.cta, { backgroundColor: colors.primary }]}>
            <Text style={styles.ctaText}>Ir para operação de campo</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.back}>
            <Text style={{ color: colors.accent }}>Voltar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function InfoSection({
  title,
  children,
  colors,
}: {
  title: string;
  children: ReactNode;
  colors: (typeof Colors)['light'];
}) {
  return (
    <View style={[styles.section, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[typography.label, { color: colors.textSecondary }]}>{title}</Text>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  section: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 12,
    borderWidth: 1,
  },
  cta: {
    marginTop: spacing.xl,
    padding: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  back: { marginTop: spacing.lg, alignItems: 'center' },
});
