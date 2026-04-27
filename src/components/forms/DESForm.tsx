import { useState } from 'react';
import { Copy, RefreshCw, Lock, Unlock, RotateCcw, ChevronDown, ChevronRight } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { TextArea } from '../ui/TextArea';
import { useCopyToClipboard } from '../../hooks';
import {
  encryptDES,
  decryptDES,
  generateDESKey,
  generateDESIV,
  validateDESKey,
  validateDESIV,
  DES_KEY_HEX_LENGTH,
  DES_IV_HEX_LENGTH,
} from '../../services/des.service';
import type { CryptoMode } from '../../types/crypto';
import { DESInfo } from './DESInfo';

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

export function DESForm() {
  const [mode, setMode] = useState<CryptoMode>('ECB');
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
    } else if (!validateDESKey(key)) {
      setKeyError(`Key must be exactly 8 bytes (${DES_KEY_HEX_LENGTH} hex characters)`);
      valid = false;
    } else {
      setKeyError('');
    }

    if (mode === 'CBC') {
      if (!iv) {
        setIvError('IV is required for CBC mode');
        valid = false;
      } else if (!validateDESIV(iv)) {
        setIvError(`IV must be exactly 8 bytes (${DES_IV_HEX_LENGTH} hex characters)`);
        valid = false;
      } else {
        setIvError('');
      }
    }

    return valid;
  };

  // ─── Handlers ───────────────────────────────────────────────
  const handleGenerateKey = () => {
    setKey(generateDESKey());
    setKeyError('');
  };

  const handleGenerateIV = () => {
    setIv(generateDESIV());
    setIvError('');
  };

  const handleEncrypt = () => {
    if (!input) { setError('Please enter plaintext to encrypt'); return; }
    if (!validateInputs()) return;
    setError('');

    const result = encryptDES(input, key, mode, mode === 'CBC' ? iv : undefined);
    if (result.success) {
      setOutput(result.data!);
    } else {
      setError(result.error || 'Encryption failed');
      setOutput('');
    }
  };

  const handleDecrypt = () => {
    if (!input) { setError('Please enter ciphertext (hex) to decrypt'); return; }
    if (!validateInputs()) return;
    setError('');

    const result = decryptDES(input, key, mode, mode === 'CBC' ? iv : undefined);
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

  const handleCopy = () => {
    if (output) copy(output);
  };

  const handleModeChange = (newMode: CryptoMode) => {
    setMode(newMode);
    // Clear IV when switching to ECB mode since IV is not needed
    if (newMode === 'ECB') {
      setIv('');
    }
    setIvError('');
  };

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Info panel */}
      <DESInfo />

      {/* Mode selector */}
      <Select
        label="Chế độ mã hóa (Mode)"
        options={MODE_OPTIONS}
        value={mode}
        onChange={(e) => handleModeChange(e.target.value as CryptoMode)}
      />

      {/* Key input */}
      <div className="flex gap-2">
        <div className="flex-1">
          <Input
            label={`Secret Key (hex) — 8 bytes / ${DES_KEY_HEX_LENGTH} ký tự hex`}
            value={key}
            onChange={(e) => { setKey(e.target.value); setKeyError(''); }}
            placeholder="Nhập key 16 ký tự hex hoặc tự tạo..."
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

      {/* IV input — chỉ hiện khi CBC */}
      {mode === 'CBC' && (
        <div className="flex gap-2">
          <div className="flex-1">
            <Input
              label={`IV (hex) — 8 bytes / ${DES_IV_HEX_LENGTH} ký tự hex`}
              value={iv}
              onChange={(e) => { setIv(e.target.value); setIvError(''); }}
              placeholder="Nhập IV 16 ký tự hex hoặc tự tạo..."
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

      {/* Input text */}
      <TextArea
        label="Input"
        value={input}
        onChange={(e) => { setInput(e.target.value); setError(''); }}
        placeholder="Nhập plaintext để mã hóa, hoặc hex ciphertext để giải mã..."
        rows={4}
      />

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handleEncrypt} disabled={!input}>
          <Lock size={16} className="mr-2" />
          Encrypt
        </Button>
        <Button variant="secondary" onClick={handleDecrypt} disabled={!input}>
          <Unlock size={16} className="mr-2" />
          Decrypt
        </Button>
        <Button variant="outline" onClick={handleReset}>
          <RotateCcw size={16} className="mr-2" />
          Reset
        </Button>
      </div>

      {/* Error message */}
      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Output */}
      <TextArea
        label="Output"
        value={output}
        readOnly
        placeholder="Kết quả sẽ hiển thị ở đây..."
        rows={4}
      />

      {/* Copy result */}
      <Button variant="outline" onClick={handleCopy} disabled={!output}>
        <Copy size={16} className="mr-2" />
        {copyStatus === 'success' ? '✓ Copied!' : 'Copy Result'}
      </Button>

      {/* Giải thích ECB vs CBC */}
      <CollapsibleSection title="Giải thích ECB và CBC trong DES">
        <div className="space-y-4">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h5 className="font-semibold text-red-900 mb-2">ECB (Electronic Codebook)</h5>
            <p className="text-sm text-red-700 mb-2">
              <strong>Nguyên lý:</strong> Mỗi block 8 bytes được mã hóa <em>độc lập</em> với cùng một khóa.
            </p>
            <p className="text-sm text-red-700 mb-2">
              <strong>Ưu điểm:</strong> Đơn giản, có thể mã hóa song song.
            </p>
            <p className="text-sm text-red-700">
              <strong>Nhược điểm:</strong> Các block plaintext giống nhau → ciphertext giống nhau → <strong>lộ pattern dữ liệu</strong>.
            </p>
            <div className="mt-2 p-2 bg-red-100 rounded text-xs font-mono">
              Block(AAAA) → CipherX &nbsp;|&nbsp; Block(AAAA) → CipherX &nbsp;|&nbsp; Block(BBBB) → CipherY
            </div>
          </div>

          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <h5 className="font-semibold text-green-900 mb-2">CBC (Cipher Block Chaining)</h5>
            <p className="text-sm text-green-700 mb-2">
              <strong>Nguyên lý:</strong> Mỗi block được XOR với ciphertext của block trước đó trước khi mã hóa.
              Block đầu tiên XOR với IV.
            </p>
            <p className="text-sm text-green-700 mb-2">
              <strong>Ưu điểm:</strong> Che pattern — block plaintext giống nhau nhưng ciphertext khác nhau.
            </p>
            <p className="text-sm text-green-700">
              <strong>Nhược điểm:</strong> Không thể song song, cần IV ngẫu nhiên mỗi lần mã hóa.
            </p>
            <div className="mt-2 p-2 bg-green-100 rounded text-xs font-mono">
              Block1 ⊕ IV → Cipher1 &nbsp;|&nbsp; Block2 ⊕ Cipher1 → Cipher2 &nbsp;|&nbsp; Block3 ⊕ Cipher2 → Cipher3
            </div>
          </div>
        </div>
      </CollapsibleSection>
    </div>
  );
}
