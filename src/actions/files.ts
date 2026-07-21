// ============================================================
// Rainbow-box - Server Actions for Files
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { renameFileSchema, deleteFilesSchema, AppError } from "@/lib/validations";
import { logOperation, sanitizeFilename } from "@/lib/security";
import type { ApiResponse, FileItem, PaginatedResult, RainbowColor } from "@/types";
import { getFileExtension } from "@/lib/utils";

/**
 * Get files with pagination and filtering
 */
export async function getFiles(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  categoryId?: string;
  sortBy?: "name" | "size" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
  includeDeleted?: boolean;
}): Promise<ApiResponse<PaginatedResult<FileItem>>> {
  try {
    const userId = await requireAuth();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 20;
    const skip = (page - 1) * pageSize;

    const where: Record<string, unknown> = {
      userId,
      isDeleted: params.includeDeleted ?? false,
    };

    if (params.search) {
      where.name = { contains: params.search };
    }
    if (params.categoryId) {
      where.categoryId = params.categoryId;
    }

    const orderByField = params.sortBy ?? "createdAt";
    const orderByDir = params.sortOrder ?? "desc";

    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: { [orderByField]: orderByDir },
        skip,
        take: pageSize,
        include: {
          category: true,
        },
      }),
      prisma.file.count({ where }),
    ]);

    const items: FileItem[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      originalName: f.originalName,
      extension: f.extension,
      mimeType: f.mimeType,
      size: f.size,
      path: f.path,
      thumbnailPath: f.thumbnailPath,
      categoryId: f.categoryId,
      category: f.category
        ? {
            id: f.category.id,
            name: f.category.name,
            color: f.category.color as RainbowColor,
            icon: f.category.icon,
            description: f.category.description,
            sortOrder: f.category.sortOrder,
            fileCount: 0,
            createdAt: f.category.createdAt,
            updatedAt: f.category.updatedAt,
          }
        : null,
      isFavorite: f.isFavorite,
      isDeleted: f.isDeleted,
      deletedAt: f.deletedAt,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return {
      success: true,
      data: {
        items,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getFiles]", error);
    return { success: false, error: "获取文件列表失败" };
  }
}

/**
 * Upload a file
 */
export async function uploadFile(
  formData: FormData,
): Promise<ApiResponse<FileItem>> {
  try {
    const userId = await requireAuth();
    const file = formData.get("file") as File | null;
    const categoryId = formData.get("categoryId") as string | null;

    if (!file) {
      throw new AppError("请选择文件", 400);
    }

    const maxSize = Number(process.env.MAX_FILE_SIZE ?? 104857600);
    if (file.size > maxSize) {
      throw new AppError("文件大小超过限制", 400);
    }

    const originalName = sanitizeFilename(file.name);
    const extension = getFileExtension(originalName);
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
    const buffer = Buffer.from(await file.arrayBuffer());

    const fs = await import("fs/promises");
    const path = await import("path");
    const dateStr = new Date().toISOString().slice(0, 10);
    const dirPath = path.resolve(process.cwd(), uploadDir, "files", dateStr);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(path.join(dirPath, fileName), buffer);

    const filePath = `/uploads/files/${dateStr}/${fileName}`;

    const created = await prisma.file.create({
      data: {
        name: originalName,
        originalName,
        extension,
        mimeType: file.type,
        size: file.size,
        path: filePath,
        categoryId: categoryId || null,
        userId,
      },
      include: { category: true },
    });

    await logOperation({
      userId,
      operation: "UPLOAD",
      targetType: "file",
      targetId: created.id,
      detail: `上传文件：${originalName}`,
    });

    return {
      success: true,
      data: {
        id: created.id,
        name: created.name,
        originalName: created.originalName,
        extension: created.extension,
        mimeType: created.mimeType,
        size: created.size,
        path: created.path,
        thumbnailPath: created.thumbnailPath,
        categoryId: created.categoryId,
        category: created.category
          ? {
              id: created.category.id,
              name: created.category.name,
              color: created.category.color as RainbowColor,
              icon: created.category.icon,
              description: created.category.description,
              sortOrder: created.category.sortOrder,
              fileCount: 0,
              createdAt: created.category.createdAt,
              updatedAt: created.category.updatedAt,
            }
          : null,
        isFavorite: created.isFavorite,
        isDeleted: created.isDeleted,
        deletedAt: created.deletedAt,
        createdAt: created.createdAt,
        updatedAt: created.updatedAt,
      },
      message: "文件上传成功",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[uploadFile]", error);
    return { success: false, error: "文件上传失败" };
  }
}

/**
 * Rename a file
 */
export async function renameFile(
  fileId: string,
  input: unknown,
): Promise<ApiResponse<FileItem>> {
  try {
    const userId = await requireAuth();
    const { name } = renameFileSchema.parse(input);

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });
    if (!file) throw new AppError("文件不存在", 404);

    const extension = getFileExtension(name);
    const updated = await prisma.file.update({
      where: { id: fileId },
      data: { name, extension: extension || file.extension },
      include: { category: true },
    });

    await logOperation({
      userId,
      operation: "RENAME",
      targetType: "file",
      targetId: fileId,
      detail: `重命名：${file.name} → ${name}`,
    });

    return { success: true, data: updated as unknown as FileItem, message: "文件已重命名" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[renameFile]", error);
    return { success: false, error: "重命名失败" };
  }
}

