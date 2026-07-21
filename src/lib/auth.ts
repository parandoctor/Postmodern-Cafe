import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { prisma } from "@/lib/prisma";
import type { AuthSession } from "@/types";

const SESSION_COOKIE_NAME = "rainbow_session";
const SESSION_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

/**
 * Hash a password with bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

/**
 * Verify a password against a hash
 */
export async function verifyPassword(
  password: string,
  hash: string,
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

/**
 * Create a new session for a user
 */
export async function createSession(userId: string): Promise<string> {
  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
  const session = await prisma.session.create({
    data: {
      userId,
      expiresAt,
    },
  });
  return session.id;
}

/**
 * Set the session cookie
 */
export async function setSessionCookie(sessionId: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE / 1000,
    path: "/",
  });
}

/**
 * Clear the session cookie
 */
export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Get the current session from the cookie
 */
export async function getCurrentSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
    if (!sessionId) return null;

    const session = await prisma.session.findUnique({
      where: { id: sessionId },
      include: { user: true },
    });

    if (!session || session.expiresAt < new Date()) {
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return {
      user: {
        id: session.user.id,
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
      },
      expiresAt: session.expiresAt,
    };
  } catch {
    return null;
  }
}

/**
 * Get the current authenticated user ID
 */
export async function getCurrentUserId(): Promise<string | null> {
  const session = await getCurrentSession();
  return session?.user.id ?? null;
}

/**
 * Require authentication - throws if not authenticated
 */
export async function requireAuth(): Promise<string> {
  const userId = await getCurrentUserId();
  if (!userId) {
    throw new Error("UNAUTHORIZED");
  }
  return userId;
}

/**
 * Extend session expiry
 */
export async function touchSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (!sessionId) return;

  const expiresAt = new Date(Date.now() + SESSION_MAX_AGE);
  await prisma.session.update({
    where: { id: sessionId },
    data: { expiresAt },
  });

  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_MAX_AGE / 1000,
    path: "/",
  });
}

/**
 * Invalidate a specific session
 */
export async function invalidateSession(): Promise<void> {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_NAME)?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { id: sessionId } });
  }
  cookieStore.delete(SESSION_COOKIE_NAME);
}

/**
 * Invalidate all sessions for a user
 */
export async function invalidateAllUserSessions(userId: string): Promise<void> {
  await prisma.session.deleteMany({ where: { userId } });
}
