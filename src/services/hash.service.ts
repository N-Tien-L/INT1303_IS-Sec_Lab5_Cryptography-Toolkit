import CryptoJS from 'crypto-js';

export function hash(data: string, algorithm: string) {
  const algo = algorithm.trim().toUpperCase();

  const result =
    algo === "MD5"
      ? CryptoJS.MD5(data)
      : CryptoJS.SHA256(data);

  return {
    success: true,
    data: result.toString(CryptoJS.enc.Hex),
  };
}
