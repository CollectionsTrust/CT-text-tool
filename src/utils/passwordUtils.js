// src/utils/passwordUtils.js - PBKDF2 implementation using Web Crypto API

/**
 * Hash a password using PBKDF2 with Web Crypto API
 * @param {string} password - The password to hash
 * @returns {Promise<object>} - Object containing the hash and parameters
 */
export const hashPassword = async (password) => {
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
    
    // Derive key with PBKDF2 - high iteration count for security
    const iterations = 600000; // OWASP recommended minimum as of 2023
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
    console.error('Error hashing password:', err);
    throw err;
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
    
    // Handle PBKDF2 hash
    if (typeof storedHash === 'object' && storedHash.type === 'pbkdf2') {
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
      
      // Compare hashes in constant time to prevent timing attacks
      return constantTimeEquals(hashHex, storedHash.hash);
    }
    
    return false;
  } catch (err) {
    console.error('Error verifying password:', err);
    return false;
  }
};

/**
 * Constant-time string comparison to prevent timing attacks
 * @param {string} a - First string
 * @param {string} b - Second string
 * @returns {boolean} - True if strings are equal
 */
const constantTimeEquals = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  
  let result = 0;
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  
  return result === 0;
};

/**
 * Generate a secure random temporary password
 * @returns {string} A random password
 */
export const generateTempPassword = () => {
  // Exclude similar-looking characters: 0, O, 1, l, I
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz23456789!@#$%^&*';
  let result = '';
  
  // Create a password between 12-14 characters for better security
  const length = Math.floor(Math.random() * 3) + 12;
  
  // Generate cryptographically secure random values
  const randomValues = new Uint8Array(length);
  window.crypto.getRandomValues(randomValues);
  
  // Ensure we have at least one number, one letter, and one special char
  let hasNumber = false;
  let hasLetter = false;
  let hasSpecial = false;
  
  // Map random values to characters
  for (let i = 0; i < length; i++) {
    const char = chars.charAt(randomValues[i] % chars.length);
    result += char;
    
    // Track character types
    if (char.match(/[0-9]/)) hasNumber = true;
    if (char.match(/[a-zA-Z]/)) hasLetter = true;
    if (char.match(/[!@#$%^&*]/)) hasSpecial = true;
  }
  
  // If missing any required character type, replace last characters
  const replacements = [];
  if (!hasNumber) replacements.push('23456789'[Math.floor(Math.random() * 8)]);
  if (!hasLetter) replacements.push('ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnopqrstuvwxyz'[Math.floor(Math.random() * 51)]);
  if (!hasSpecial) replacements.push('!@#$%^&*'[Math.floor(Math.random() * 8)]);
  
  // Apply replacements to last positions
  let resultArray = result.split('');
  for (let i = 0; i < replacements.length; i++) {
    resultArray[resultArray.length - 1 - i] = replacements[i];
  }
  
  return resultArray.join('');
};

/**
 * Check if a password is temporary
 * @param {object} passwordSettings - The password settings object
 * @returns {boolean} Whether the password is temporary
 */
export const isTemporaryPassword = (passwordSettings) => {
  return typeof passwordSettings === 'object' && passwordSettings.isTemporary === true;
};

/**
 * Validate password strength
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePasswordStrength = (password) => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }
  
  if (!hasLetter) {
    return {
      isValid: false,
      message: 'Password must contain at least one letter'
    };
  }
  
  if (!hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  // Optional: require special character for stronger passwords
  // if (!hasSpecial) {
  //   return {
  //     isValid: false,
  //     message: 'Password must contain at least one special character'
  //   };
  // }
  
  return {
    isValid: true,
    message: 'Password is strong'
  };
};
