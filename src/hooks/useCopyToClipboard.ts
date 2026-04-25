import { useState, useCallback } from 'react';

type CopyStatus = 'idle' | 'success' | 'error';

export function useCopyToClipboard(resetDelay: number = 2000) {
  const [status, setStatus] = useState<CopyStatus>('idle');

  const copy = useCallback(async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setStatus('success');
      setTimeout(() => setStatus('idle'), resetDelay);
      return true;
    } catch {
      setStatus('error');
      setTimeout(() => setStatus('idle'), resetDelay);
      return false;
    }
  }, [resetDelay]);

  return { copy, status };
}