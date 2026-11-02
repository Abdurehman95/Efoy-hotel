/**
 * Utility functions for validating and formatting phone numbers
 * according to Chapa's official developer documentation.
 *
 * Chapa specification:
 * "Phone number is not required, but if you pass phone_number, it must be 10 digits,
 * so it should be in 09xxxxxxxx or 07xxxxxxxx format."
 */

export const formatChapaPhone = (phone) => {
  if (!phone || typeof phone !== 'string') return null;
  
  // Strip all non-digit characters
  let digits = phone.trim().replace(/\D/g, '');
  
  // Format international +251 (e.g. 251912345678 -> 0912345678)
  if (digits.startsWith('251') && digits.length === 12) {
    digits = '0' + digits.slice(3);
  }
  
  // Format local without leading zero (e.g. 912345678 -> 0912345678)
  if ((digits.startsWith('9') || digits.startsWith('7')) && digits.length === 9) {
    digits = '0' + digits;
  }
  
  // Validates exactly 10 digits starting with 09 or 07
  if (/^0[79]\d{8}$/.test(digits)) {
    return digits;
  }
  
  return null;
};

export const isValidChapaPhone = (phone) => {
  return Boolean(formatChapaPhone(phone));
};
