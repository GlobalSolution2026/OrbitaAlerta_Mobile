import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { PriorityBadge } from '@/components/PriorityBadge';
import type { FireAlert } from '@/src/types';
import { formatDateTime, formatDistance, statusLabel } from '@/src/utils/format';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  alert: FireAlert;
};

export function AlertCard({ alert }: Props) {
  const router = useRouter();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <Pressable
      onPress={() => router.push(`/alert/${alert.id}`)}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
      ]}>
        <View style={styles.header}>
          <PriorityBadge level={alert.priorityLevel} score={alert.priorityScore} />
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {formatDateTime(alert.detectedAt)}
          </Text>
        </View>
        <Text style={[typography.h3, { color: colors.text, marginTop: spacing.sm }]} numberOfLines={2}>
          {alert.title}
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {alert.municipality}, {alert.state} · {formatDistance(alert.distanceKm)}
        </Text>
        <View style={styles.footer}>
          <Text style={[typography.caption, { color: colors.accent }]}>{statusLabel(alert.status)}</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>{alert.source}</Text>
        </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.md,
  },
});
