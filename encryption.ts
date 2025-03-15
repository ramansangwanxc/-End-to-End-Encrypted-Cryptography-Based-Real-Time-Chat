import CryptoJS from 'crypto-js';

const ENCRYPTION_KEY = 'demo-key-123'; // In a real app, this would be unique per chat

export const encryptMessage = (message: string): string => {
  return CryptoJS.AES.encrypt(message, ENCRYPTION_KEY).toString();
};

export const decryptMessage = (encryptedMessage: string): string => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, ENCRYPTION_KEY);
  return bytes.toString(CryptoJS.enc.Utf8);
};