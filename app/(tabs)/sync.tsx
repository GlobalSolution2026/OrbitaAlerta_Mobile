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
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { OfflineBanner } from '@/components/OfflineBanner';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/utils/routes';
import { useSyncStore } from '@/src/store/syncStore';
import { formatDateTime } from '@/src/utils/format';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

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
        subtitle="Dados offline enviados quando houver rede"
        badge={pendingCount > 0 ? `${pendingCount}` : undefined}
      />

      {isOffline && <OfflineBanner message="Conecte-se para sincronizar com o painel web" />}

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
        <View style={styles.cardHeader}>
          <SymbolView name="arrow.triangle.2.circlepath" tintColor={colors.primary} size={20} />
          <Text style={[typography.h3, { color: colors.text, marginLeft: spacing.sm, flex: 1 }]}>
            Fila de sincronização
          </Text>
        </View>
        <View style={styles.statRow}>
          <Text style={[typography.number, { color: pendingCount > 0 ? colors.primary : colors.success }]}>
            {pendingCount}
          </Text>
          <Text style={[typography.body, { color: colors.textSecondary, marginLeft: spacing.sm }]}>
            {pendingCount === 1 ? 'item pendente' : 'itens pendentes'}
          </Text>
        </View>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.sm }]}>
          Evidências de campo e atualizações ficam na fila local até a sincronização.
        </Text>
        {lastSyncAt && (
          <View style={[styles.syncMeta, { backgroundColor: colors.backgroundAlt, borderColor: colors.borderLight }]}>
            <SymbolView name="clock.fill" tintColor={colors.textMuted} size={12} />
            <Text style={[typography.caption, { color: colors.textMuted, marginLeft: spacing.xs }]}>
              Última sync: {formatDateTime(lastSyncAt)}
            </Text>
          </View>
        )}
        {lastResult && (
          <View style={[styles.syncMeta, { backgroundColor: colors.success + '10', borderColor: colors.success + '20' }]}>
            <SymbolView name="checkmark.circle.fill" tintColor={colors.success} size={12} />
            <Text style={[typography.caption, { color: colors.success, marginLeft: spacing.xs }]}>{lastResult}</Text>
          </View>
        )}
        <Pressable
          onPress={syncNow}
          disabled={syncing || isOffline}
          style={[
            styles.button,
            {
              backgroundColor: isOffline ? colors.textMuted : colors.primary,
              opacity: syncing ? 0.7 : 1,
            },
            shadow(colors.shadow),
          ]}>
          {syncing ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <SymbolView name="arrow.triangle.2.circlepath" tintColor="#FFF" size={16} />
              <Text style={[styles.buttonText, { marginLeft: spacing.sm }]}>Sincronizar agora</Text>
            </>
          )}
        </Pressable>
      </View>

      <View style={styles.section}>
        <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.md, paddingHorizontal: spacing.xs }]}>
          Fila local
        </Text>
        {queue.length === 0 ? (
          <View style={[styles.emptyCard, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
            <SymbolView name="tray.fill" tintColor={colors.textMuted} size={24} />
            <Text style={[typography.body, { color: colors.textMuted, marginTop: spacing.sm }]}>
              Nenhum item na fila.
            </Text>
          </View>
        ) : (
          queue.map((item) => (
            <View
              key={item.id}
              style={[styles.queueItem, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
              <View style={styles.queueItemLeft}>
                <SymbolView
                  name={item.type === 'field_evidence' ? 'camera.fill' : 'arrow.triangle.2.circlepath'}
                  tintColor={colors.primary}
                  size={16}
                />
                <View style={{ marginLeft: spacing.sm }}>
                  <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600' }]}>
                    {item.type === 'field_evidence' ? 'Evidência de campo' : 'Atualização de status'}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
                    {formatDateTime(item.createdAt)}
                  </Text>
                </View>
              </View>
              <View style={[styles.retryBadge, { backgroundColor: colors.warningLight + '20' }]}>
                <Text style={[typography.caption, { color: colors.warning, fontWeight: '600' }]}>
                  {item.retries}tentativa(s)
                </Text>
              </View>
            </View>
          ))
        )}
      </View>

      <View style={[styles.accountSection, { borderTopColor: colors.borderLight }]}>
        <View style={styles.accountHeader}>
          <SymbolView name="person.circle.fill" tintColor={colors.textMuted} size={20} />
          <Text style={[typography.label, { color: colors.textMuted, marginLeft: spacing.sm }]}>Conta</Text>
        </View>
        {user ? (
          <View style={[styles.userCard, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
            <View style={styles.userAvatar}>
              <Text style={[typography.h3, { color: '#FFF' }]}>
                {user.email.charAt(0).toUpperCase()}
              </Text>
            </View>
            <View style={{ marginLeft: spacing.md, flex: 1 }}>
              <Text style={[typography.body, { color: colors.text, fontWeight: '600' }]}>{user.email}</Text>
              <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>Logado</Text>
            </View>
          </View>
        ) : null}
        <Pressable onPress={handleLogout} style={[styles.logoutButton, { borderColor: colors.danger }]}>
          <SymbolView name="rectangle.portrait.and.arrow.right" tintColor={colors.danger} size={16} />
          <Text style={{ color: colors.danger, fontWeight: '700', marginLeft: spacing.sm, fontSize: 15 }}>
            Sair da conta
          </Text>
        </Pressable>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  card: {
    margin: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: spacing.md,
  },
  syncMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.xs + 2,
    paddingHorizontal: spacing.sm,
    borderRadius: radius.xs,
    borderWidth: 1,
    marginTop: spacing.sm,
    alignSelf: 'flex-start',
  },
  button: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  section: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  emptyCard: {
    padding: spacing.xl,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
  },
  queueItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.sm,
  },
  queueItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  retryBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.xs,
  },
  accountSection: {
    margin: spacing.md,
    marginTop: 0,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
  },
  accountHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: radius.full,
    backgroundColor: '#FF6B35',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoutButton: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
