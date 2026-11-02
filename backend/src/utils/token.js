import 'dotenv/config';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('SECURITY FATAL: JWT_SECRET environment variable is missing in production .env configuration.');
  } else {
    console.warn('⚠️ [Security Notice]: JWT_SECRET is not configured in .env. Using development fallback key.');
  }
}

const secretKey = JWT_SECRET || 'efoy_hotel_dev_insecure_fallback_secret_key_2026';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

export const signToken = (payload) => {
  return jwt.sign(payload, secretKey, { expiresIn: JWT_EXPIRES_IN });
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, secretKey);
  } catch {
    return null;
  }
};

export default {
  signToken,
  verifyToken,
};
