import { useState } from 'react';
import { Copy, RefreshCw, Lock, Unlock, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useCopyToClipboard } from '../../hooks';
import { TripleDESInfo } from './TripleDESInfo'; // Đảm bảo đúng đường dẫn file
import {
  encrypt3DES,
  decrypt3DES,
  generate3DESKey,
  generate3DESIV,
  validate3DESKey,
} from '../../services/tripledes.service';
import type { CryptoMode } from '../../types/crypto';

const MODE_OPTIONS = [
  { value: 'ECB', label: 'ECB (Electronic Codebook)' },
  { value: 'CBC', label: 'CBC (Cipher Block Chaining)' },
];

const KEY_SIZE_OPTIONS = [
  { value: '128', label: '128-bit (16 bytes)' },
  { value: '192', label: '192-bit (24 bytes)' },
];

const TRIPLE_DES_IV_HEX_LENGTH = 16; // 8 bytes = 16 hex chars

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

export function TripleDESForm() {
  const [mode, setMode] = useState<CryptoMode>('ECB');
  const [keySize, setKeySize] = useState(192); // Mặc định Option 3 (24 bytes)
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [ivError, setIvError] = useState('');

  const { copy, status: copyStatus } = useCopyToClipboard();

  // ─── Helpers ────────────────────────────────────────────────
  const validateInputs = (): boolean => {
    let valid = true;

    if (!key) {
      setKeyError('Key is required');
      valid = false;
    } else if (!validate3DESKey(key, keySize)) {
      setKeyError(`Key must be exactly ${keySize / 8} bytes (${keySize / 4} hex characters)`);
      valid = false;
    } else {
      setKeyError('');
    }

    if (mode === 'CBC') {
      if (!iv) {
        setIvError('IV is required for CBC mode');
        valid = false;
      } else if (iv.length !== TRIPLE_DES_IV_HEX_LENGTH) {
        setIvError(`IV must be exactly 8 bytes (${TRIPLE_DES_IV_HEX_LENGTH} hex characters)`);
        valid = false;
      } else {
        setIvError('');
      }
    }

    return valid;
  };

  // ─── Handlers ───────────────────────────────────────────────
  const handleGenerateKey = () => {
    setKey(generate3DESKey(keySize));
    setKeyError('');
  };

  const handleGenerateIV = () => {
    setIv(generate3DESIV());
    setIvError('');
  };

  const handleEncrypt = () => {
    if (!input) { setError('Please enter plaintext to encrypt'); return; }
    if (!validateInputs()) return;
    setError('');

    const result = encrypt3DES(input, key, mode, mode === 'CBC' ? iv : undefined);
    if (result.success) {
      setOutput(result.data!);
    } else {
      setError(result.error || 'Encryption failed');
      setOutput('');
    }
  };

  const handleDecrypt = () => {
    if (!input) { setError('Please enter ciphertext to decrypt'); return; }
    if (!validateInputs()) return;
    setError('');

    const result = decrypt3DES(input, key, mode, mode === 'CBC' ? iv : undefined);
    if (result.success) {
      setOutput(result.data!);
    } else {
      setError(result.error || 'Decryption failed');
      setOutput('');
    }
  };

  const handleReset = () => {
    setInput('');
    setOutput('');
    setKey('');
    setIv('');
    setError('');
    setKeyError('');
    setIvError('');
  };

  const handleModeChange = (newMode: CryptoMode) => {
    setMode(newMode);
    if (newMode === 'ECB') setIv('');
    setIvError('');
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      <TripleDESInfo keySize={keySize} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Select
          label="Chế độ mã hóa (Mode)"
          options={MODE_OPTIONS}
          value={mode}
          onChange={(e) => handleModeChange(e.target.value as CryptoMode)}
        />
        <Select
          label="Độ dài khóa (Key Size)"
          options={KEY_SIZE_OPTIONS}
          value={keySize.toString()}
          onChange={(e) => {
            setKeySize(parseInt(e.target.value));
            setKey(''); // Xóa key cũ khi đổi size để tránh lỗi validate
          }}
        />
      </div>

      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label={`Secret Key (hex) — ${keySize/8} bytes / ${keySize/4} ký tự hex`}
            value={key}
            onChange={(e) => { setKey(e.target.value); setKeyError(''); }}
            placeholder="Nhập hex key hoặc tự tạo..."
            error={keyError}
          />
        </div>
        <div className="flex items-end pb-1">
          <Button variant="outline" onClick={handleGenerateKey}>
            <RefreshCw size={16} className="mr-1" />
            Generate Key
          </Button>
        </div>
      </div>

      {mode === 'CBC' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label={`IV (hex) — 8 bytes / ${TRIPLE_DES_IV_HEX_LENGTH} ký tự hex`}
              value={iv}
              onChange={(e) => { setIv(e.target.value); setIvError(''); }}
              placeholder="Nhập 16 ký tự hex..."
              error={ivError}
            />
          </div>
          <div className="flex items-end pb-1">
            <Button variant="outline" onClick={handleGenerateIV}>
              <RefreshCw size={16} className="mr-1" />
              Generate IV
            </Button>
          </div>
        </div>
      )}

      <TextArea
        label="Input"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(''); }}
        placeholder="Nhập dữ liệu..."
        rows={4}
      />

      <div className="flex flex-wrap gap-3">
        <Button onClick={handleEncrypt} disabled={!input}>
          <Lock size={16} className="mr-2" /> Encrypt
        </Button>
        <Button variant="secondary" onClick={handleDecrypt} disabled={!input}>
          <Unlock size={16} className="mr-2" /> Decrypt
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" /> Reset
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
        placeholder="Kết quả..."
        rows={4}
      />

      <Button variant="outline" onClick={() => output && copy(output)} disabled={!output}>
        <Copy size={16} className="mr-2" />
        {copyStatus === 'success' ? '✓ Copied!' : 'Copy Result'}
      </Button>

      <CollapsibleSection title="Chi tiết về Triple DES">
        <div className="space-y-3 text-sm text-gray-600">
          <p>3DES vận hành theo chu trình <strong>Encrypt-Decrypt-Encrypt (EDE)</strong>:</p>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>(128-bit):</strong> Sử dụng 2 khóa K1 và K2. (K1=K3). Thực tế độ dài khóa hiệu dụng là 80-bit.</li>
            <li><strong>(192-bit):</strong> Sử dụng 3 khóa độc lập K1, K2, K3. Độ dài hiệu dụng khoảng 112-bit.</li>
            <li><strong>An toàn:</strong> Mặc dù DES lỗi thời, 3DES vẫn đủ an toàn cho nhiều ứng dụng, tuy nhiên nó chậm hơn đáng kể so với AES.</li>
          </ul>
        </div>
      </CollapsibleSection>
    </div>
  );
}