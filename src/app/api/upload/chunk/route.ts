// ============================================================
// Chunked Upload API Route
// Supports: init, chunk, complete, status
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeFilename } from "@/lib/security";
import { logOperation } from "@/lib/security";
import { getFileExtension } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";
import { existsSync } from "fs";

const CHUNKS_DIR = path.resolve(process.cwd(), "public/uploads/chunks");

type ChunkMeta = {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  totalChunks: number;
  chunkSize: number;
  uploadedChunks: number[];
  categoryId: string | null;
  userId: string;
  createdAt: string;
};

async function readMeta(sessionId: string): Promise<ChunkMeta | null> {
  try {
    const metaPath = path.join(CHUNKS_DIR, sessionId, "meta.json");
    const raw = await fs.readFile(metaPath, "utf-8");
    return JSON.parse(raw) as ChunkMeta;
  } catch {
    return null;
  }
}

async function writeMeta(sessionId: string, meta: ChunkMeta): Promise<void> {
  const dir = path.join(CHUNKS_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
}

// POST — handles init, chunk, complete
export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const formData = await req.formData();
    const action = formData.get("action") as string;

    if (action === "init") {
      return handleInit(formData, userId);
    } else if (action === "chunk") {
      return handleChunk(formData, userId);
    } else if (action === "complete") {
      return handleComplete(formData, userId);
    } else {
      return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 });
    }
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }
    console.error("[chunk-upload]", error);
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 });
  }
}

// GET — check upload session status
export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) {
      return NextResponse.json({ success: false, error: "缺少 sessionId" }, { status: 400 });
    }

    const meta = await readMeta(sessionId);
    if (!meta) {
      return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
    }
    if (meta.userId !== userId) {
      return NextResponse.json({ success: false, error: "无权访问" }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      data: {
        fileName: meta.originalName,
        totalChunks: meta.totalChunks,
        uploadedChunks: meta.uploadedChunks,
        uploadedCount: meta.uploadedChunks.length,
        isComplete: meta.uploadedChunks.length === meta.totalChunks,
      },
    });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    }
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}

// ---- Handlers ----

async function handleInit(formData: FormData, userId: string) {
  const fileName = formData.get("fileName") as string;
  const fileSize = parseInt(formData.get("fileSize") as string);
  const mimeType = formData.get("mimeType") as string;
  const totalChunks = parseInt(formData.get("totalChunks") as string);
  const chunkSize = parseInt(formData.get("chunkSize") as string);
  const categoryId = (formData.get("categoryId") as string) || null;

  if (!fileName || !fileSize || !mimeType || !totalChunks || !chunkSize) {
    return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  }

  const maxSize = Number(process.env.MAX_FILE_SIZE ?? 104857600);
  if (fileSize > maxSize) {
    return NextResponse.json({ success: false, error: "文件大小超过限制" }, { status: 400 });
  }

  const sessionId = `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const sanitized = sanitizeFilename(fileName);

  const meta: ChunkMeta = {
    fileName: sanitized,
    originalName: sanitized,
    mimeType,
    fileSize,
    totalChunks,
    chunkSize,
    uploadedChunks: [],
    categoryId,
    userId,
    createdAt: new Date().toISOString(),
  };

  await writeMeta(sessionId, meta);

  return NextResponse.json({
    success: true,
    data: { sessionId },
  });
}

async function handleChunk(formData: FormData, userId: string) {
  const sessionId = formData.get("sessionId") as string;
  const chunkIndex = parseInt(formData.get("chunkIndex") as string);
  const chunk = formData.get("chunk") as File | null;

  if (!sessionId || isNaN(chunkIndex) || !chunk) {
    return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  }

  const meta = await readMeta(sessionId);
  if (!meta) {
    return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
  }
  if (meta.userId !== userId) {
    return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
  }
  if (chunkIndex < 0 || chunkIndex >= meta.totalChunks) {
    return NextResponse.json({ success: false, error: "分片索引无效" }, { status: 400 });
  }

  // Save chunk
  const dir = path.join(CHUNKS_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  const chunkPath = path.join(dir, `chunk-${chunkIndex}.part`);
  const buffer = Buffer.from(await chunk.arrayBuffer());
  await fs.writeFile(chunkPath, buffer);

  // Update meta
  if (!meta.uploadedChunks.includes(chunkIndex)) {
    meta.uploadedChunks.push(chunkIndex);
    meta.uploadedChunks.sort((a, b) => a - b);
  }
  await writeMeta(sessionId, meta);

  return NextResponse.json({
    success: true,
    data: {
      chunkIndex,
      uploadedCount: meta.uploadedChunks.length,
      totalChunks: meta.totalChunks,
    },
  });
}

async function handleComplete(formData: FormData, userId: string) {
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) {
    return NextResponse.json({ success: false, error: "缺少 sessionId" }, { status: 400 });
  }

  const meta = await readMeta(sessionId);
  if (!meta) {
    return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
  }
  if (meta.userId !== userId) {
    return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
  }

  // Verify all chunks present
  const dir = path.join(CHUNKS_DIR, sessionId);
  for (let i = 0; i < meta.totalChunks; i++) {
    if (!meta.uploadedChunks.includes(i)) {
      return NextResponse.json({
        success: false,
        error: `缺少分片 ${i + 1}/${meta.totalChunks}`,
      }, { status: 400 });
    }
  }

  // Assemble file
  const extension = getFileExtension(meta.originalName);
  const finalName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
  const dateStr = new Date().toISOString().slice(0, 10);
  const filesDir = path.resolve(process.cwd(), uploadDir, "files", dateStr);
  await fs.mkdir(filesDir, { recursive: true });

  const destPath = path.join(filesDir, finalName);
  const writeStream = (await import("fs")).createWriteStream(destPath);

  for (let i = 0; i < meta.totalChunks; i++) {
    const chunkPath = path.join(dir, `chunk-${i}.part`);
    const chunkData = await fs.readFile(chunkPath);
    writeStream.write(chunkData);
  }

  await new Promise<void>((resolve, reject) => {
    writeStream.end((err: Error | null) => {
      if (err) reject(err);
      else resolve();
    });
  });

  const filePath = `/uploads/files/${dateStr}/${finalName}`;

  // Cleanup chunks
  try {
    await fs.rm(dir, { recursive: true, force: true });
  } catch {
    // best-effort cleanup
  }

  // Create DB record
  const created = await prisma.file.create({
    data: {
      name: meta.originalName,
      originalName: meta.originalName,
      extension,
      mimeType: meta.mimeType,
      size: meta.fileSize,
      path: filePath,
      categoryId: meta.categoryId,
      userId,
    },
    include: { category: true },
  });

  await logOperation({
    userId,
    operation: "UPLOAD",
    targetType: "file",
    targetId: created.id,
    detail: `分片上传文件：${meta.originalName}`,
  });

  return NextResponse.json({
    success: true,
    data: {
      id: created.id,
      name: created.name,
      originalName: created.originalName,
      extension: created.extension,
      mimeType: created.mimeType,
      size: created.size,
      path: created.path,
      categoryId: created.categoryId,
      category: created.category
        ? {
            id: created.category.id,
            name: created.category.name,
            color: created.category.color,
            icon: created.category.icon,
            description: created.category.description,
            sortOrder: created.category.sortOrder,
            fileCount: 0,
            createdAt: created.category.createdAt,
            updatedAt: created.category.updatedAt,
          }
        : null,
      isFavorite: false,
      isDeleted: false,
      deletedAt: null,
      createdAt: created.createdAt,
      updatedAt: created.updatedAt,
    },
    message: "分片上传完成",
  });
}