/**
 * Move files to a category
 */
export async function moveFiles(
  fileIds: string[],
  categoryId: string | null,
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    await prisma.file.updateMany({
      where: { id: { in: fileIds }, userId },
      data: { categoryId },
    });

    await logOperation({
      userId,
      operation: "MOVE",
      targetType: "file",
      targetId: fileIds.join(","),
      detail: `移动 ${fileIds.length} 个文件`,
    });

    return { success: true, message: "文件已移动" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[moveFiles]", error);
    return { success: false, error: "移动文件失败" };
  }
}

/**
 * Soft delete files (move to recycle bin)
 */
export async function deleteFiles(
  fileIds: string[],
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    const now = new Date();
    const expiresAt = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

    await prisma.$transaction(async (tx) => {
      for (const fileId of fileIds) {
        const file = await tx.file.findFirst({
          where: { id: fileId, userId },
        });
        if (!file) continue;

        await tx.file.update({
          where: { id: fileId },
          data: { isDeleted: true, deletedAt: now },
        });

        await tx.recycleBin.upsert({
          where: { fileId },
          update: { deletedAt: now, expiresAt },
          create: {
            fileId,
            userId,
            originalPath: file.path,
            expiresAt,
          },
        });
      }
    });

    await logOperation({
      userId,
      operation: "DELETE",
      targetType: "file",
      targetId: fileIds.join(","),
      detail: `删除 ${fileIds.length} 个文件`,
    });

    return { success: true, message: "文件已移至回收站" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[deleteFiles]", error);
    return { success: false, error: "删除文件失败" };
  }
}

/**
 * Restore files from recycle bin
 */
export async function restoreFiles(
  fileIds: string[],
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    await prisma.$transaction(async (tx) => {
      await tx.file.updateMany({
        where: { id: { in: fileIds }, userId },
        data: { isDeleted: false, deletedAt: null },
      });

      await tx.recycleBin.deleteMany({
        where: { fileId: { in: fileIds }, userId },
      });
    });

    await logOperation({
      userId,
      operation: "RESTORE",
      targetType: "file",
      targetId: fileIds.join(","),
      detail: `恢复 ${fileIds.length} 个文件`,
    });

    return { success: true, message: "文件已恢复" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[restoreFiles]", error);
    return { success: false, error: "恢复文件失败" };
  }
}

/**
 * Permanently delete files
 */
export async function permanentlyDeleteFiles(
  fileIds: string[],
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    const files = await prisma.file.findMany({
      where: { id: { in: fileIds }, userId, isDeleted: true },
    });

    const fs = await import("fs/promises");
    const path = await import("path");

    for (const file of files) {
      const filePath = path.resolve(process.cwd(), "public", file.path);
      try { await fs.unlink(filePath); } catch { /* file may not exist */ }
    }

    await prisma.$transaction(async (tx) => {
      await tx.recycleBin.deleteMany({
        where: { fileId: { in: fileIds }, userId },
      });
      await tx.file.deleteMany({
        where: { id: { in: fileIds }, userId },
      });
    });

    await logOperation({
      userId,
      operation: "PERMANENT_DELETE",
      targetType: "file",
      targetId: fileIds.join(","),
      detail: `永久删除 ${fileIds.length} 个文件`,
    });

    return { success: true, message: "文件已永久删除" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[permanentlyDeleteFiles]", error);
    return { success: false, error: "永久删除失败" };
  }
}

/**
 * Toggle favorite for a file
 */
