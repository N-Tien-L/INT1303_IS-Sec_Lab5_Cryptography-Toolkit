import { Info, Key, Shield, FileText, AlertTriangle } from 'lucide-react';
import type { KeySize } from '../../types/crypto';

interface AESInfoProps {
  keySize: KeySize;
}

export function AESInfo({ keySize }: AESInfoProps) {
  const keySizes = {
    128: { bits: 128, bytes: 16, rounds: 10, label: 'AES-128' },
    192: { bits: 192, bytes: 24, rounds: 12, label: 'AES-192' },
    256: { bits: 256, bytes: 32, rounds: 14, label: 'AES-256' },
  };

  const currentKeySize = keySizes[keySize];

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-blue-600" />
          <h4 className="font-semibold text-blue-900">Giới thiệu về AES</h4>
        </div>
        <p className="text-sm text-blue-700">
          AES (Advanced Encryption Standard) là thuật toán mã hóa đối xứng được chọn bởi NIST năm 2001. 
          Nó thay thế DES và được sử dụng rộng rãi trên toàn thế giới để bảo mật dữ liệu.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-purple-600" />
            <span className="font-medium text-gray-800">{currentKeySize.label}</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Khóa: {currentKeySize.bits} bits ({currentKeySize.bytes} bytes)</li>
            <li>• Số vòng: {currentKeySize.rounds}</li>
            <li>• Block size: 128 bits (16 bytes)</li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-green-600" />
            <span className="font-medium text-gray-800">Ứng dụng</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Mã hóa file và thư mục</li>
            <li>• Bảo mật truyền dữ liệu</li>
            <li>• VPN và mạng riêng ảo</li>
            <li>• HTTPS/TLS protocols</li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-orange-600" />
            <span className="font-medium text-gray-800">Tính năng</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Hỗ trợ ECB và CBC</li>
            <li>• Key sizes: 128/192/256</li>
            <li>• Mã hóa file</li>
            <li>• Giải thích thuật toán</li>
          </ul>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-yellow-600" />
          <h5 className="font-semibold text-yellow-900">Tính năng của bộ công cụ này</h5>
        </div>
        
        <div className="bg-white rounded p-3 border border-yellow-100">
          <div className="flex items-center gap-2 mb-2">
            <FileText size={16} className="text-green-600" />
            <span className="font-medium text-gray-800">Mã hóa file</span>
          </div>
          <p className="text-sm text-gray-600">
            Kéo thả file để mã hóa hoặc giải mã. Hỗ trợ mọi loại file (text, image, document...). 
            Kết quả có thể tải về ngay. Tiện lợi cho việc bảo mật file cá nhân.
          </p>
        </div>
      </div>

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-2">Thuật toán AES hoạt động như thế nào?</h5>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li>
            <strong>Chia plaintext thành blocks:</strong> 16 bytes được chia thành ma trận 4x4 (state)
          </li>
          <li>
            <strong>Key Expansion:</strong> Khóa ban đầu được mở rộng thành nhiều round keys cho từng vòng
          </li>
          <li>
            <strong>Initial Round:</strong> XOR state với round key đầu tiên
          </li>
          <li>
            <strong>Rounds (1 đến N):</strong> Mỗi vòng gồm 4 bước:
            <ul className="ml-4 mt-1 space-y-1 list-disc list-inside text-gray-500">
              <li>SubBytes: Thay thế mỗi byte bằng giá trị từ S-box</li>
              <li>ShiftRows: Dịch các hàng trong ma trận</li>
              <li>MixColumns: Trộn các cột trong ma trận</li>
              <li>AddRoundKey: XOR với round key</li>
            </ul>
          </li>
          <li>
            <strong>Final Round:</strong> Tương tự nhưng bỏ MixColumns
          </li>
          <li>
            <strong>Ciphertext:</strong> Kết quả là 16 bytes ciphertext
          </li>
        </ol>
      </div>
    </div>
  );
}