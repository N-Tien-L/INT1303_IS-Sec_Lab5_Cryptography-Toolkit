import { useState } from 'react';
import { Copy, RefreshCw, Lock, Unlock, ChevronDown, ChevronRight } from 'lucide-react';
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
import { AESInfo } from './AESInfo';
import { FileEncryption } from './FileEncryption';

const KEY_SIZE_OPTIONS = [
  { value: '128', label: '128-bit (16 bytes)' },
  { value: '192', label: '192-bit (24 bytes)' },
  { value: '256', label: '256-bit (32 bytes)' },
];

const MODE_OPTIONS = [
  { value: 'ECB', label: 'ECB (Electronic Codebook)' },
  { value: 'CBC', label: 'CBC (Cipher Block Chaining)' },
];

interface CollapsibleSectionProps {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}

function CollapsibleSection({ title, children, defaultOpen = false }: CollapsibleSectionProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <span className="font-medium text-gray-700">{title}</span>
        {isOpen ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
      </button>
      {isOpen && <div className="p-4 border-t">{children}</div>}
    </div>
  );
}

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
      <AESInfo keySize={keySize} />

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

      <CollapsibleSection title="Giải thích ECB và CBC">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-semibold text-red-900 mb-2">ECB (Electronic Codebook)</h5>
            <p className="text-sm text-red-700 mb-2">
              <strong>Nguyên lý:</strong> Mỗi block 16 bytes được mã hóa độc lập.
            </p>
            <p className="text-sm text-red-700 mb-2">
              <strong>Ưu điểm:</strong> Có thể mã hóa song song, đơn giản.
            </p>
            <p className="text-sm text-red-700">
              <strong>Nhược điểm:</strong> Các block giống nhau → ciphertext giống nhau → <span className="font-bold">lộ pattern</span>. Không dùng cho dữ liệu có cấu trúc.
            </p>
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
              Block 1 (AAAA) → Cipher1 | Block 2 (AAAA) → Cipher1 | Block 3 (AAAA) → Cipher1
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">CBC (Cipher Block Chaining)</h5>
            <p className="text-sm text-green-700 mb-2">
              <strong>Nguyên lý:</strong> Block hiện tại được XOR với ciphertext block trước đó trước khi mã hóa.
            </p>
            <p className="text-sm text-green-700 mb-2">
              <strong>Ưu điểm:</strong> Che pattern, mỗi block ciphertext phụ thuộc vào tất cả blocks trước đó.
            </p>
            <p className="text-sm text-green-700">
              <strong>Nhược điểm:</strong> Không thể mã hóa song song, cần IV cho block đầu tiên.
            </p>
            <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono">
              Block 1 ⊕ IV → Cipher1 | Block 2 ⊕ Cipher1 → Cipher2 | Block 3 ⊕ Cipher2 → Cipher3
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h5 className="font-semibold text-blue-900 mb-2">Khi nào nên dùng?</h5>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>ECB:</strong> Chỉ dùng khi dữ liệu ngẫu nhiên, không có pattern (ví dụ: khóa phiên ngẫu nhiên)</li>
              <li>• <strong>CBC:</strong> Dùng cho hầu hết trường hợp: file, message, database encryption</li>
              <li>• <strong>Lưu ý:</strong> IV không cần bí mật nhưng phải ngẫu nhiên và dùng một lần (nonce)</li>
            </ul>
          </div>
        </div>
      </CollapsibleSection>

      <CollapsibleSection title="Mã hóa file">
        <FileEncryption />
      </CollapsibleSection>
    </div>
  );
}