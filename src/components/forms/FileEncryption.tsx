import { useState, useRef } from 'react';
import { Upload, Download, File, X, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import CryptoJS from 'crypto-js';
import type { CryptoMode, KeySize } from '../../types/crypto';
import { generateAESKey, generateIV, validateAESKey } from '../../services/aes.service';

const KEY_SIZE_OPTIONS = [
  { value: '128', label: '128-bit (16 bytes)' },
  { value: '192', label: '192-bit (24 bytes)' },
  { value: '256', label: '256-bit (32 bytes)' },
];

const MODE_OPTIONS = [
  { value: 'ECB', label: 'ECB (Electronic Codebook)' },
  { value: 'CBC', label: 'CBC (Cipher Block Chaining)' },
];

export function FileEncryption() {
  const [mode, setMode] = useState<CryptoMode>('ECB');
  const [keySize, setKeySize] = useState<KeySize>(128);
  const [key, setKey] = useState('');
  const [iv, setIv] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<{ url: string; name: string } | null>(null);
  const [error, setError] = useState('');
  const [keyError, setKeyError] = useState('');
  const [ivError, setIvError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleGenerateKey = () => {
    setKey(generateAESKey(keySize));
    setKeyError('');
  };

  const handleGenerateIV = () => {
    setIv(generateIV());
    setIvError('');
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setResult(null);
      setError('');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      setFile(droppedFile);
      setResult(null);
      setError('');
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const validateForm = () => {
    if (!key) {
      setKeyError('Key is required');
      return false;
    }
    if (!validateAESKey(key, keySize)) {
      setKeyError(`Key must be ${keySize / 8} bytes (${keySize / 4} hex characters)`);
      return false;
    }
    if (mode === 'CBC' && !iv) {
      setIvError('IV is required for CBC mode');
      return false;
    }
    setKeyError('');
    setIvError('');
    return true;
  };

  const handleEncryptFile = async () => {
    if (!file) return;
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const dataUrl = e.target?.result as string;
          const keyWordArray = CryptoJS.enc.Hex.parse(key);
          const modeConfig = mode === 'CBC' && iv ? { iv: CryptoJS.enc.Hex.parse(iv) } : {};

          const encrypted = CryptoJS.AES.encrypt(dataUrl, keyWordArray, {
            mode: CryptoJS.mode[mode],
            padding: CryptoJS.pad.Pkcs7,
            ...modeConfig,
          }).toString();

          const blob = new Blob([encrypted], { type: 'text/plain' });
          const url = URL.createObjectURL(blob);
          
          setResult({
            url,
            name: `${file.name}.aes`,
          });
        } catch (err) {
          setError('Lỗi khi mã hóa: ' + (err as Error).message);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Lỗi đọc file');
        setIsProcessing(false);
      };
      reader.readAsDataURL(file);
    } catch (err) {
      setError((err as Error).message);
      setIsProcessing(false);
    }
  };

  const handleDecryptFile = async () => {
    if (!file) return;
    if (!validateForm()) return;

    setIsProcessing(true);
    setError('');

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const ciphertext = e.target?.result as string;
          const keyWordArray = CryptoJS.enc.Hex.parse(key);
          const modeConfig = mode === 'CBC' && iv ? { iv: CryptoJS.enc.Hex.parse(iv) } : {};

          const decrypted = CryptoJS.AES.decrypt(ciphertext, keyWordArray, {
            mode: CryptoJS.mode[mode],
            padding: CryptoJS.pad.Pkcs7,
            ...modeConfig,
          });

          const dataUrl = decrypted.toString(CryptoJS.enc.Utf8);
          if (!dataUrl || !dataUrl.startsWith('data:')) {
            throw new Error('Key, mode, hoặc IV không đúng (hoặc file không hợp lệ)');
          }

          // Convert dataURL to blob for download
          const response = await fetch(dataUrl);
          const blob = await response.blob();
          const url = URL.createObjectURL(blob);

          setResult({
            url,
            name: file.name.replace('.aes', ''),
          });
        } catch (err) {
          setError('Giải mã thất bại: ' + (err as Error).message);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.onerror = () => {
        setError('Lỗi đọc file');
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } catch (err) {
      setError((err as Error).message);
      setIsProcessing(false);
    }
  };

  const handleDownload = () => {
    if (!result) return;
    const a = document.createElement('a');
    a.href = result.url;
    a.download = result.name;
    a.click();
  };

  const clearFile = () => {
    setFile(null);
    if (result) {
      URL.revokeObjectURL(result.url);
      setResult(null);
    }
    setError('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
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

      <div>
        <h4 className="font-semibold text-gray-800 mb-2">Chọn file</h4>
        
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
            file ? 'border-blue-400 bg-blue-50' : 'border-gray-300 hover:border-blue-400'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            onChange={handleFileSelect}
            className="hidden"
            id="file-input"
          />
          
          {file ? (
            <div className="flex items-center justify-center gap-3">
              <File size={24} className="text-blue-600" />
              <div className="text-left">
                <p className="font-medium text-gray-800">{file.name}</p>
                <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
              </div>
              <button onClick={clearFile} className="p-1 hover:bg-gray-200 rounded">
                <X size={20} className="text-gray-500" />
              </button>
            </div>
          ) : (
            <label htmlFor="file-input" className="cursor-pointer">
              <Upload size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-gray-600">Kéo thả hoặc click để chọn file</p>
            </label>
          )}
        </div>
      </div>

      {file && (
        <div className="flex gap-3">
          <Button onClick={handleEncryptFile} disabled={isProcessing}>
            <Upload size={16} className="mr-2" />
            {isProcessing ? 'Đang xử lý...' : 'Mã hóa file'}
          </Button>
          <Button variant="secondary" onClick={handleDecryptFile} disabled={isProcessing}>
            <Download size={16} className="mr-2" />
            {isProcessing ? 'Đang xử lý...' : 'Giải mã file'}
          </Button>
        </div>
      )}

      {error && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-green-800 font-medium mb-2">File đã sẵn sàng tải về!</p>
          <Button onClick={handleDownload}>
            <Download size={16} className="mr-2" />
            Tải về {result.name}
          </Button>
        </div>
      )}
    </div>
  );
}