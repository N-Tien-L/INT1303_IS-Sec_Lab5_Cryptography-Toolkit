export type CryptoMode = 'ECB' | 'CBC';

export type KeySize = 128 | 192 | 256;

export type HashAlgorithm = 'MD5' | 'SHA-256';

export interface AESOperationResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface CryptoResult {
  success: boolean;
  data?: string;
  error?: string;
}

export interface RSAKeyPair {
  publicKey: string;
  privateKey: string;
}

export interface HashResult {
  success: boolean;
  data?: string;
  error?: string;
}