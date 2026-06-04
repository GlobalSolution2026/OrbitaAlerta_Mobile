import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import type { ShapFactor } from '@/src/types';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  factors: ShapFactor[];
};

export function ShapExplanation({ factors }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.container, { backgroundColor: colors.card, borderColor: colors.borderLight }]}>
      <View style={styles.header}>
        <SymbolView name="chart.bar.fill" tintColor={colors.textMuted} size={14} />
        <Text style={[typography.label, { color: colors.textMuted, marginLeft: spacing.xs }]}>
          Explicabilidade SHAP
        </Text>
      </View>
      {factors.map((f, idx) => {
        const positive = f.contribution >= 0;
        const pct = Math.min(Math.abs(f.contribution) * 100, 100);
        return (
          <View
            key={f.feature}
            style={[
              styles.row,
              idx < factors.length - 1 && { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.borderLight },
            ]}>
            <View style={styles.rowTop}>
              <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '600', flex: 1 }]} numberOfLines={1}>
                {f.description}
              </Text>
              <Text style={[typography.bodySmall, { color: positive ? colors.danger : colors.success, fontWeight: '700' }]}>
                {positive ? '+' : ''}{pct.toFixed(0)}%
              </Text>
            </View>
            <View style={[styles.barTrack, { backgroundColor: colors.backgroundAlt }]}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: `${pct}%` as `${number}%`,
                    backgroundColor: positive ? colors.danger : colors.success,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  row: {
    paddingVertical: spacing.sm,
  },
  rowTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  barTrack: {
    height: 6,
    borderRadius: radius.full,
    overflow: 'hidden',
    marginTop: spacing.xs,
  },
  barFill: { height: '100%', borderRadius: radius.full },
});
