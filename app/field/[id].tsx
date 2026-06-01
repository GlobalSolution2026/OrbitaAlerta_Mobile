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
import Colors from '@/constants/Colors';
import { useColorScheme } from '@/components/useColorScheme';
import { useNetworkStatus } from '@/src/hooks/useNetworkStatus';
import { evidenceService } from '@/src/services/evidenceService';
import { enqueueSyncItem } from '@/src/storage/offlineQueue';
import { useSyncStore } from '@/src/store/syncStore';
import { spacing, typography } from '@/src/theme/styles';

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
          <Text style={[typography.body, { color: colors.textSecondary }]}>
            Registre evidência fotográfica no local do alerta. Funciona sem sinal — os dados entram na fila de
            sincronização.
          </Text>

          <Text style={[typography.label, { color: colors.textSecondary, marginTop: spacing.lg }]}>
            Alerta: {id}
          </Text>

          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.preview} />
          ) : (
            <View style={[styles.placeholder, { borderColor: colors.border, backgroundColor: colors.card }]}>
              <Text style={{ color: colors.textSecondary }}>Nenhuma foto capturada</Text>
            </View>
          )}

          <Pressable
            onPress={capturePhoto}
            style={[styles.button, { backgroundColor: colors.secondary, marginTop: spacing.md }]}>
            <Text style={styles.buttonText}>Tirar foto</Text>
          </Pressable>

          <TextInput
            style={[
              styles.input,
              { color: colors.text, borderColor: colors.border, backgroundColor: colors.card },
            ]}
            placeholder="Observações de campo (opcional)"
            placeholderTextColor={colors.textSecondary}
            value={notes}
            onChangeText={setNotes}
            multiline
          />

          <Pressable
            onPress={submitEvidence}
            disabled={submitting}
            style={[styles.button, { backgroundColor: colors.primary, opacity: submitting ? 0.7 : 1 }]}>
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.buttonText}>
                {isOffline ? 'Salvar offline' : 'Enviar evidência'}
              </Text>
            )}
          </Pressable>

          {savedMessage && (
            <Text style={[typography.body, { color: colors.success, marginTop: spacing.md, textAlign: 'center' }]}>
              {savedMessage}
            </Text>
          )}
        </View>
      </ScrollView>
    </>
  );
}

const styles = StyleSheet.create({
  content: { padding: spacing.md, paddingBottom: spacing.xl * 2 },
  preview: { width: '100%', height: 220, borderRadius: 12, marginTop: spacing.md },
  placeholder: {
    height: 160,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: spacing.md,
  },
  button: {
    padding: spacing.md,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: spacing.md,
  },
  buttonText: { color: '#FFF', fontWeight: '700', fontSize: 16 },
  input: {
    marginTop: spacing.md,
    borderWidth: 1,
    borderRadius: 10,
    padding: spacing.md,
    minHeight: 80,
    textAlignVertical: 'top',
  },
});
