import { StyleSheet, Text, View } from 'react-native';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { spacing, typography } from '@/src/theme/styles';

type Props = {
  message?: string;
  isCache?: boolean;
};

export function OfflineBanner({ message, isCache }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={[styles.banner, { backgroundColor: isCache ? colors.warning + '33' : colors.danger + '22' }]}>
      <Text style={[typography.caption, { color: colors.text }]}>
        {message ?? (isCache ? 'Modo offline — dados em cache' : 'Sem conexão com a internet')}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    borderRadius: 8,
  },
});
