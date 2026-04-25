import CryptoJS from 'crypto-js';
import type { AESOperationResult } from '../types/crypto';

export function encryptTripleDES(
  _plaintext: string,
  _key: string,
  _iv?: string
): AESOperationResult {
  return { success: false, error: '3DES not implemented yet' };
}

export function decryptTripleDES(
  _ciphertext: string,
  _key: string,
  _iv?: string
): AESOperationResult {
  return { success: false, error: '3DES not implemented yet' };
}

export function generateTripleDESKey(): string {
  return CryptoJS.lib.WordArray.random(24).toString(CryptoJS.enc.Hex);
}

export function generateTripleDESIV(): string {
  return CryptoJS.lib.WordArray.random(8).toString(CryptoJS.enc.Hex);
}