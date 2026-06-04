import { useCallback } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Colors from '@/constants/Colors';
import { AlertCard } from '@/components/AlertCard';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { StatCard } from '@/components/StatCard';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useAlertsStore } from '@/src/store/alertsStore';
import { formatDateTime } from '@/src/utils/format';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

export default function DashboardScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isOffline } = useNetworkStatus();
  const { dashboard, alerts, loading, error, isOfflineCache, fetchAll } = useAlertsStore();

  useFocusEffect(
    useCallback(() => {
      fetchAll();
    }, [fetchAll])
  );

  const stats = dashboard?.stats;
  const recent = dashboard?.recentAlerts ?? alerts.slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}>
      <ScreenHeader
        title="Dashboard"
        subtitle="Monitoramento orbital em tempo real"
        badge={stats ? `${stats.activeAlerts} ativos` : undefined}
      />

      {(isOffline || isOfflineCache) && (
        <OfflineBanner isCache={isOfflineCache} message={error ?? undefined} />
      )}

      {loading && !dashboard ? (
        <View style={styles.loaderWrap}>
          <ActivityIndicator color={colors.primary} size="large" />
        </View>
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Alertas ativos"
              value={stats?.activeAlerts ?? '—'}
              accent={colors.danger}
              icon="flame.fill"
            />
            <StatCard
              label="Críticos"
              value={stats?.criticalAlerts ?? '—'}
              accent={colors.primary}
              icon="exclamationmark.triangle.fill"
            />
            <StatCard
              label="Detectados hoje"
              value={stats?.validatedToday ?? '—'}
              accent={colors.accent}
              icon="clock.fill"
            />
            <StatCard
              label="Área monitorada"
              value={stats ? `${(stats.hectaresMonitored / 1e6).toFixed(0)}M ha` : '—'}
              accent={colors.secondary}
              icon="map.fill"
              subtitle="Sentinel + INPE + FIRMS"
            />
          </View>

          {stats?.lastSatellitePass && (
            <View style={[styles.metaCard, { backgroundColor: colors.cardAlt, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                Última passagem satélite
              </Text>
              <Text style={[typography.bodySmall, { color: colors.text, marginTop: spacing.xs, fontWeight: '600' }]}>
                {formatDateTime(stats.lastSatellitePass)}
              </Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
                Falsos positivos: {((stats.falsePositiveRate ?? 0) * 100).toFixed(0)}%
              </Text>
            </View>
          )}

          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={[typography.h3, { color: colors.text }]}>Prioridades recentes</Text>
              <Text style={[typography.caption, { color: colors.textMuted }]}>
                {recent.length} alerta(s)
              </Text>
            </View>
            {recent.length === 0 ? (
              <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
                <Text style={[typography.body, { color: colors.textMuted, textAlign: 'center' }]}>
                  Nenhum foco detectado no momento.
                </Text>
              </View>
            ) : (
              recent.map((alert) => <AlertCard key={alert.id} alert={alert} />)
            )}
          </View>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  loaderWrap: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  metaCard: {
    marginHorizontal: spacing.md,
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  section: {
    padding: spacing.md,
    marginTop: spacing.sm,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
});
