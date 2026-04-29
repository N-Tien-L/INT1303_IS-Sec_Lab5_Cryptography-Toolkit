import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { hash } from "../../services/hash.service";

interface Props {
  algorithm?: "MD5" | "SHA-256";
}

interface Toast {
  type: "success" | "error";
  message: string;
}

export function HashForm({ algorithm = "MD5" }: Props) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [toast, setToast] = useState<Toast | null>(null);
  const [copied, setCopied] = useState(false);

  const showToast = (type: "success" | "error", message: string) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 3000);
  };

  const handleHash = () => {
    if (!text.trim()) {
      showToast("error", "Vui lòng nhập text");
      return;
    }

    const res = hash(text.trim(), algorithm);

    if (res.success) {
      setResult(res.data || "");
      showToast("success", "Tạo hash thành công!");
      setCopied(false);
    } else {
      showToast("error", res.error || "Tạo hash thất bại");
      setResult("");
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      showToast("success", "Đã copy vào clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      showToast("error", "Không thể copy");
    }
  };

  useEffect(() => {
    setResult("");
    setCopied(false);
  }, [algorithm]);

  return (
    <div className="space-y-4">
      {/* Toast Notification */}
      {toast && (
        <div
          className={`p-3 rounded text-white text-sm font-medium animate-fade-in ${
            toast.type === "success" ? "bg-green-500" : "bg-red-500"
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Input Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nhập text
        </label>
        <textarea
          rows={6}
          placeholder="Nhập text để tạo hash..."
          className="w-full border border-gray-300 rounded p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>

      {/* Algorithm Display */}
      <p className="text-sm text-gray-600">
        Thuật toán hiện tại: <strong className="text-blue-600">{algorithm}</strong>
      </p>

      {/* Generate Button */}
      <Button
        onClick={handleHash}
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 rounded"
      >
        🔐 Tạo Hash
      </Button>

      {/* Result Textarea */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Kết quả
        </label>
        <textarea
          rows={5}
          readOnly
          className="w-full border border-gray-300 rounded p-3 font-mono text-sm bg-gray-50 focus:outline-none"
          value={result}
          placeholder="Kết quả sẽ hiển thị ở đây..."
        />
      </div>

      {/* Copy Button - Show when result exists */}
      {result && (
        <Button
          onClick={handleCopy}
          className={`w-full py-2 rounded font-medium transition-colors ${
            copied
              ? "bg-green-600 hover:bg-green-700"
              : "bg-gray-600 hover:bg-gray-700"
          } text-white`}
        >
          {copied ? "✓ Đã copy" : "📋 Copy Kết Quả"}
        </Button>
      )}
    </div>
  );
}
