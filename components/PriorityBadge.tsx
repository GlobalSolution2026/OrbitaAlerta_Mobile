import { StyleSheet, Text, View } from 'react-native';
import Colors, { priorityColors } from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { PriorityLevel } from '@/src/types';
import { priorityLabel } from '@/src/utils/format';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  level: PriorityLevel;
  score?: number;
};

export function PriorityBadge({ level, score }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const bg = priorityColors[level] ?? Colors[scheme].primary;

  return (
    <View style={[styles.badge, { backgroundColor: bg }]}>
      <Text style={styles.text}>
        {priorityLabel(level)}
        {score != null ? ` · ${score}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
    alignSelf: 'flex-start',
  },
  text: {
    ...typography.caption,
    color: '#FFF',
    fontWeight: '700',
  },
});
