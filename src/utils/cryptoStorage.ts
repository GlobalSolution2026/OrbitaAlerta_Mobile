import 'react-native-get-random-values';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'orbita-alerta-chave-demo-gs2026';
const ENCRYPTION_PREFIX = 'enc:v1:';

export function encryptData(data: unknown): string {
  const jsonData = JSON.stringify(data);

  const encrypted = CryptoJS.AES.encrypt(jsonData, SECRET_KEY).toString();

  return `${ENCRYPTION_PREFIX}${encrypted}`;
}

export function decryptData<T>(encryptedData: string): T {
  if (!encryptedData.startsWith(ENCRYPTION_PREFIX)) {
    throw new Error('Dado armazenado não está criptografado.');
  }

  const cipherText = encryptedData.replace(ENCRYPTION_PREFIX, '');

  const bytes = CryptoJS.AES.decrypt(cipherText, SECRET_KEY);
  const decryptedText = bytes.toString(CryptoJS.enc.Utf8);

  if (!decryptedText) {
    throw new Error('Não foi possível descriptografar os dados.');
  }

  return JSON.parse(decryptedText) as T;
}

export function isEncryptedData(value: string): boolean {
  return value.startsWith(ENCRYPTION_PREFIX);
}