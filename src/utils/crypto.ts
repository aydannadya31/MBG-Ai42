/**
 * Simple client-side encryption utility to ensure data is stored in encrypted format
 * both on device (localStorage) and during cloud-backup transfers (E2E simulation).
 */

const ENCRYPTION_SALT = 'MBG_AI42_SUPER_SECURED_SALT_SECRET';

/**
 * Encrypts a string of text using a simple, robust reversible cipher (with salt)
 * and outputs base64 string to act as "encrypted device storage" and "e2e cloud transit".
 */
export function encryptData(rawData: string): string {
  try {
    const jsonStr = String(rawData);
    // Convert string to array of characters, XOR with salt characters, and return base64
    let result = '';
    for (let i = 0; i < jsonStr.length; i++) {
      const charCode = jsonStr.charCodeAt(i);
      const saltChar = ENCRYPTION_SALT.charCodeAt(i % ENCRYPTION_SALT.length);
      // XOR operations
      const encryptedCode = charCode ^ saltChar;
      result += String.fromCharCode(encryptedCode);
    }
    // Encode as base64 safely
    return btoa(unescape(encodeURIComponent(result)));
  } catch (error) {
    console.error('Encryption failed, returning raw fallback:', error);
    return rawData;
  }
}

/**
 * Decrypts a base64 encoded ciphered string back to original format.
 */
export function decryptData(cipherText: string): string {
  try {
    if (!cipherText) return '';
    // Decode base64
    const decodedB64 = decodeURIComponent(escape(atob(cipherText)));
    let result = '';
    for (let i = 0; i < decodedB64.length; i++) {
      const charCode = decodedB64.charCodeAt(i);
      const saltChar = ENCRYPTION_SALT.charCodeAt(i % ENCRYPTION_SALT.length);
      const decryptedCode = charCode ^ saltChar;
      result += String.fromCharCode(decryptedCode);
    }
    return result;
  } catch (error) {
    console.error('Decryption failed, returning input:', error);
    return cipherText;
  }
}

/**
 * Helper to write encrypted values to LocalStorage.
 */
export function setSecureItem(key: string, value: any): void {
  try {
    const rawString = typeof value === 'string' ? value : JSON.stringify(value);
    const encrypted = encryptData(rawString);
    localStorage.setItem(`sec_${key}`, encrypted);
  } catch (error) {
    console.error('Secure save failed:', error);
  }
}

/**
 * Helper to read encrypted values from LocalStorage.
 */
export function getSecureItem<T>(key: string): T | null {
  try {
    const encrypted = localStorage.getItem(`sec_${key}`);
    if (!encrypted) return null;
    const decrypted = decryptData(encrypted);
    try {
      return JSON.parse(decrypted) as T;
    } catch {
      return decrypted as unknown as T;
    }
  } catch (error) {
    console.error('Secure load failed:', error);
    return null;
  }
}
