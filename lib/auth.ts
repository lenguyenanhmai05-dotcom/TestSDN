import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";

const AUTH_SECRET = process.env.AUTH_SECRET || "default_auth_secret_sdn302_fall2026";
export const SESSION_COOKIE_NAME = "session_token";

export interface SessionUser {
  userId: string;
  email: string;
}

export function signToken(user: SessionUser): string {
  return jwt.sign(user, AUTH_SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, AUTH_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function getSessionFromCookieHeader(cookieHeader?: string | null): SessionUser | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(new RegExp(`(?:^|; )${SESSION_COOKIE_NAME}=([^;]*)`));
  if (!match || !match[1]) return null;
  const token = decodeURIComponent(match[1]);
  return verifyToken(token);
}

export async function getSession(): Promise<SessionUser | null> {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!token) return null;
    return verifyToken(token);
  } catch {
    return null;
  }
}
