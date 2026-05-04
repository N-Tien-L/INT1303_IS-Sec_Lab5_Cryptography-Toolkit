import { Info, Key, AlertTriangle, Shield, Zap } from 'lucide-react';

export function TripleDESInfo({ keySize }: { keySize: number }) {
  return (
    <div className="space-y-4">
      {/* Giới thiệu */}
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-amber-600" />
          <h4 className="font-semibold text-amber-900">Giới thiệu về Triple DES (3DES)</h4>
        </div>
        <p className="text-sm text-amber-700">
          3DES (TDEA - Triple Data Encryption Algorithm) là phiên bản cải tiến của DES, được thiết kế để kéo dài tuổi thọ của DES bằng cách áp dụng thuật toán mã hóa ba lần lên mỗi khối dữ liệu nhằm chống lại các cuộc tấn công brute-force vào khóa 56-bit.
        </p>
      </div>

      {/* Thông số kỹ thuật */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-purple-600" />
            <span className="font-medium text-gray-800">Thông số 3DES</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Khóa: <strong>{keySize}-bit</strong></li>
            <li>• Block size: <strong>64-bit (8 bytes)</strong></li>
            <li>• Số vòng: <strong>48 vòng</strong> (16x3)</li>
            <li>• Quy trình: <strong>Encrypt-Decrypt-Encrypt</strong></li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-green-600" />
            <span className="font-medium text-gray-800">Độ an toàn</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Option 3: 3 khóa độc lập (K1≠K2≠K3)</li>
            <li>• Option 2: 2 khóa (K1=K3)</li>
            <li>• Hiệu quả: Khóa 192-bit cung cấp độ bảo mật tương đương ~112-bit</li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Zap size={16} className="text-blue-600" />
            <span className="font-medium text-gray-800">Hiệu năng</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Chậm hơn DES 3 lần</li>
            <li>• Chậm hơn AES đáng kể</li>
            <li>• Vẫn dùng trong thẻ ATM/POS</li>
            <li>• Đang dần bị loại bỏ (Deprecated)</li>
          </ul>
        </div>
      </div>

      {/* Cơ chế EDE */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-2">Cơ chế Encrypt-Decrypt-Encrypt (EDE)</h5>
        <div className="text-sm text-gray-600 space-y-2">
          <p>Tại sao lại là <strong>Mã hóa → Giải mã → Mã hóa</strong> thay vì Mã hóa 3 lần?</p>
          <ul className="ml-4 space-y-1 list-disc list-inside">
            <li><strong>Tính tương thích ngược:</strong> Nếu đặt K1 = K2 = K3, 3DES sẽ hoạt động y hệt như DES truyền thống.</li>
            <li><strong>Tăng không gian khóa:</strong> Việc dùng giải mã ở giữa giúp tăng độ phức tạp cho các cuộc tấn công mật mã học so với việc chỉ mã hóa liên tiếp.</li>
          </ul>
          <div className="mt-2 p-2 bg-gray-200 rounded text-center font-mono text-xs">
            Ciphertext = E<sub>K3</sub>( D<sub>K2</sub>( E<sub>K1</sub>(Plaintext) ) )
          </div>
        </div>
      </div>

      {/* Cảnh báo */}
      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-orange-600" />
          <h5 className="font-semibold text-orange-900">⚠️ Trạng thái hiện tại</h5>
        </div>
        <p className="text-sm text-orange-700">
          NIST đã công bố <strong>loại bỏ 3DES</strong> khỏi danh sách các tiêu chuẩn mật mã an toàn sau năm 2023 do kích thước khối (block size) 64-bit nhỏ, dễ bị tấn công <strong>Sweet32</strong>. Khuyến nghị chuyển sang <strong>AES-256</strong>.
        </p>
      </div>
    </div>
  );
}