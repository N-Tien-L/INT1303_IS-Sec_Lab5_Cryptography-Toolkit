import { useState } from 'react';
import { Copy, RefreshCw, Lock, Unlock, Key } from 'lucide-react';
import { Button } from '../ui/Button';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useCopyToClipboard } from '../../hooks';
import {
  generateRSAKeyPair,
  encryptRSA,
  decryptRSA,
} from '../../services/rsa.service';
import type { RSAKeyPair } from '../../types/crypto';

type RSATab = 'keygen' | 'encrypt' | 'decrypt';

const TAB_OPTIONS = [
  { value: 'keygen', label: '🔑 Key Generation' },
  { value: 'encrypt', label: '🔒 Encrypt' },
  { value: 'decrypt', label: '🔓 Decrypt' },
];

const KEY_SIZE_OPTIONS = [
  { value: '1024', label: '1024-bit (faster, less secure)' },
  { value: '2048', label: '2048-bit (recommended)' },
  { value: '4096', label: '4096-bit (slower, more secure)' },
];

export function RSAForm() {
  const [activeTab, setActiveTab] = useState<RSATab>('keygen');

  // Key Generation state
  const [keySize, setKeySize] = useState('2048');
  const [keyPair, setKeyPair] = useState<RSAKeyPair | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Encrypt state
  const [encryptInput, setEncryptInput] = useState('');
  const [encryptPublicKey, setEncryptPublicKey] = useState('');
  const [encryptOutput, setEncryptOutput] = useState('');
  const [encryptError, setEncryptError] = useState('');

  // Decrypt state
  const [decryptInput, setDecryptInput] = useState('');
  const [decryptPrivateKey, setDecryptPrivateKey] = useState('');
  const [decryptOutput, setDecryptOutput] = useState('');
  const [decryptError, setDecryptError] = useState('');

  const { copy: copyPublic, status: copyPublicStatus } = useCopyToClipboard();
  const { copy: copyPrivate, status: copyPrivateStatus } = useCopyToClipboard();
  const { copy: copyEncryptOutput, status: copyEncryptStatus } = useCopyToClipboard();
  const { copy: copyDecryptOutput, status: copyDecryptStatus } = useCopyToClipboard();

  // ── Key Generation ──────────────────────────────────────────────
  const handleGenerateKeyPair = async () => {
    setIsGenerating(true);
    try {
      // node-forge's generateKeyPair is synchronous but heavy — wrap to not freeze UI
      await new Promise<void>((resolve) => setTimeout(resolve, 50));
      const pair = generateRSAKeyPair(parseInt(keySize));
      setKeyPair(pair);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleUseKeysForCrypto = () => {
    if (!keyPair) return;
    setEncryptPublicKey(keyPair.publicKey);
    setDecryptPrivateKey(keyPair.privateKey);
    setActiveTab('encrypt');
  };

  // ── Encrypt ─────────────────────────────────────────────────────
  const handleEncrypt = () => {
    setEncryptError('');
    if (!encryptPublicKey.trim()) {
      setEncryptError('Public key is required.');
      return;
    }
    if (!encryptInput.trim()) {
      setEncryptError('Plaintext is required.');
      return;
    }
    try {
      const result = encryptRSA(encryptInput, encryptPublicKey);
      setEncryptOutput(result);
    } catch (e: unknown) {
      setEncryptError(e instanceof Error ? e.message : 'Encryption failed. Check your public key.');
    }
  };

  // ── Decrypt ─────────────────────────────────────────────────────
  const handleDecrypt = () => {
    setDecryptError('');
    if (!decryptPrivateKey.trim()) {
      setDecryptError('Private key is required.');
      return;
    }
    if (!decryptInput.trim()) {
      setDecryptError('Ciphertext is required.');
      return;
    }
    try {
      const result = decryptRSA(decryptInput, decryptPrivateKey);
      setDecryptOutput(result);
    } catch (e: unknown) {
      setDecryptError(e instanceof Error ? e.message : 'Decryption failed. Check your private key and ciphertext.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab selector */}
      <div className="flex gap-2 border-b border-gray-200">
        {TAB_OPTIONS.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value as RSATab)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.value
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Key Generation Tab ── */}
      {activeTab === 'keygen' && (
        <div className="space-y-6">
          <div className="flex gap-2 items-end">
            <div className="flex-1">
              <Select
                label="Key Size"
                options={KEY_SIZE_OPTIONS}
                value={keySize}
                onChange={(e) => setKeySize(e.target.value)}
              />
            </div>
            <Button onClick={handleGenerateKeyPair} disabled={isGenerating}>
              <Key size={16} className="mr-2" />
              {isGenerating ? 'Generating...' : 'Generate Key Pair'}
            </Button>
          </div>

          {isGenerating && (
            <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-blue-700 text-sm flex items-center gap-2">
              <RefreshCw size={14} className="animate-spin" />
              Generating {keySize}-bit RSA key pair, please wait...
            </div>
          )}

          {keyPair && (
            <div className="space-y-4">
              {/* Public Key */}
              <div>
                <TextArea
                  label="Public Key (PEM)"
                  value={keyPair.publicKey}
                  readOnly
                  rows={6}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyPublic(keyPair.publicKey)}
                >
                  <Copy size={14} className="mr-1" />
                  {copyPublicStatus === 'success' ? 'Copied!' : 'Copy Public Key'}
                </Button>
              </div>

              {/* Private Key */}
              <div>
                <TextArea
                  label="Private Key (PEM)"
                  value={keyPair.privateKey}
                  readOnly
                  rows={8}
                />
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  onClick={() => copyPrivate(keyPair.privateKey)}
                >
                  <Copy size={14} className="mr-1" />
                  {copyPrivateStatus === 'success' ? 'Copied!' : 'Copy Private Key'}
                </Button>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg text-yellow-800 text-sm">
                ⚠️ Keep your <strong>Private Key</strong> secret. Never share it.
              </div>

              <Button variant="secondary" onClick={handleUseKeysForCrypto}>
                Use these keys → Go to Encrypt
              </Button>
            </div>
          )}
        </div>
      )}

      {/* ── Encrypt Tab ── */}
      {activeTab === 'encrypt' && (
        <div className="space-y-4">
          <TextArea
            label="Public Key (PEM)"
            value={encryptPublicKey}
            onChange={(e) => setEncryptPublicKey(e.target.value)}
            placeholder="Paste your RSA Public Key here (-----BEGIN PUBLIC KEY-----)..."
            rows={6}
          />

          <TextArea
            label="Plaintext"
            value={encryptInput}
            onChange={(e) => setEncryptInput(e.target.value)}
            placeholder="Enter text to encrypt..."
            rows={4}
          />

          <Button onClick={handleEncrypt} disabled={!encryptInput || !encryptPublicKey}>
            <Lock size={16} className="mr-2" />
            Encrypt
          </Button>

          {encryptError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {encryptError}
            </div>
          )}

          <TextArea
            label="Ciphertext (Base64)"
            value={encryptOutput}
            readOnly
            placeholder="Encrypted result will appear here..."
            rows={4}
          />

          <Button
            variant="outline"
            onClick={() => copyEncryptOutput(encryptOutput)}
            disabled={!encryptOutput}
          >
            <Copy size={16} className="mr-2" />
            {copyEncryptStatus === 'success' ? 'Copied!' : 'Copy Result'}
          </Button>
        </div>
      )}

      {/* ── Decrypt Tab ── */}
      {activeTab === 'decrypt' && (
        <div className="space-y-4">
          <TextArea
            label="Private Key (PEM)"
            value={decryptPrivateKey}
            onChange={(e) => setDecryptPrivateKey(e.target.value)}
            placeholder="Paste your RSA Private Key here (-----BEGIN RSA PRIVATE KEY-----)..."
            rows={8}
          />

          <TextArea
            label="Ciphertext (Base64)"
            value={decryptInput}
            onChange={(e) => setDecryptInput(e.target.value)}
            placeholder="Paste the Base64 ciphertext to decrypt..."
            rows={4}
          />

          <Button
            variant="secondary"
            onClick={handleDecrypt}
            disabled={!decryptInput || !decryptPrivateKey}
          >
            <Unlock size={16} className="mr-2" />
            Decrypt
          </Button>

          {decryptError && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {decryptError}
            </div>
          )}

          <TextArea
            label="Plaintext"
            value={decryptOutput}
            readOnly
            placeholder="Decrypted result will appear here..."
            rows={4}
          />

          <Button
            variant="outline"
            onClick={() => copyDecryptOutput(decryptOutput)}
            disabled={!decryptOutput}
          >
            <Copy size={16} className="mr-2" />
            {copyDecryptStatus === 'success' ? 'Copied!' : 'Copy Result'}
          </Button>
        </div>
      )}
    </div>
  );
}