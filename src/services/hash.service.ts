import CryptoJS from 'crypto-js';
import type { HashAlgorithm, HashResult } from '../types/crypto';

export function hash(data: string, algorithm: HashAlgorithm): HashResult {
  try {
    const hash = algorithm === 'MD5'
      ? CryptoJS.MD5(data)
      : CryptoJS.SHA256(data);
    return { success: true, data: hash.toString(CryptoJS.enc.Hex) };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}