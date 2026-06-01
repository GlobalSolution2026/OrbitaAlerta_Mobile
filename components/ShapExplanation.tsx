import { StyleSheet, Text, View } from 'react-native';
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
    <View style={styles.container}>
      <Text style={[typography.label, { color: colors.textSecondary, marginBottom: spacing.sm }]}>
        Explicabilidade SHAP (priorização ML)
      </Text>
      {factors.map((f) => {
        const positive = f.contribution >= 0;
        const width = `${Math.min(Math.abs(f.contribution) * 100, 100)}%`;
        return (
          <View key={f.feature} style={[styles.row, { borderColor: colors.border }]}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  {
                    width: width as `${number}%`,
                    backgroundColor: positive ? colors.danger : colors.success,
                  },
                ]}
              />
            </View>
            <Text style={[typography.caption, { color: colors.text, marginTop: spacing.xs }]}>
              {f.description} ({positive ? '+' : ''}
              {(f.contribution * 100).toFixed(0)}%)
            </Text>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: spacing.md },
  row: {
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  barTrack: {
    height: 6,
    backgroundColor: 'rgba(128,128,128,0.2)',
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  barFill: { height: '100%', borderRadius: radius.full },
});
