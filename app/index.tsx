import { Redirect } from 'expo-router';
import { ActivityIndicator, View } from 'react-native';
import { useAuthStore } from '@/src/store/authStore';
import { ROUTES } from '@/src/utils/routes';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';

export default function Index() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { user, hydrated } = useAuthStore();

  if (!hydrated) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (user) {
    return <Redirect href={ROUTES.tabs} />;
  }

  return <Redirect href={ROUTES.login} />;
}
