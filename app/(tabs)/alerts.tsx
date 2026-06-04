import { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  Pressable,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import Colors, { priorityColors, priorityBgColors, priorityBgColorsDark } from '@/constants/Colors';
import { AlertCard } from '@/components/AlertCard';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useAlertsStore } from '@/src/store/alertsStore';
import type { PriorityLevel } from '@/src/types';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

const FILTERS: Array<{ key: 'all' | PriorityLevel; label: string }> = [
  { key: 'all', label: 'Todos' },
  { key: 'critical', label: 'Crítico' },
  { key: 'high', label: 'Alto' },
  { key: 'medium', label: 'Médio' },
  { key: 'low', label: 'Baixo' },
];

export default function AlertsScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const [filter, setFilter] = useState<'all' | PriorityLevel>('all');
  const { isOffline } = useNetworkStatus();
  const { alerts, loading, error, isOfflineCache, fetchAll } = useAlertsStore();

  useFocusEffect(
    useCallback(() => {
      if (alerts.length === 0) fetchAll();
    }, [alerts.length, fetchAll])
  );

  const filtered = useMemo(() => {
    if (filter === 'all') return alerts.filter((a) => a.status !== 'false_positive');
    return alerts.filter((a) => a.priorityLevel === filter && a.status !== 'false_positive');
  }, [alerts, filter]);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      refreshControl={<RefreshControl refreshing={loading} onRefresh={fetchAll} tintColor={colors.primary} />}>
      <ScreenHeader
        title="Alertas"
        subtitle="Focos de calor detectados por satélite"
        badge={filtered.length.toString()}
      />

      {(isOffline || isOfflineCache) && <OfflineBanner isCache={isOfflineCache} message={error ?? undefined} />}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters} contentContainerStyle={styles.filtersContent}>
        {FILTERS.map((f) => {
          const isActive = filter === f.key;
          const priColor = f.key === 'all' ? colors.primary : priorityColors[f.key];
          const priBg =
            f.key === 'all'
              ? colors.primary + '12'
              : scheme === 'dark'
                ? priorityBgColorsDark[f.key]
                : priorityBgColors[f.key];
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: isActive ? priBg : colors.card,
                  borderColor: isActive ? priColor : colors.borderLight,
                },
                isActive && shadow(colors.shadow),
              ]}>
              <View style={[styles.chipDot, { backgroundColor: isActive ? priColor : colors.textMuted, opacity: isActive ? 1 : 0.5 }]} />
              <Text
                style={[
                  typography.bodySmall,
                  { color: isActive ? priColor : colors.textSecondary, fontWeight: isActive ? '700' : '500' },
                ]}>
                {f.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.list}>
        {loading && alerts.length === 0 ? (
          <View style={styles.loaderWrap}>
            <ActivityIndicator color={colors.primary} size="large" />
          </View>
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum alerta" message="Ajuste o filtro ou aguarde novas detecções dos satélites." />
        ) : (
          <>
            <Text style={[typography.caption, { color: colors.textMuted, marginBottom: spacing.sm, paddingHorizontal: spacing.xs }]}>
              {filtered.length} resultado(s) — toque para detalhes
            </Text>
            {filtered.map((alert) => (
              <AlertCard key={alert.id} alert={alert} />
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filters: {
    marginBottom: spacing.sm,
    maxHeight: 52,
  },
  filtersContent: {
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    alignItems: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    borderRadius: radius.full,
    borderWidth: 1,
  },
  chipDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
  list: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.xl,
  },
  loaderWrap: {
    marginTop: spacing.xxl,
    alignItems: 'center',
  },
});
