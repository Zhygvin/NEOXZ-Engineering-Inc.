// Utilities for ArrayBuffer <-> Base64
export const arrayBufferToBase64 = (buffer: ArrayBuffer): string => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return window.btoa(binary);
};

export const base64ToArrayBuffer = (base64: string): ArrayBuffer => {
  const binary_string = window.atob(base64);
  const len = binary_string.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary_string.charCodeAt(i);
  }
  return bytes.buffer;
};

// --- Hashing ---

export const sha256 = async (message: string | ArrayBuffer): Promise<string> => {
  const encoder = new TextEncoder();
  const data = typeof message === 'string' ? encoder.encode(message) : message;
  const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
  return arrayBufferToBase64(hashBuffer);
};

// --- Key Management (ECDSA P-256) ---

export const generateKeyPair = async (): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> => {
  return await window.crypto.subtle.generateKey(
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign', 'verify']
  );
};

export const exportPublicKey = async (key: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('spki', key);
  return arrayBufferToBase64(exported);
};

export const getFingerprint = async (publicKey: CryptoKey): Promise<string> => {
  const exported = await window.crypto.subtle.exportKey('spki', publicKey);
  return await sha256(exported);
};

// --- Signing & Verifying ---

export const signData = async (privateKey: CryptoKey, data: string): Promise<string> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const signature = await window.crypto.subtle.sign(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    privateKey,
    encodedData
  );
  return arrayBufferToBase64(signature);
};

export const verifySignature = async (publicKey: CryptoKey, data: string, signatureBase64: string): Promise<boolean> => {
  const encoder = new TextEncoder();
  const encodedData = encoder.encode(data);
  const signature = base64ToArrayBuffer(signatureBase64);
  return await window.crypto.subtle.verify(
    {
      name: 'ECDSA',
      hash: { name: 'SHA-256' },
    },
    publicKey,
    signature,
    encodedData
  );
};

// --- Persistence Utilities ---

export const exportKeyPair = async (keyPair: { publicKey: CryptoKey; privateKey: CryptoKey }): Promise<{ publicJwk: JsonWebKey; privateJwk: JsonWebKey }> => {
  const publicJwk = await window.crypto.subtle.exportKey('jwk', keyPair.publicKey);
  const privateJwk = await window.crypto.subtle.exportKey('jwk', keyPair.privateKey);
  return { publicJwk, privateJwk };
};

export const importKeyPair = async (keys: { publicJwk: JsonWebKey; privateJwk: JsonWebKey }): Promise<{ publicKey: CryptoKey; privateKey: CryptoKey }> => {
  const publicKey = await window.crypto.subtle.importKey(
    'jwk',
    keys.publicJwk,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['verify']
  );

  const privateKey = await window.crypto.subtle.importKey(
    'jwk',
    keys.privateJwk,
    {
      name: 'ECDSA',
      namedCurve: 'P-256',
    },
    true,
    ['sign']
  );

  return { publicKey, privateKey };
};