export async function toggleFavorite(
  fileId: string,
): Promise<ApiResponse<{ isFavorite: boolean }>> {
  try {
    const userId = await requireAuth();

    const file = await prisma.file.findFirst({
      where: { id: fileId, userId },
    });
    if (!file) throw new AppError("文件不存在", 404);

    const updated = await prisma.file.update({
      where: { id: fileId },
      data: { isFavorite: !file.isFavorite },
    });

    if (updated.isFavorite) {
      await prisma.favorite.upsert({
        where: { userId_fileId: { userId, fileId } },
        create: { userId, fileId },
        update: {},
      });
    } else {
      await prisma.favorite.deleteMany({
        where: { userId, fileId },
      });
    }

    await logOperation({
      userId,
      operation: updated.isFavorite ? "FAVORITE" : "UNFAVORITE",
      targetType: "file",
      targetId: fileId,
    });

    return {
      success: true,
      data: { isFavorite: updated.isFavorite },
      message: updated.isFavorite ? "已收藏" : "已取消收藏",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[toggleFavorite]", error);
    return { success: false, error: "操作失败" };
  }
}

/**
 * Get recycle bin items
 */
export async function getRecycleBin(): Promise<ApiResponse<FileItem[]>> {
  try {
    const userId = await requireAuth();

    const items = await prisma.recycleBin.findMany({
      where: { userId },
      include: {
        file: { include: { category: true } },
      },
      orderBy: { deletedAt: "desc" },
    });

    const data: FileItem[] = items.map((item) => ({
      id: item.file.id,
      name: item.file.name,
      originalName: item.file.originalName,
      extension: item.file.extension,
      mimeType: item.file.mimeType,
      size: item.file.size,
      path: item.file.path,
      thumbnailPath: item.file.thumbnailPath,
      categoryId: item.file.categoryId,
      category: item.file.category ? {
        id: item.file.category.id,
        name: item.file.category.name,
        color: item.file.category.color as RainbowColor,
        icon: item.file.category.icon,
        description: item.file.category.description,
        sortOrder: item.file.category.sortOrder,
        fileCount: 0,
        createdAt: item.file.category.createdAt,
        updatedAt: item.file.category.updatedAt,
      } : null,
      isFavorite: item.file.isFavorite,
      isDeleted: item.file.isDeleted,
      deletedAt: item.file.deletedAt,
      createdAt: item.file.createdAt,
      updatedAt: item.file.updatedAt,
    }));

    return { success: true, data };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[getRecycleBin]", error);
    return { success: false, error: "获取回收站失败" };
  }
}

/**
 * Get favorites
 */
export async function getFavorites(): Promise<ApiResponse<FileItem[]>> {
  try {
    const userId = await requireAuth();

    const favorites = await prisma.favorite.findMany({
      where: { userId },
      include: {
        file: { include: { category: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    const data: FileItem[] = favorites.map((fav) => ({
      id: fav.file.id,
      name: fav.file.name,
      originalName: fav.file.originalName,
      extension: fav.file.extension,
      mimeType: fav.file.mimeType,
      size: fav.file.size,
      path: fav.file.path,
      thumbnailPath: fav.file.thumbnailPath,
      categoryId: fav.file.categoryId,
      category: fav.file.category ? {
        id: fav.file.category.id,
        name: fav.file.category.name,
        color: fav.file.category.color as RainbowColor,
        icon: fav.file.category.icon,
        description: fav.file.category.description,
        sortOrder: fav.file.category.sortOrder,
        fileCount: 0,
        createdAt: fav.file.category.createdAt,
        updatedAt: fav.file.category.updatedAt,
      } : null,
      isFavorite: true,
      isDeleted: fav.file.isDeleted,
      deletedAt: fav.file.deletedAt,
      createdAt: fav.file.createdAt,
      updatedAt: fav.file.updatedAt,
    }));

    return { success: true, data };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[getFavorites]", error);
    return { success: false, error: "获取收藏失败" };
  }
}

/**
 * Get recent files
 */
export async function getRecentFiles(
  limit: number = 20,
): Promise<ApiResponse<FileItem[]>> {
  try {
    const userId = await requireAuth();

    const files = await prisma.file.findMany({
      where: { userId, isDeleted: false },
      orderBy: { updatedAt: "desc" },
      take: limit,
      include: { category: true },
    });

    const data: FileItem[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      originalName: f.originalName,
      extension: f.extension,
      mimeType: f.mimeType,
      size: f.size,
      path: f.path,
      thumbnailPath: f.thumbnailPath,
      categoryId: f.categoryId,
      category: f.category ? {
        id: f.category.id,
        name: f.category.name,
        color: f.category.color as RainbowColor,
        icon: f.category.icon,
        description: f.category.description,
        sortOrder: f.category.sortOrder,
        fileCount: 0,
        createdAt: f.category.createdAt,
        updatedAt: f.category.updatedAt,
      } : null,
      isFavorite: f.isFavorite,
      isDeleted: f.isDeleted,
      deletedAt: f.deletedAt,
      createdAt: f.createdAt,
      updatedAt: f.updatedAt,
    }));

    return { success: true, data };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[getRecentFiles]", error);
    return { success: false, error: "获取最近文件失败" };
  }
}
