import forge from 'node-forge';
import type { RSAKeyPair } from '../types/crypto';

export function generateRSAKeyPair(bits: number = 2048): RSAKeyPair {
  const keypair = forge.pki.rsa.generateKeyPair({ bits });
  return {
    publicKey: forge.pki.publicKeyToPem(keypair.publicKey),
    privateKey: forge.pki.privateKeyToPem(keypair.privateKey),
  };
}

export function encryptRSA(plaintext: string, publicKeyPem: string): string {
  const publicKey = forge.pki.publicKeyFromPem(publicKeyPem);
  const encrypted = publicKey.encrypt(plaintext, 'RSA-OAEP');
  return forge.util.encode64(encrypted);
}

export function decryptRSA(ciphertext: string, privateKeyPem: string): string {
  const privateKey = forge.pki.privateKeyFromPem(privateKeyPem);
  const decoded = forge.util.decode64(ciphertext);
  return privateKey.decrypt(decoded, 'RSA-OAEP');
}