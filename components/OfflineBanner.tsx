import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { radius, spacing, typography } from '@/src/theme/styles';

type Props = {
  message?: string;
  isCache?: boolean;
};

export function OfflineBanner({ message, isCache }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const bg = isCache ? colors.warning + '18' : colors.danger + '12';
  const border = isCache ? colors.warning + '30' : colors.danger + '25';
  const iconName = isCache ? 'clock.badge.exclamationmark' : 'wifi.slash';
  const textColor = isCache ? colors.warning : colors.danger;

  return (
    <View style={[styles.banner, { backgroundColor: bg, borderColor: border }]}>
      <SymbolView name={iconName} tintColor={textColor} size={16} />
      <Text style={[typography.bodySmall, { color: textColor, marginLeft: spacing.sm, flex: 1 }]}>
        {message ?? (isCache ? 'Modo offline — exibindo dados salvos' : 'Sem conexão com a internet')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
  },
});
