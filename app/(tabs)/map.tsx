import { useCallback, useMemo, useRef, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Callout, Marker, PROVIDER_GOOGLE } from 'react-native-maps';
import { useFocusEffect, useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import Colors, { priorityColors } from '@/constants/Colors';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useColorScheme } from '@/components/useColorScheme';
import { useAlertsStore } from '@/src/store/alertsStore';
import { priorityLabel } from '@/src/utils/format';
import type { FireAlert } from '@/src/types';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

const DEFAULT_REGION = {
  latitude: -14.0,
  longitude: -55.0,
  latitudeDelta: 30,
  longitudeDelta: 30,
};

function MarkerCallout({ alert }: { alert: FireAlert }) {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const priColor = priorityColors[alert.priorityLevel];

  return (
    <Callout onPress={() => router.push(`/alert/${alert.id}`)}>
      <View style={[styles.callout, { backgroundColor: colors.card }]}>
        <Text style={[typography.bodySmall, { color: colors.text, fontWeight: '700' }]} numberOfLines={1}>
          {alert.title}
        </Text>
        <View style={styles.calloutRow}>
          <View style={[styles.calloutDot, { backgroundColor: priColor }]} />
          <Text style={[typography.caption, { color: priColor, fontWeight: '600', marginLeft: 4 }]}>
            {priorityLabel(alert.priorityLevel)} · {alert.priorityScore}
          </Text>
        </View>
        <Text style={[typography.caption, { color: colors.textMuted, marginTop: 2 }]}>
          {alert.coordinates.latitude.toFixed(4)}, {alert.coordinates.longitude.toFixed(4)}
        </Text>
      </View>
    </Callout>
  );
}

export default function MapScreen() {
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const router = useRouter();
  const { alerts, fetchAll } = useAlertsStore();
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const mapRef = useRef<MapView>(null);

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

  const criticalCount = activeAlerts.filter((a) => a.priorityLevel === 'critical').length;
  const highCount = activeAlerts.filter((a) => a.priorityLevel === 'high').length;
  const otherCount = activeAlerts.length - criticalCount - highCount;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Mapa"
        subtitle={`${activeAlerts.length} foco(s) ativo(s)`}
        badge={activeAlerts.length > 0 ? `${activeAlerts.length}` : undefined}
      />
      <View style={[styles.mapWrap, { borderColor: colors.borderLight }, shadow(colors.shadow)]}>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
          mapPadding={{ top: 0, right: 0, bottom: 0, left: 0 }}>
          {activeAlerts.map((alert) => (
            <Marker
              key={alert.id}
              coordinate={alert.coordinates}
              pinColor={priorityColors[alert.priorityLevel]}>
              <MarkerCallout alert={alert} />
            </Marker>
          ))}
        </MapView>
      </View>
      <View style={[styles.legend, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
        <View style={styles.legendRow}>
          <LegendItem color={priorityColors.critical} label={`Crítico (${criticalCount})`} />
          <LegendItem color={priorityColors.high} label={`Alto (${highCount})`} />
          <LegendItem color={priorityColors.medium} label={`Outros (${otherCount})`} />
        </View>
        <Text style={[typography.caption, { color: colors.textMuted, textAlign: 'center', marginTop: spacing.xs }]}>
          Toque no marcador para detalhes
        </Text>
      </View>
    </View>
  );
}

function LegendItem({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <Text style={[typography.caption, { color: color, fontWeight: '600' }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  mapWrap: {
    flex: 1,
    marginHorizontal: spacing.md,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
  },
  map: { flex: 1 },
  legend: {
    margin: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.lg,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: radius.full,
  },
  callout: {
    padding: spacing.sm,
    borderRadius: radius.sm,
    minWidth: 160,
    maxWidth: 220,
  },
  calloutRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  calloutDot: {
    width: 6,
    height: 6,
    borderRadius: radius.full,
  },
});
