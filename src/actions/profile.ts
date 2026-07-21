// ============================================================
// Rainbow-box - Server Actions for User Profile
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth, verifyPassword, hashPassword } from "@/lib/auth";
import {
  updateProfileSchema,
  updateEmailSchema,
  updatePasswordSchema,
  AppError,
} from "@/lib/validations";
import type { ApiResponse, UserProfile } from "@/types";

/**
 * Get current user profile
 */
export async function getProfile(): Promise<ApiResponse<UserProfile>> {
  try {
    const userId = await requireAuth();

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new AppError("用户不存在", 404);
    }

    return { success: true, data: user };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getProfile]", error);
    return { success: false, error: "获取用户信息失败" };
  }
}

/**
 * Update profile (name, bio)
 */
export async function updateProfile(
  input: unknown,
): Promise<ApiResponse<UserProfile>> {
  try {
    const userId = await requireAuth();
    const data = updateProfileSchema.parse(input);

    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio }),
      },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: user, message: "个人资料已更新" };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[updateProfile]", error);
    return { success: false, error: "更新失败" };
  }
}

/**
 * Update email
 */
export async function updateEmail(
  input: unknown,
): Promise<ApiResponse<UserProfile>> {
  try {
    const userId = await requireAuth();
    const { email, password } = updateEmailSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new AppError("用户不存在", 404);
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      throw new AppError("密码错误", 401);
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing && existing.id !== userId) {
      throw new AppError("该邮箱已被使用", 409);
    }

    const updated = await prisma.user.update({
      where: { id: userId },
      data: { email },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        bio: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return { success: true, data: updated, message: "邮箱已更新" };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[updateEmail]", error);
    return { success: false, error: "更新邮箱失败" };
  }
}

/**
 * Update password
 */
export async function updatePassword(
  input: unknown,
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();
    const { currentPassword, newPassword } = updatePasswordSchema.parse(input);

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.password) {
      throw new AppError("用户不存在", 404);
    }

    const isValid = await verifyPassword(currentPassword, user.password);
    if (!isValid) {
      throw new AppError("当前密码错误", 401);
    }

    const hashedPassword = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: "密码已更新" };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[updatePassword]", error);
    return { success: false, error: "更新密码失败" };
  }
}

/**
 * Update avatar
 */
export async function updateAvatar(
  formData: FormData,
): Promise<ApiResponse<{ image: string }>> {
  try {
    const userId = await requireAuth();
    const file = formData.get("avatar") as File | null;

    if (!file) {
      throw new AppError("请选择头像文件", 400);
    }

    if (!file.type.startsWith("image/")) {
      throw new AppError("仅支持图片格式", 400);
    }

    if (file.size > 5 * 1024 * 1024) {
      throw new AppError("头像文件不能超过 5MB", 400);
    }

    // Save to local uploads directory
    const ext = file.name.split(".").pop() ?? "png";
    const fileName = `avatar-${userId}-${Date.now()}.${ext}`;
    const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
    const buffer = Buffer.from(await file.arrayBuffer());

    // In production, this should use a proper file system or object storage
    const fs = await import("fs/promises");
    const path = await import("path");
    const dirPath = path.resolve(process.cwd(), uploadDir, "avatars");
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(path.join(dirPath, fileName), buffer);

    const imagePath = `/uploads/avatars/${fileName}`;

    await prisma.user.update({
      where: { id: userId },
      data: { image: imagePath },
    });

    return { success: true, data: { image: imagePath }, message: "头像已更新" };
  } catch (error) {
    if (error instanceof AppError) {
      return { success: false, error: error.message };
    }
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[updateAvatar]", error);
    return { success: false, error: "更新头像失败" };
  }
}
