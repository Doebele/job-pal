// ==============================================================================
// Auth Service — JWT & Password Operations
// ==============================================================================

import jwt from 'jsonwebtoken';
import { config } from '../config';
import { generateToken, hashPassword, verifyPassword } from '../lib/crypto';

export interface JwtPayload {
  userId: string;
  email: string;
  role: string;
}

export function createToken(payload: JwtPayload): string {
  return jwt.sign(payload, config.JWT_SECRET, {
    expiresIn: config.JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, config.JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

export function hashRegistrationPassword(password: string): Promise<string> {
  return hashPassword(password);
}

export function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return verifyPassword(password, hash);
}

export function generateResetToken(): string {
  return generateToken();
}
