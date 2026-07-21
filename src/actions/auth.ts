// ============================================================
// Rainbow-box - Server Actions for Auth
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  verifyPassword,
  createSession,
  setSessionCookie,
  clearSessionCookie,
  getCurrentSession,
  invalidateSession,
} from "@/lib/auth";
import { loginSchema, registerSchema, AppError } from "@/lib/validations";
import type { ApiResponse, AuthSession } from "@/types";

/**
 * Register a new user
 */
export async function registerUser(
  input: unknown,
): Promise<ApiResponse<AuthSession>> {
  try {
    const { name, email, password } = registerSchema.parse(input);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      throw new AppError("该邮箱已被注册", 409);
    }

    const hashedPassword = await hashPassword(password);
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
    });

    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      message: "注册成功",
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    console.error("[registerUser]", error);
    return { success: false, error: "注册失败，请稍后重试" };
  }
}

/**
 * Login with email and password
 */
export async function loginUser(
  input: unknown,
): Promise<ApiResponse<AuthSession>> {
  try {
    const { email, password } = loginSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.password) {
      throw new AppError("邮箱或密码错误", 401);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new AppError("邮箱或密码错误", 401);
    }

    const sessionId = await createSession(user.id);
    await setSessionCookie(sessionId);

    return {
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        },
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
      message: "登录成功",
    };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    console.error("[loginUser]", error);
    return { success: false, error: "登录失败，请稍后重试" };
  }
}

/**
 * Logout current user
 */
export async function logoutUser(): Promise<ApiResponse> {
  try {
    await invalidateSession();
    await clearSessionCookie();
    return { success: true, message: "已退出登录" };
  } catch (error) {
    console.error("[logoutUser]", error);
    return { success: false, error: "退出登录失败" };
  }
}

/**
 * Get current session
 */
export async function getSession(): Promise<ApiResponse<AuthSession | null>> {
  try {
    const session = await getCurrentSession();
    return { success: true, data: session };
  } catch (error) {
    console.error("[getSession]", error);
    return { success: false, error: "获取会话信息失败" };
  }
}
