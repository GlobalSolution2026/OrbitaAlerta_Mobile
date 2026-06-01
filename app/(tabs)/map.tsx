import { useCallback, useMemo, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect } from 'expo-router';
import * as Location from 'expo-location';
import Colors, { priorityColors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useAlertsStore } from '@/src/store/alertsStore';
import { spacing } from '@/src/theme/styles';

const DEFAULT_REGION = {
  latitude: -21.17,
  longitude: -47.81,
  latitudeDelta: 1.2,
  longitudeDelta: 1.2,
};

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { alerts, fetchAll } = useAlertsStore();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);

  useFocusEffect(
    useCallback(() => {
      fetchAll();
      (async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({});
          setUserLocation({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      })();
    }, [fetchAll])
  );

  const activeAlerts = useMemo(
    () => alerts.filter((a) => a.status !== 'false_positive' && a.status !== 'resolved'),
    [alerts]
  );

  const initialRegion = userLocation
    ? { ...userLocation, latitudeDelta: 0.8, longitudeDelta: 0.8 }
    : DEFAULT_REGION;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader title="Mapa operacional" subtitle={`${activeAlerts.length} foco(s) no mapa`} />
      <MapView
        style={styles.map}
        provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
        initialRegion={initialRegion}
        showsUserLocation
        showsMyLocationButton>
        {activeAlerts.map((alert) => (
          <Marker
            key={alert.id}
            coordinate={alert.coordinates}
            title={alert.title}
            description={`Score ${alert.priorityScore} · ${alert.municipality}`}
            pinColor={priorityColors[alert.priorityLevel]}
          />
        ))}
      </MapView>
      <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <Text style={{ color: colors.textSecondary, fontSize: 12 }}>
          Toque no marcador para abrir o alerta. Integração futura: rota offline até o foco.
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1, marginHorizontal: spacing.md, borderRadius: 12, overflow: 'hidden' },
  legend: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: 8,
    borderWidth: 1,
  },
});
