import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { SymbolView } from 'expo-symbols';
import Colors, { priorityColors, priorityBgColors, priorityBgColorsDark } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PriorityBadge } from '@/components/PriorityBadge';
import type { FireAlert } from '@/src/types';
import { formatDateTime, formatDistance, statusLabel } from '@/src/utils/format';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

type Props = {
  alert: FireAlert;
};

export function AlertCard({ alert }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const priBg = scheme === 'dark' ? priorityBgColorsDark[alert.priorityLevel] : priorityBgColors[alert.priorityLevel];
  const priColor = priorityColors[alert.priorityLevel];

  return (
    <Pressable
      onPress={() => router.push(`/alert/${alert.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.borderLight, opacity: pressed ? 0.92 : 1 },
        shadow(colors.shadow),
      ]}>
      <View style={[styles.accentBar, { backgroundColor: priColor }]} />
      <View style={styles.body}>
        <View style={styles.topRow}>
          <PriorityBadge level={alert.priorityLevel} score={alert.priorityScore} />
          <Text style={[typography.caption, { color: colors.textMuted }]}>
            {formatDateTime(alert.detectedAt)}
          </Text>
        </View>
        <View style={[styles.priIndicator, { backgroundColor: priBg }]}>
          <View style={[styles.priDot, { backgroundColor: priColor }]} />
          <Text style={[typography.h3, { color: colors.text, flex: 1 }]} numberOfLines={1}>
            {alert.title}
          </Text>
        </View>
        <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {alert.municipality === '—' ? (
            <>
              <Text style={{ fontFamily: 'SpaceMono' }}>
                {alert.coordinates.latitude.toFixed(4)}, {alert.coordinates.longitude.toFixed(4)}
              </Text>
            </>
          ) : (
            <>{alert.municipality}, {alert.state} · {formatDistance(alert.distanceKm)}</>
          )}
        </Text>
        <View style={[styles.divider, { backgroundColor: colors.borderLight }]} />
        <View style={styles.footer}>
          <View style={styles.footerLeft}>
            <SymbolView name="flame.fill" tintColor={priColor} size={12} />
            <Text style={[typography.caption, { color: priColor, marginLeft: 4 }]}>
              {statusLabel(alert.status)}
            </Text>
          </View>
          <Text style={[typography.caption, { color: colors.textMuted }]}>{alert.source}</Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    borderRadius: radius.lg,
    borderWidth: 1,
    marginBottom: spacing.md,
    overflow: 'hidden',
  },
  accentBar: {
    width: 4,
  },
  body: {
    flex: 1,
    padding: spacing.md,
    paddingLeft: spacing.sm + 4,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.sm,
  },
  priDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
});
