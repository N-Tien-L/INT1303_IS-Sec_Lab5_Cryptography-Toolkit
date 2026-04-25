import CryptoJS from 'crypto-js';
import type { CryptoMode, KeySize, AESOperationResult } from '../types/crypto';

const KEY_SIZES: Record<KeySize, number> = {
  128: 16,
  192: 24,
  256: 32,
};

export function generateAESKey(keySize: KeySize): string {
  const keyLength = KEY_SIZES[keySize];
  return CryptoJS.lib.WordArray.random(keyLength).toString(CryptoJS.enc.Hex);
}

export function generateIV(): string {
  return CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
}

export function encryptAES(
  plaintext: string,
  key: string,
  mode: CryptoMode,
  iv?: string
): AESOperationResult {
  try {
    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    const modeConfig = mode === 'CBC' && iv
      ? { iv: CryptoJS.enc.Hex.parse(iv) }
      : {};

    const encrypted = CryptoJS.AES.encrypt(
      plaintext,
      keyWordArray,
      {
        mode: CryptoJS.mode[mode],
        padding: CryptoJS.pad.Pkcs7,
        ...modeConfig,
      }
    );

    return { success: true, data: encrypted.ciphertext.toString(CryptoJS.enc.Hex) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export function decryptAES(
  ciphertext: string,
  key: string,
  mode: CryptoMode,
  iv?: string
): AESOperationResult {
  try {
    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    const ciphertextWordArray = CryptoJS.enc.Hex.parse(ciphertext);
    const modeConfig = mode === 'CBC' && iv
      ? { iv: CryptoJS.enc.Hex.parse(iv) }
      : {};

    const cipherParams = CryptoJS.lib.CipherParams.create({
      ciphertext: ciphertextWordArray,
    });

    const decrypted = CryptoJS.AES.decrypt(cipherParams, keyWordArray, {
      mode: CryptoJS.mode[mode],
      padding: CryptoJS.pad.Pkcs7,
      ...modeConfig,
    });

    const result = decrypted.toString(CryptoJS.enc.Utf8);
    if (!result) {
      return { success: false, error: 'Decryption failed: invalid key, mode, or IV' };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export function validateAESKey(key: string, keySize: KeySize): boolean {
  const expectedLength = KEY_SIZES[keySize] * 2;
  return key.length === expectedLength && /^[a-fA-F0-9]+$/.test(key);
}