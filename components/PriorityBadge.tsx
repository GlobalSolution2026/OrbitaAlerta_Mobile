import { StyleSheet, Text, View } from 'react-native';
import { priorityColors } from '@/constants/Colors';
import type { PriorityLevel } from '@/src/types';
import { priorityLabel } from '@/src/utils/format';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  level: PriorityLevel;
  score?: number;
};

export function PriorityBadge({ level, score }: Props) {
  const bg = priorityColors[level] ?? '#FF6B35';

  return (
    <View style={styles.wrapper}>
      <View style={[styles.dot, { backgroundColor: bg }]} />
      <Text style={[styles.text, { color: bg }]}>
        {priorityLabel(level)}
        {score != null ? ` · ${score}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: radius.full,
  },
  text: {
    ...typography.caption,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
});
