"use server";

import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { AppError } from "@/lib/validations";
import { isAllowedFileType, sanitizeFilename } from "@/lib/security";
import { getFileExtension } from "@/lib/utils";
import type { ApiResponse, FileItem, PaginatedResult } from "@/types";

function toFileItem(file: {
  id: string; name: string; originalName: string; extension: string; mimeType: string;
  size: number; path: string; thumbnailPath: string | null; width: number | null;
  height: number | null; duration: number | null; createdAt: Date; updatedAt: Date;
}): FileItem {
  return {
    id: file.id, name: file.name, originalName: file.originalName, extension: file.extension,
    mimeType: file.mimeType, size: file.size, path: file.path, thumbnailPath: file.thumbnailPath,
    width: file.width, height: file.height, duration: file.duration,
    createdAt: file.createdAt, updatedAt: file.updatedAt,
  };
}

export async function getFiles(params: {
  page?: number;
  pageSize?: number;
  search?: string;
  sortBy?: "name" | "size" | "createdAt" | "updatedAt";
  sortOrder?: "asc" | "desc";
} = {}): Promise<ApiResponse<PaginatedResult<FileItem>>> {
  try {
    const userId = await requireAuth();
    const page = params.page ?? 1;
    const pageSize = params.pageSize ?? 24;
    const where = {
      userId,
      ...(params.search ? { name: { contains: params.search } } : {}),
    };
    const [files, total] = await Promise.all([
      prisma.file.findMany({
        where,
        orderBy: { [params.sortBy ?? "createdAt"]: params.sortOrder ?? "desc" },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      prisma.file.count({ where }),
    ]);
    return {
      success: true,
      data: {
        items: files.map(toFileItem), total, page, pageSize,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[getFiles]", error);
    return { success: false, error: "获取文件列表失败" };
  }
}

export async function uploadFile(formData: FormData): Promise<ApiResponse<FileItem>> {
  try {
    const userId = await requireAuth();
    const file = formData.get("file") as File | null;
    if (!file) throw new AppError("请选择文件", 400);
    if (!isAllowedFileType(file.type || "application/octet-stream")) throw new AppError("不支持的文件类型", 400);

    const maxSize = Number(process.env.MAX_FILE_SIZE ?? 104857600);
    if (file.size > maxSize) throw new AppError("文件大小超过限制", 400);

    const originalName = sanitizeFilename(file.name);
    const extension = getFileExtension(originalName);
    const storedName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
    const dateStr = new Date().toISOString().slice(0, 10);
    const dirPath = path.resolve(process.cwd(), uploadDir, "files", dateStr);
    await fs.mkdir(dirPath, { recursive: true });
    const buffer = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(dirPath, storedName), buffer);

    const created = await prisma.file.create({
      data: {
        name: originalName,
        originalName,
        extension,
        mimeType: file.type || "application/octet-stream",
        size: file.size,
        path: `/uploads/files/${dateStr}/${storedName}`,
        userId,
      },
    });
    return { success: true, data: toFileItem(created), message: "上传完成" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[uploadFile]", error);
    return { success: false, error: "上传失败" };
  }
}

export async function deleteFile(fileId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const file = await prisma.file.findFirst({ where: { id: fileId, userId } });
    if (!file) throw new AppError("文件不存在", 404);

    const uploadRoot = path.resolve(process.cwd(), "public", "uploads");
    const diskPath = path.resolve(process.cwd(), "public", file.path.replace(/^\//, ""));
    if (diskPath.startsWith(uploadRoot)) {
      await fs.unlink(diskPath).catch(() => undefined);
    }
    await prisma.file.delete({ where: { id: file.id } });
    return { success: true, message: "文件已删除" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[deleteFile]", error);
    return { success: false, error: "删除失败" };
  }
}
