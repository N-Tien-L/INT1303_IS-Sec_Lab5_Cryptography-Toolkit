import { useState, useEffect } from "react";
import { Button } from "../ui/Button";
import { hash } from "../../services/hash.service";

interface Props {
  algorithm?: "MD5" | "SHA-256";
}

export function HashForm({ algorithm = "MD5" }: Props) {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");

  const handleHash = () => {
    if (!text.trim()) {
      setResult("Please enter text");
      return;
    }

    const res = hash(text.trim(), algorithm);

    if (res.success) {
      setResult(res.data || "");
    } else {
      setResult(res.error || "Hash failed");
    }
  };

  useEffect(() => {
    setResult("");
  }, [algorithm]);

  return (
    <div className="space-y-4">
      <textarea
        rows={6}
        placeholder="Enter text..."
        className="w-full border rounded p-3"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />

      <p className="text-sm text-gray-500">
        Current Algorithm: <strong>{algorithm}</strong>
      </p>

      <Button onClick={handleHash}>
        Generate Hash
      </Button>

      <textarea
        rows={5}
        readOnly
        className="w-full border rounded p-3"
        value={result}
        placeholder="Result..."
      />
    </div>
  );
}
