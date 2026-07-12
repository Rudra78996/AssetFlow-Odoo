import bcrypt from "bcryptjs";
import { config } from "./config";

// bcryptjs (pure-JS) chosen over native bcrypt/argon2 so the repo installs and
// runs identically across dev machines, CI, and Docker with zero native-build
// friction. Cost factor 12 per the security requirements. Documented in README.
export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, config.bcryptRounds);
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// Refresh tokens are stored only as hashes so a DB leak cannot be replayed.
export function hashToken(token: string): Promise<string> {
  return bcrypt.hash(token, 10);
}

export function verifyToken(token: string, hash: string): Promise<boolean> {
  return bcrypt.compare(token, hash);
}
