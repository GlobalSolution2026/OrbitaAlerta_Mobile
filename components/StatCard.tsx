import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

type Props = {
  label: string;
  value: string | number;
  subtitle?: string;
  accent?: string;
  icon?: string;
};

export function StatCard({ label, value, subtitle, accent, icon }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: (accent ?? colors.primary) + '12' }]}>
          <SymbolView name={icon as any} tintColor={accent ?? colors.primary} size={16} />
        </View>
      ) : null}
      <Text style={[typography.number, { color: accent ?? colors.text, marginTop: icon ? spacing.sm : 0 }]}>
        {value}
      </Text>
      <Text style={[typography.bodySmall, { color: colors.textSecondary, marginTop: spacing.xs }]}>
        {label}
      </Text>
      {subtitle ? (
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: spacing.xs }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: '46%',
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  iconWrap: {
    width: 32,
    height: 32,
    borderRadius: radius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
