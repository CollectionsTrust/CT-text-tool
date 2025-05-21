// src/utils/passwordUtils.js
import * as argon2 from 'argon2-browser';

/**
 * Hash a password using Argon2id
 * @param {string} password - The password to hash
 * @returns {Promise<object>} - Object containing the hash and parameters
 */
export const hashPassword = async (password) => {
  try {
    // Generate a random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Hash the password
    const result = await argon2.hash({
      pass: password,
      salt: salt,
      type: argon2.ArgonType.Argon2id, // Recommended variant
      time: 3,        // Number of iterations
      mem: 4096,      // Memory usage in KiB (4 MB)
      parallelism: 1, // Number of threads
      hashLen: 32     // Output length
    });
    
    // Convert salt to hex for storage
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Return an object that's easily storable in Firestore
    return {
      hash: result.encoded, // This contains everything needed for verification
      salt: saltHex,
      type: 'argon2id'
    };
  } catch (err) {
    console.error('Error hashing password:', err);
    
    // Fallback to PBKDF2 if Argon2 fails
    return fallbackHashPassword(password);
  }
};

/**
 * Verify a password against a stored hash
 * @param {string} password - The password to verify
 * @param {object|string} storedHash - The stored hash object or string
 * @returns {Promise<boolean>} - True if password matches
 */
export const verifyPassword = async (password, storedHash) => {
  try {
    // Handle legacy "default" password
    if (storedHash === 'default') {
      return password === 'default';
    }
    
    // Handle Argon2 hash
    if (typeof storedHash === 'object' && storedHash.type === 'argon2id' && storedHash.hash) {
      return await argon2.verify({
        pass: password,
        encoded: storedHash.hash
      });
    }
    
    // Handle PBKDF2 fallback
    if (typeof storedHash === 'object' && storedHash.type === 'pbkdf2') {
      return fallbackVerifyPassword(password, storedHash);
    }
    
    return false;
  } catch (err) {
    console.error('Error verifying password:', err);
    
    // Try fallback verification if Argon2 fails
    if (typeof storedHash === 'object' && storedHash.salt) {
      return fallbackVerifyPassword(password, storedHash);
    }
    
    return false;
  }
};

/**
 * Fallback hash method using PBKDF2 with Web Crypto API
 * Used if WebAssembly/Argon2 fails to load
 */
const fallbackHashPassword = async (password) => {
  try {
    // Convert password to buffer
    const encoder = new TextEncoder();
    const passwordBuffer = encoder.encode(password);
    
    // Generate random salt
    const salt = crypto.getRandomValues(new Uint8Array(16));
    
    // Import password as key
    const passwordKey = await crypto.subtle.importKey(
      'raw',
      passwordBuffer,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    );
    
    // Derive key with PBKDF2
    const iterations = 600000; // High iteration count for security
    const derivedBits = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: iterations,
        hash: 'SHA-256'
      },
      passwordKey,
      256 // 256-bit output
    );
    
    // Convert to hex for storage
    const hashArray = Array.from(new Uint8Array(derivedBits));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    // Convert salt to hex
    const saltHex = Array.from(salt).map(b => b.toString(16).padStart(2, '0')).join('');
    
    return {
      hash: hashHex,
      salt: saltHex,
      iterations: iterations,
      type: 'pbkdf2'
    };
  } catch (err) {
    console.error('Fallback hashing failed:', err);
    throw err;
  }
};

/**
 * Fallback verify method for PBKDF2
 */
const fallbackVerifyPassword = async (password, storedHash) => {
  try {
    // Handle PBKDF2 hash
    if (storedHash.type === 'pbkdf2') {
      // Convert hex salt to buffer
      const salt = new Uint8Array(storedHash.salt.match(/.{1,2}/g).map(byte => parseInt(byte, 16)));
      
      // Convert password to buffer
      const encoder = new TextEncoder();
      const passwordBuffer = encoder.encode(password);
      
      // Import password as key
      const passwordKey = await crypto.subtle.importKey(
        'raw',
        passwordBuffer,
        { name: 'PBKDF2' },
        false,
        ['deriveBits']
      );
      
      // Derive with same parameters
      const derivedBits = await crypto.subtle.deriveBits(
        {
          name: 'PBKDF2',
          salt: salt,
          iterations: storedHash.iterations,
          hash: 'SHA-256'
        },
        passwordKey,
        256
      );
      
      // Convert to hex
      const hashArray = Array.from(new Uint8Array(derivedBits));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      // Compare hashes
      return hashHex === storedHash.hash;
    }
    
    return false;
  } catch (err) {
    console.error('Fallback verification failed:', err);
    return false;
  }
};

/**
 * Generate a secure random temporary password
 * @returns {string} A random password
 */
export const generateTempPassword = () => {
  // Exclude similar-looking characters: 0, O, 1, l, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789';
  let result = '';
  
  // Create a password between 10-12 characters
  const length = Math.floor(Math.random() * 3) + 10;
  
  // Generate cryptographically secure random values
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  // Map random values to characters
  for (let i = 0; i < length; i++) {
    result += chars.charAt(randomValues[i] % chars.length);
  }
  
  return result;
};

/**
 * Check if a password is temporary
 * @param {object} passwordSettings - The password settings object
 * @returns {boolean} Whether the password is temporary
 */
export const isTemporaryPassword = (passwordSettings) => {
  return typeof passwordSettings === 'object' && passwordSettings.isTemporary === true;
};
