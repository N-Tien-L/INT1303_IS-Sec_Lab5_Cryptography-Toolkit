import { Info, Key, AlertTriangle, Shield } from 'lucide-react';

export function DESInfo() {
  return (
    <div className="space-y-4">
      {/* Giới thiệu */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <Info size={18} className="text-blue-600" />
          <h4 className="font-semibold text-blue-900">Giới thiệu về DES</h4>
        </div>
        <p className="text-sm text-blue-700">
          DES (Data Encryption Standard) là thuật toán mã hóa đối xứng được NIST chuẩn hóa năm 1977.
          DES sử dụng khóa 56-bit và block 64-bit, trải qua 16 vòng mã hóa Feistel.
          Mặc dù hiện tại DES <strong>không còn an toàn</strong> trong thực tế (có thể brute-force),
          nó vẫn là nền tảng quan trọng để hiểu mật mã học hiện đại.
        </p>
      </div>

      {/* Thông số kỹ thuật */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Key size={16} className="text-purple-600" />
            <span className="font-medium text-gray-800">Thông số</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Khóa: <strong>64-bit</strong> (56-bit hiệu quả)</li>
            <li>• Block size: <strong>64-bit (8 bytes)</strong></li>
            <li>• Số vòng: <strong>16 vòng Feistel</strong></li>
            <li>• IV: 8 bytes (chế độ CBC)</li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Shield size={16} className="text-green-600" />
            <span className="font-medium text-gray-800">Chế độ hỗ trợ</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• <strong>ECB</strong>: Mã hóa từng block độc lập</li>
            <li>• <strong>CBC</strong>: Block sau phụ thuộc block trước</li>
            <li>• Padding: PKCS#7</li>
            <li>• Output: Hex string</li>
          </ul>
        </div>

        <div className="bg-white border rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Info size={16} className="text-orange-600" />
            <span className="font-medium text-gray-800">Lịch sử</span>
          </div>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Phát triển bởi IBM, 1973</li>
            <li>• Chuẩn hóa bởi NIST, 1977</li>
            <li>• Bị phá vỡ năm 1999 (22h)</li>
            <li>• Thay thế bởi AES năm 2001</li>
          </ul>
        </div>
      </div>

      {/* Cảnh báo bảo mật */}
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          <AlertTriangle size={18} className="text-red-600" />
          <h5 className="font-semibold text-red-900">⚠️ Lưu ý bảo mật</h5>
        </div>
        <p className="text-sm text-red-700">
          DES <strong>không còn an toàn</strong> trong thực tế. Khóa 56-bit quá ngắn — máy tính hiện đại
          có thể brute-force trong vài giờ. Chỉ sử dụng DES cho mục đích <strong>học tập</strong>.
          Trong thực tế, hãy dùng <strong>AES-256</strong> hoặc ít nhất là <strong>3DES</strong>.
        </p>
      </div>

      {/* Cơ chế hoạt động */}
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h5 className="font-semibold text-gray-800 mb-2">Thuật toán DES hoạt động như thế nào?</h5>
        <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
          <li><strong>Initial Permutation (IP):</strong> Hoán vị 64-bit plaintext theo bảng IP cố định</li>
          <li><strong>Chia đôi:</strong> Tách thành 2 nửa L₀ (32-bit) và R₀ (32-bit)</li>
          <li>
            <strong>16 vòng Feistel:</strong> Mỗi vòng i thực hiện:
            <ul className="ml-4 mt-1 space-y-1 list-disc list-inside text-gray-500">
              <li>Lᵢ = Rᵢ₋₁</li>
              <li>Rᵢ = Lᵢ₋₁ ⊕ f(Rᵢ₋₁, Kᵢ) — hàm Feistel với subkey Kᵢ</li>
              <li>Hàm f: Expansion → XOR với subkey → S-box substitution → Permutation</li>
            </ul>
          </li>
          <li><strong>Final Permutation (FP):</strong> Hoán vị ngược để tạo ciphertext 64-bit</li>
        </ol>
      </div>
    </div>
  );
}
