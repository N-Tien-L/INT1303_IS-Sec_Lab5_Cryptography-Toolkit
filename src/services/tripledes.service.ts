import CryptoJS from 'crypto-js';
import type { CryptoMode, CryptoResult } from '../types/crypto';


export function encrypt3DES(
  plaintext: string,
  keyHex: string,
  mode: CryptoMode,
  ivHex?: string
): CryptoResult {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const options: any = {
      mode: mode === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    };

    if (mode === 'CBC' && ivHex) {
      options.iv = CryptoJS.enc.Hex.parse(ivHex);
    }

    const encrypted = CryptoJS.TripleDES.encrypt(plaintext, key, options);
    return {
      success: true,
      data: encrypted.toString(), // Trả về chuỗi Base64 mặc định của CryptoJS
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Encryption failed',
    };
  }
}


export function decrypt3DES(
  ciphertext: string,
  keyHex: string,
  mode: CryptoMode,
  ivHex?: string
): CryptoResult {
  try {
    const key = CryptoJS.enc.Hex.parse(keyHex);
    const options: any = {
      mode: mode === 'CBC' ? CryptoJS.mode.CBC : CryptoJS.mode.ECB,
      padding: CryptoJS.pad.Pkcs7,
    };

    if (mode === 'CBC' && ivHex) {
      options.iv = CryptoJS.enc.Hex.parse(ivHex);
    }

    const decrypted = CryptoJS.TripleDES.decrypt(ciphertext, key, options);
    const plaintext = decrypted.toString(CryptoJS.enc.Utf8);

    if (!plaintext) throw new Error('Invalid key or corrupted data');

    return {
      success: true,
      data: plaintext,
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message || 'Decryption failed',
    };
  }
}


export function generate3DESKey(keySize: number = 192): string {
  const bytes = keySize / 8;
  return CryptoJS.lib.WordArray.random(bytes).toString(CryptoJS.enc.Hex);
}


export function generate3DESIV(): string {
  return CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex);
}


export function validate3DESKey(key: string, keySize: number): boolean {
  const hexRegex = /^[0-9a-fA-F]+$/;
  const expectedLength = keySize / 4; // Mỗi byte là 2 ký tự hex
  return hexRegex.test(key) && key.length === expectedLength;
}