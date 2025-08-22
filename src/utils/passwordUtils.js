/**
 * Validate password
 * @param {string} password - The password to validate
 * @returns {object} - Validation result with isValid and message
 */
export const validatePassword = (password) => {
  const minLength = 8;
  const hasNumber = /\d/.test(password);
  const hasLowerCaseLetter = /[a-z]/.test(password);
  const hasUpperCaseLetter = /[A-Z]/.test(password);
  
  if (password.length < minLength) {
    return {
      isValid: false,
      message: `Password must be at least ${minLength} characters long`
    };
  }

  if (!hasUpperCaseLetter) {
    return {
      isValid: false,
      message: 'Password must contain at least one upper case letter'
    };
  }
  
  if (!hasLowerCaseLetter) {
    return {
      isValid: false,
      message: 'Password must contain at least one lower case letter'
    };
  }
  
  if (!hasNumber) {
    return {
      isValid: false,
      message: 'Password must contain at least one number'
    };
  }
  
  return {
    isValid: true,
    message: 'Password is strong'
  };
};
