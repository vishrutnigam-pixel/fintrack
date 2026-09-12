export interface VaultContainer {
  version: number;
  salt: string;
  iv: string;
  ciphertext: string;
}

// Derive AES-256 key from a user passphrase using PBKDF2
async function deriveKey(passphrase: string, salt: Uint8Array): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    enc.encode(passphrase),
    { name: "PBKDF2" },
    false,
    ["deriveKey"]
  );

  return crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt as BufferSource,
      iterations: 100000,
      hash: "SHA-256",
    },
    keyMaterial,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
}

export async function encryptVaultPayload(passphrase: string, payload: any): Promise<string> {
  const enc = new TextEncoder();
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(passphrase, salt);

  const plaintext = enc.encode(JSON.stringify(payload));
  const ciphertextBuffer = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    plaintext
  );

  const container: VaultContainer = {
    version: 1,
    salt: Buffer.from(salt).toString("base64"),
    iv: Buffer.from(iv).toString("base64"),
    ciphertext: Buffer.from(new Uint8Array(ciphertextBuffer)).toString("base64"),
  };

  return JSON.stringify(container, null, 2);
}

export async function decryptVaultPayload(passphrase: string, rawVaultJson: string): Promise<any> {
  const container: VaultContainer = JSON.parse(rawVaultJson);
  if (!container.salt || !container.iv || !container.ciphertext) {
    throw new Error("Corrupted or invalid .fintrack vault payload structure.");
  }

  const salt = new Uint8Array(Buffer.from(container.salt, "base64"));
  const iv = new Uint8Array(Buffer.from(container.iv, "base64"));
  const ciphertext = new Uint8Array(Buffer.from(container.ciphertext, "base64"));

  const key = await deriveKey(passphrase, salt);
  const decryptedBuffer = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: iv as BufferSource },
    key,
    ciphertext
  );

  const dec = new TextDecoder();
  return JSON.parse(dec.decode(decryptedBuffer));
}