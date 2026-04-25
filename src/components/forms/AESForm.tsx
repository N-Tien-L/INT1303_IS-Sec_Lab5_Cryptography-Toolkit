import { useState } from 'react';
import { Copy, RefreshCw, Lock, Unlock } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useCopyToClipboard } from '../../hooks';
import {
  encryptAES,
  decryptAES,
  generateAESKey,
  generateIV,
  validateAESKey,
} from '../../services/aes.service';
import type { CryptoMode, KeySize } from '../../types/crypto';

const KEY_SIZE_OPTIONS = [
  { value: '128', label: '128-bit (16 bytes)' },
  { value: '192', label: '192-bit (24 bytes)' },
  { value: '256', label: '256-bit (32 bytes)' },
];

const MODE_OPTIONS = [
  { value: 'ECB', label: 'ECB (Electronic Codebook)' },
  { value: 'CBC', label: 'CBC (Cipher Block Chaining)' },
];

export function AESForm() {
  const [mode, setMode] = useState<CryptoMode>('ECB');
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [ivError, setIvError] = useState('');

  const { copy, status: copyStatus } = useCopyToClipboard();

  const handleGenerateKey = () => {
    const newKey = generateAESKey(keySize);
    setKey(newKey);
    setKeyError('');
  };

  const handleGenerateIV = () => {
    setIv(generateIV());
    setIvError('');
  };

  const handleEncrypt = () => {
    if (!key) {
      setKeyError('Key is required');
      return;
    }
    if (!validateAESKey(key, keySize)) {
      setKeyError(`Key must be ${keySize / 8} bytes (${keySize / 4} hex characters)`);
      return;
    }
    if (mode === 'CBC' && !iv) {
      setIvError('IV is required for CBC mode');
      return;
    }

    setKeyError('');
    setIvError('');

    const result = encryptAES(input, key, mode, mode === 'CBC' ? iv : undefined);
    if (result.success) {
      setOutput(result.data!);
      setError('');
    } else {
      setError(result.error || 'Encryption failed');
    }
  };

  const handleDecrypt = () => {
    if (!key) {
      setKeyError('Key is required');
      return;
    }
    if (!validateAESKey(key, keySize)) {
      setKeyError(`Key must be ${keySize / 8} bytes (${keySize / 4} hex characters)`);
      return;
    }
    if (mode === 'CBC' && !iv) {
      setIvError('IV is required for CBC mode');
      return;
    }

    setKeyError('');
    setIvError('');

    const result = decryptAES(input, key, mode, mode === 'CBC' ? iv : undefined);
    if (result.success) {
      setOutput(result.data!);
      setError('');
    } else {
      setError(result.error || 'Decryption failed');
    }
  };

  const handleCopy = () => {
    if (output) {
      copy(output);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Mode"
          options={MODE_OPTIONS}
          value={mode}
          onChange={(e) => setMode(e.target.value as CryptoMode)}
        />
        <Select
          label="Key Size"
          options={KEY_SIZE_OPTIONS}
          value={keySize.toString()}
          onChange={(e) => setKeySize(parseInt(e.target.value) as KeySize)}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label="Key (hex)"
            value={key}
            onChange={(e) => {
              setKey(e.target.value);
              setKeyError('');
            }}
            placeholder="Enter key or generate..."
            error={keyError}
          />
        </div>
        <div className="flex items-end pb-1">
          <Button variant="outline" onClick={handleGenerateKey}>
            <RefreshCw size={16} className="mr-1" />
            Generate
          </Button>
        </div>
      </div>

      {mode === 'CBC' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label="IV (hex)"
              value={iv}
              onChange={(e) => {
                setIv(e.target.value);
                setIvError('');
              }}
              placeholder="Enter IV or generate..."
              error={ivError}
            />
          </div>
          <div className="flex items-end pb-1">
            <Button variant="outline" onClick={handleGenerateIV}>
              <RefreshCw size={16} className="mr-1" />
              Generate
            </Button>
          </div>
        </div>
      )}

      <TextArea
        label="Input"
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to encrypt or decrypt..."
        rows={4}
      />

      <div className="flex gap-3">
        <Button onClick={handleEncrypt} disabled={!input}>
          <Lock size={16} className="mr-2" />
          Encrypt
        </Button>
        <Button variant="secondary" onClick={handleDecrypt} disabled={!input}>
          <Unlock size={16} className="mr-2" />
          Decrypt
        </Button>
      </div>

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      <TextArea
        label="Output"
        value={output}
        readOnly
        placeholder="Result will appear here..."
        rows={4}
      />

      <Button variant="outline" onClick={handleCopy} disabled={!output}>
        <Copy size={16} className="mr-2" />
        {copyStatus === 'success' ? 'Copied!' : 'Copy Result'}
      </Button>
    </div>
  );
}