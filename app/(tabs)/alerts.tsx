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
import Colors from '@/constants/Colors';
import { AlertCard } from '@/components/AlertCard';
import { EmptyState } from '@/components/EmptyState';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useAlertsStore } from '@/src/store/alertsStore';
import type { PriorityLevel } from '@/src/types';
import { spacing } from '@/src/theme/styles';

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
      <ScreenHeader title="Alertas" subtitle="Focos validados e priorizados por ML" />

      {(isOffline || isOfflineCache) && <OfflineBanner isCache={isOfflineCache} message={error ?? undefined} />}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filters}>
        {FILTERS.map((f) => (
          <Pressable
            key={f.key}
            onPress={() => setFilter(f.key)}
            style={[
              styles.chip,
              {
                backgroundColor: filter === f.key ? colors.primary : colors.card,
                borderColor: colors.border,
              },
            ]}>
            <Text style={{ color: filter === f.key ? '#FFF' : colors.text, fontWeight: '600', fontSize: 13 }}>
              {f.label}
            </Text>
          </Pressable>
        ))}
      </ScrollView>

      <View style={styles.list}>
        {loading && alerts.length === 0 ? (
          <ActivityIndicator color={colors.primary} style={{ marginTop: spacing.xl }} />
        ) : filtered.length === 0 ? (
          <EmptyState title="Nenhum alerta" message="Ajuste o filtro ou aguarde novas detecções." />
        ) : (
          filtered.map((alert) => <AlertCard key={alert.id} alert={alert} />)
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  filters: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
    maxHeight: 44,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: spacing.sm,
  },
  list: { paddingHorizontal: spacing.md, paddingBottom: spacing.xl },
});
