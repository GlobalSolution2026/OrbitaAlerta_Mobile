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
import { SymbolView } from 'expo-symbols';
import Colors, { priorityColors } from '@/constants/Colors';
import { PriorityBadge } from '@/components/PriorityBadge';
import { ShapExplanation } from '@/components/ShapExplanation';
import { useColorScheme } from '@/components/useColorScheme';
import { alertsService } from '@/src/services/alertsService';
import type { FireAlert } from '@/src/types';
import { formatDateTime, formatDistance, statusLabel } from '@/src/utils/format';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

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

  const priColor = priorityColors[alert.priorityLevel];

  return (
    <>
      <Stack.Screen options={{ title: alert.municipality === '—' ? 'Detalhe do alerta' : alert.municipality }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.heroSection}>
          <View style={[styles.heroAccent, { backgroundColor: priColor }]} />
          <View style={styles.heroContent}>
            <PriorityBadge level={alert.priorityLevel} score={alert.priorityScore} />
            <Text style={[typography.h2, { color: colors.text, marginTop: spacing.sm }]}>{alert.title}</Text>
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
              {alert.description}
            </Text>
          </View>
        </View>

        <View style={styles.content}>
          <InfoSection
            colors={colors}
            title="Localização"
            icon="location.fill">
            <Text style={[typography.body, { color: colors.text }]}>
              {alert.municipality === '—' ? 'Brasil' : `${alert.municipality}, ${alert.state}`}
              {alert.distanceKm != null ? ` · ${formatDistance(alert.distanceKm)}` : ''}
            </Text>
            <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs, fontFamily: 'SpaceMono' }]}>
              {alert.coordinates.latitude.toFixed(4)}, {alert.coordinates.longitude.toFixed(4)}
            </Text>
          </InfoSection>

          <InfoSection
            colors={colors}
            title="Detecção"
            icon="flame.fill">
            <DetailRow colors={colors} label="Fonte" value={alert.source} />
            <DetailRow colors={colors} label="Detectado" value={formatDateTime(alert.detectedAt)} />
            <DetailRow colors={colors} label="Status" value={statusLabel(alert.status)} />
          </InfoSection>

          <InfoSection
            colors={colors}
            title="Risco meteorológico"
            icon="thermometer.medium">
            <DetailRow
              colors={colors}
              label="FWI"
              value={`${alert.weather.fireWeatherIndex}`}
              valueColor={alert.weather.fireWeatherIndex > 30 ? colors.danger : colors.text}
            />
            <DetailRow colors={colors} label="Temperatura" value={`${alert.weather.temperatureC}°C`} />
            <DetailRow colors={colors} label="Umidade" value={`${alert.weather.humidityPercent}%`} />
            <DetailRow colors={colors} label="Vento" value={`${alert.weather.windSpeedKmh} km/h`} />
            <DetailRow
              colors={colors}
              label="Risco"
              value={alert.weather.riskLabel.toUpperCase()}
              valueColor={
                alert.weather.riskLabel === 'extremo'
                  ? colors.danger
                  : alert.weather.riskLabel === 'alto'
                    ? colors.warning
                    : colors.success
              }
            />
          </InfoSection>

          {alert.cvValidation && (
            <InfoSection
              colors={colors}
              title="Validação por satélite (Sentinel)"
              icon="antenna.radiowaves.left.and.right">
              <DetailRow colors={colors} label="Passagem" value={alert.cvValidation.sentinelPass} />
              <DetailRow
                colors={colors}
                label="Confiança"
                value={`${(alert.cvValidation.confidence * 100).toFixed(0)}%`}
                valueColor={alert.cvValidation.confidence > 0.7 ? colors.success : colors.warning}
              />
              <DetailRow colors={colors} label="Modelo" value={alert.cvValidation.modelVersion} />
            </InfoSection>
          )}

          {alert.iot && (
            <InfoSection
              colors={colors}
              title="Telemetria IoT"
              icon="sensor.fill">
              <DetailRow colors={colors} label="Estação" value={alert.iot.stationName} />
              <DetailRow
                colors={colors}
                label="Umidade solo"
                value={alert.iot.soilMoisturePercent != null ? `${alert.iot.soilMoisturePercent}%` : '—'}
              />
              <DetailRow
                colors={colors}
                label="Temp. local"
                value={alert.iot.localTemperatureC != null ? `${alert.iot.localTemperatureC}°C` : '—'}
              />
            </InfoSection>
          )}

          <ShapExplanation factors={alert.shapFactors} />

          <Pressable
            onPress={() => router.push(`/field/${alert.id}`)}
            style={[styles.cta, { backgroundColor: colors.primary }, shadow(colors.shadow)]}>
            <SymbolView name="camera.fill" tintColor="#FFF" size={18} />
            <Text style={[styles.ctaText, { marginLeft: spacing.sm }]}>Ir para operação de campo</Text>
          </Pressable>

          <Pressable onPress={() => router.back()} style={styles.backButton}>
            <SymbolView name="chevron.left" tintColor={colors.accent} size={14} />
            <Text style={{ color: colors.accent, fontWeight: '600', marginLeft: spacing.xs, fontSize: 15 }}>Voltar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </>
  );
}

function DetailRow({
  colors,
  label,
  value,
  valueColor,
}: {
  colors: (typeof Colors)['light'];
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View style={detailStyles.row}>
      <Text style={[typography.bodySmall, { color: colors.textMuted, flex: 1 }]}>{label}</Text>
      <Text style={[typography.bodySmall, { color: valueColor ?? colors.text, fontWeight: '600' }]}>{value}</Text>
    </View>
  );
}

const detailStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
  },
});

function InfoSection({
  title,
  children,
  colors,
  icon,
}: {
  title: string;
  children: ReactNode;
  colors: (typeof Colors)['light'];
  icon?: string;
}) {
  return (
    <View style={[sectionStyles.section, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <View style={sectionStyles.header}>
        {icon ? <SymbolView name={icon as any} tintColor={colors.textMuted} size={14} /> : null}
        <Text style={[typography.label, { color: colors.textMuted, marginLeft: icon ? spacing.xs : 0 }]}>
          {title}
        </Text>
      </View>
      <View style={{ marginTop: spacing.sm }}>{children}</View>
    </View>
  );
}

const sectionStyles = StyleSheet.create({
  section: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});

const styles = StyleSheet.create({
  centered: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  heroSection: {
    borderRadius: 0,
    overflow: 'hidden',
  },
  heroAccent: {
    height: 4,
  },
  heroContent: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  content: { padding: spacing.md, paddingTop: 0, paddingBottom: spacing.xl * 2 },
  cta: {
    marginTop: spacing.xl,
    padding: spacing.md + 2,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  ctaText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  backButton: {
    marginTop: spacing.lg,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
