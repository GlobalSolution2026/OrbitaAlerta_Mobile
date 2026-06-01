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
import { spacing } from '@/src/theme/styles';

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
        title="OrbitaAlerta"
        subtitle="Dashboard operacional — dado orbital em decisão de campo"
      />

      {(isOffline || isOfflineCache) && (
        <OfflineBanner
          isCache={isOfflineCache}
          message={error ?? undefined}
        />
      )}

      {loading && !dashboard ? (
        <ActivityIndicator style={styles.loader} color={colors.primary} size="large" />
      ) : (
        <>
          <View style={styles.statsGrid}>
            <StatCard
              label="Alertas ativos"
              value={stats?.activeAlerts ?? '—'}
              accent={colors.danger}
            />
            <StatCard
              label="Críticos"
              value={stats?.criticalAlerts ?? '—'}
              accent={colors.primary}
            />
            <StatCard
              label="Validados hoje"
              value={stats?.validatedToday ?? '—'}
              accent={colors.success}
            />
            <StatCard
              label="Área monitorada"
              value={stats ? `${(stats.hectaresMonitored / 1000).toFixed(0)}k ha` : '—'}
              subtitle="Sentinel + INPE + FIRMS"
            />
          </View>

          {stats?.lastSatellitePass && (
            <Text style={[styles.meta, { color: colors.textSecondary }]}>
              Última passagem: {formatDateTime(stats.lastSatellitePass)} · Falsos positivos:{' '}
              {((stats.falsePositiveRate ?? 0) * 100).toFixed(0)}%
            </Text>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: colors.text }]}>Prioridades recentes</Text>
            {recent.length === 0 ? (
              <Text style={{ color: colors.textSecondary }}>Nenhum alerta no momento.</Text>
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
  loader: { marginTop: spacing.xl * 2 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    paddingHorizontal: spacing.md,
  },
  meta: {
    fontSize: 12,
    paddingHorizontal: spacing.md,
    marginTop: spacing.md,
  },
  section: {
    padding: spacing.md,
    marginTop: spacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
});
