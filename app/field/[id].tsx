import { useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert as RNAlert,
} from 'react-native';
import { Stack, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { SymbolView } from 'expo-symbols';
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { evidenceService } from '@/src/services/evidenceService';
import { enqueueSyncItem } from '@/src/storage/offlineQueue';
import { useSyncStore } from '@/src/store/syncStore';
import { radius, shadow, spacing, typography } from '@/src/theme/styles';

export default function FieldOperationScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const scheme = useColorScheme() ?? 'light';
  const colors = Colors[scheme];
  const { isOffline } = useNetworkStatus();
  const refreshQueue = useSyncStore((s) => s.refreshQueue);

  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedMessage, setSavedMessage] = useState<string | null>(null);

  async function capturePhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      RNAlert.alert('Permissão', 'É necessário permitir acesso à câmera.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      quality: 0.7,
      allowsEditing: false,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      setSavedMessage(null);
    }
  }

  async function submitEvidence() {
    if (!id || !photoUri) {
      RNAlert.alert('Evidência', 'Tire uma foto antes de registrar.');
      return;
    }

    setSubmitting(true);
    const { status } = await Location.requestForegroundPermissionsAsync();
    const location =
      status === 'granted'
        ? await Location.getCurrentPositionAsync({})
        : null;

    const coords = location
      ? { latitude: location.coords.latitude, longitude: location.coords.longitude }
      : { latitude: 0, longitude: 0 };

    const input = { alertId: id, photoUri, notes, location: coords };

    try {
      if (isOffline) {
        await enqueueSyncItem({
          type: 'field_evidence',
          payload: input as unknown as Record<string, unknown>,
        });
        await refreshQueue();
        setSavedMessage('Salvo offline — será sincronizado quando houver rede.');
      } else {
        await evidenceService.submit(input);
        setSavedMessage('Evidência enviada ao painel de coordenação.');
      }
      setNotes('');
      setPhotoUri(null);
    } catch (e) {
      RNAlert.alert('Erro', e instanceof Error ? e.message : 'Falha ao salvar evidência');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Operação de campo' }} />
      <ScrollView style={{ flex: 1, backgroundColor: colors.background }}>
        <View style={styles.content}>
          <View style={[styles.infoCard, { backgroundColor: colors.cardAlt, borderColor: colors.borderLight }]}>
            <SymbolView name="info.circle.fill" tintColor={colors.accent} size={16} />
            <Text style={[typography.bodySmall, { color: colors.textSecondary, marginLeft: spacing.sm, flex: 1 }]}>
              Registre evidência fotográfica no local. Funciona sem sinal — os dados entram na fila de
              sincronização.
            </Text>
          </View>

          <View style={[styles.fieldCard, { backgroundColor: colors.card, borderColor: colors.borderLight }, shadow(colors.shadow)]}>
            <Text style={[typography.label, { color: colors.textMuted, marginBottom: spacing.sm }]}>
              Alerta: {id}
            </Text>

            {photoUri ? (
              <Image source={{ uri: photoUri }} style={styles.preview} />
            ) : (
              <View style={[styles.placeholder, { borderColor: colors.borderLight, backgroundColor: colors.backgroundAlt }]}>
                <SymbolView name="camera.fill" tintColor={colors.textMuted} size={32} />
                <Text style={[typography.bodySmall, { color: colors.textMuted, marginTop: spacing.sm }]}>
                  Nenhuma foto capturada
                </Text>
              </View>
            )}

            <Pressable
              onPress={capturePhoto}
              style={[styles.button, { backgroundColor: colors.secondary, marginTop: spacing.md }, shadow(colors.shadow)]}>
              <SymbolView name="camera.fill" tintColor="#FFF" size={16} />
              <Text style={[styles.buttonText, { marginLeft: spacing.sm }]}>Tirar foto</Text>
            </Pressable>

            <TextInput
              style={[
                styles.input,
                {
                  color: colors.text,
                  borderColor: colors.borderLight,
                  backgroundColor: colors.backgroundAlt,
                },
              ]}
              placeholder="Observações de campo (opcional)"
              placeholderTextColor={colors.textMuted}
              value={notes}
              onChangeText={setNotes}
              multiline
            />

            <Pressable
              onPress={submitEvidence}
              disabled={submitting}
              style={[styles.button, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1, marginTop: 0 }, shadow(colors.shadow)]}>
              {submitting ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <>
                  <SymbolView name={isOffline ? 'tray.fill' : 'paperplane.fill'} tintColor="#FFF" size={16} />
                  <Text style={[styles.buttonText, { marginLeft: spacing.sm }]}>
                    {isOffline ? 'Salvar offline' : 'Enviar evidência'}
                  </Text>
                </>
              )}
            </Pressable>
          </View>

          {savedMessage && (
            <View style={[styles.successCard, { backgroundColor: colors.success + '10', borderColor: colors.success + '20' }]}>
              <SymbolView name="checkmark.circle.fill" tintColor={colors.success} size={16} />
              <Text style={[typography.bodySmall, { color: colors.success, marginLeft: spacing.sm, flex: 1 }]}>
                {savedMessage}
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  infoCard: {
    flexDirection: 'row',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  fieldCard: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  preview: { width: '100%', height: 220, borderRadius: radius.md, marginTop: spacing.sm },
  placeholder: {
    height: 180,
    borderRadius: radius.md,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.sm,
  },
  button: {
    padding: spacing.md,
    borderRadius: radius.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: radius.md,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
    marginBottom: spacing.md,
  },
  successCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    marginTop: spacing.md,
  },
});
