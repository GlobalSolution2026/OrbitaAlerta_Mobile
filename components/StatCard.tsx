import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
};

export function StatCard({ label, value, subtitle, accent }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <Text style={[typography.label, { color: colors.textSecondary }]}>{label}</Text>
      <Text style={[typography.h2, { color: accent ?? colors.text, marginTop: spacing.xs }]}>
        {value}
      </Text>
      {subtitle ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: spacing.xs }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '45%',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
