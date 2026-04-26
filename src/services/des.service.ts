import CryptoJS from 'crypto-js';
import type { AESOperationResult, CryptoMode } from '../types/crypto';

// DES key must be exactly 8 bytes (16 hex chars)
export const DES_KEY_LENGTH_BYTES = 8;
export const DES_KEY_HEX_LENGTH = DES_KEY_LENGTH_BYTES * 2; // 16 hex chars
export const DES_IV_HEX_LENGTH = 16; // 8 bytes IV

export function generateDESKey(): string {
  return CryptoJS.lib.WordArray.random(DES_KEY_LENGTH_BYTES).toString(CryptoJS.enc.Hex);
}

export function generateDESIV(): string {
  return CryptoJS.lib.WordArray.random(DES_KEY_LENGTH_BYTES).toString(CryptoJS.enc.Hex);
}

export function validateDESKey(key: string): boolean {
  return key.length === DES_KEY_HEX_LENGTH && /^[a-fA-F0-9]+$/.test(key);
}

export function validateDESIV(iv: string): boolean {
  return iv.length === DES_IV_HEX_LENGTH && /^[a-fA-F0-9]+$/.test(iv);
}

export function encryptDES(
  plaintext: string,
  key: string,
  mode: CryptoMode,
  iv?: string
): AESOperationResult {
  try {
    if (!plaintext) {
      return { success: false, error: 'Plaintext cannot be empty' };
    }
    if (!validateDESKey(key)) {
      return { success: false, error: 'DES key must be exactly 8 bytes (16 hex characters)' };
    }
    if (mode === 'CBC') {
      if (!iv) return { success: false, error: 'IV is required for CBC mode' };
      if (!validateDESIV(iv)) {
        return { success: false, error: 'DES IV must be exactly 8 bytes (16 hex characters)' };
      }
    }

    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    const options: CryptoJS.lib.IBlockCipherCfg = {
      mode: CryptoJS.mode[mode],
      padding: CryptoJS.pad.Pkcs7,
    };
    if (mode === 'CBC' && iv) {
      options.iv = CryptoJS.enc.Hex.parse(iv);
    }

    const encrypted = CryptoJS.DES.encrypt(plaintext, keyWordArray, options);
    return { success: true, data: encrypted.ciphertext.toString(CryptoJS.enc.Hex) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}

export function decryptDES(
  ciphertext: string,
  key: string,
  mode: CryptoMode,
  iv?: string
): AESOperationResult {
  try {
    if (!ciphertext) {
      return { success: false, error: 'Ciphertext cannot be empty' };
    }
    if (!validateDESKey(key)) {
      return { success: false, error: 'DES key must be exactly 8 bytes (16 hex characters)' };
    }
    if (mode === 'CBC') {
      if (!iv) return { success: false, error: 'IV is required for CBC mode' };
      if (!validateDESIV(iv)) {
        return { success: false, error: 'DES IV must be exactly 8 bytes (16 hex characters)' };
      }
    }
    if (!/^[a-fA-F0-9]+$/.test(ciphertext) || ciphertext.length % 2 !== 0) {
      return { success: false, error: 'Ciphertext must be a valid hex string' };
    }

    const keyWordArray = CryptoJS.enc.Hex.parse(key);
    const ciphertextWordArray = CryptoJS.enc.Hex.parse(ciphertext);
    const cipherParams = CryptoJS.lib.CipherParams.create({ ciphertext: ciphertextWordArray });

    const options: CryptoJS.lib.IBlockCipherCfg = {
      mode: CryptoJS.mode[mode],
      padding: CryptoJS.pad.Pkcs7,
    };
    if (mode === 'CBC' && iv) {
      options.iv = CryptoJS.enc.Hex.parse(iv);
    }

    const decrypted = CryptoJS.DES.decrypt(cipherParams, keyWordArray, options);
    const result = decrypted.toString(CryptoJS.enc.Utf8);

    if (!result) {
      return { success: false, error: 'Decryption failed: incorrect key, IV, or corrupted data' };
    }
    return { success: true, data: result };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}