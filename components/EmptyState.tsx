import { StyleSheet, Text, View } from 'react-native';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { spacing, typography } from '@/src/theme/styles';

type Props = {
  title: string;
  message?: string;
  icon?: string;
};

export function EmptyState({ title, message, icon }: Props) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];

  return (
    <View style={styles.container}>
      {icon ? (
        <View style={[styles.iconWrap, { backgroundColor: colors.backgroundAlt }]}>
          <SymbolView name={icon as any} tintColor={colors.textMuted} size={28} />
        </View>
      ) : null}
      <Text style={[typography.h3, { color: colors.text, textAlign: 'center', marginTop: icon ? spacing.md : 0 }]}>
        {title}
      </Text>
      {message ? (
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: spacing.sm, textAlign: 'center' }]}>
          {message}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  iconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
