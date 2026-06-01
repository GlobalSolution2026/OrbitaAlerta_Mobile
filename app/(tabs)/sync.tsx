import { useCallback } from 'react';
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/utils/routes';
import { useSyncStore } from '@/src/store/syncStore';
import { formatDateTime } from '@/src/utils/format';
import { spacing, typography } from '@/src/theme/styles';

export default function SyncScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isOffline } = useNetworkStatus();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const { queue, pendingCount, syncing, lastSyncAt, lastResult, refreshQueue, syncNow } =
    useSyncStore();

  async function handleLogout() {
    await logout();
    router.replace(ROUTES.login);
  }

  useFocusEffect(
    useCallback(() => {
      refreshQueue();
    }, [refreshQueue])
  );

  return (
    <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
      <ScreenHeader
        title="Sincronização"
        subtitle="Operação offline-first — dados enviados quando houver rede"
      />

      {isOffline && <OfflineBanner message="Conecte-se para sincronizar com o painel web" />}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={[typography.h3, { color: colors.text }]}>{pendingCount} pendente(s)</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          Evidências de campo e atualizações de status ficam na fila local até o sync.
        </Text>
        {lastSyncAt && (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.md }]}>
            Última sync: {formatDateTime(lastSyncAt)}
          </Text>
        )}
        {lastResult && (
          <Text style={[typography.caption, { color: colors.success, marginTop: spacing.sm }]}>
            {lastResult}
          </Text>
        )}
        <Pressable
          onPress={syncNow}
          disabled={syncing || isOffline}
          style={[
            styles.button,
            {
              backgroundColor: isOffline ? colors.border : colors.primary,
              opacity: syncing ? 0.7 : 1,
            },
          ]}>
          {syncing ? (
            <ActivityIndicator color="#FFF" />
          ) : (
            <Text style={styles.buttonText}>Sincronizar agora</Text>
          )}
        </Pressable>
      </View>

      <View style={styles.queueSection}>
        <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.md }]}>
          Fila local
        </Text>
        {queue.length === 0 ? (
          <Text style={{ color: colors.textSecondary }}>Nenhum item na fila.</Text>
        ) : (
          queue.map((item) => (
            <View
              key={item.id}
              style={[styles.queueItem, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <Text style={{ color: colors.text, fontWeight: '600' }}>{item.type}</Text>
              <Text style={{ color: colors.textSecondary, fontSize: 12, marginTop: 4 }}>
                {formatDateTime(item.createdAt)}
              </Text>
            </View>
          ))
        )}
      </View>

      <View style={[styles.accountSection, { borderTopColor: colors.border }]}>
        <Text style={[typography.label, { color: colors.textSecondary }]}>Conta</Text>
        {user ? (
          <Text style={{ color: colors.text, marginTop: spacing.sm }}>{user.email}</Text>
        ) : null}
        <Pressable
          onPress={handleLogout}
          style={[styles.logoutButton, { borderColor: colors.danger }]}>
          <Text style={{ color: colors.danger, fontWeight: '600' }}>Sair da conta</Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: 12,
    borderWidth: 1,
  },
  button: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  queueSection: { padding: spacing.md },
  queueItem: {
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  accountSection: {
    margin: spacing.md,
    paddingTop: spacing.lg,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  logoutButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
});
