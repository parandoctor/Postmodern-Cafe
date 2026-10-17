import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { isAllowedFileType, sanitizeFilename } from "@/lib/security";
import { getFileExtension } from "@/lib/utils";
import fs from "fs/promises";
import path from "path";

const CHUNKS_DIR = path.resolve(process.cwd(), "public/uploads/chunks");

type ChunkMeta = {
  fileName: string;
  originalName: string;
  mimeType: string;
  fileSize: number;
  totalChunks: number;
  chunkSize: number;
  uploadedChunks: number[];
  userId: string;
  createdAt: string;
};

async function readMeta(sessionId: string): Promise<ChunkMeta | null> {
  try {
    const raw = await fs.readFile(path.join(CHUNKS_DIR, sessionId, "meta.json"), "utf-8");
    return JSON.parse(raw) as ChunkMeta;
  } catch {
    return null;
  }
}

async function writeMeta(sessionId: string, meta: ChunkMeta) {
  const dir = path.join(CHUNKS_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, "meta.json"), JSON.stringify(meta, null, 2));
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const formData = await req.formData();
    const action = formData.get("action") as string;
    if (action === "init") return handleInit(formData, userId);
    if (action === "chunk") return handleChunk(formData, userId);
    if (action === "complete") return handleComplete(formData, userId);
    return NextResponse.json({ success: false, error: "未知操作" }, { status: 400 });
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    console.error("[chunk-upload]", error);
    return NextResponse.json({ success: false, error: "操作失败" }, { status: 500 });
  }
}

export async function GET(req: NextRequest) {
  try {
    const userId = await requireAuth();
    const sessionId = req.nextUrl.searchParams.get("sessionId");
    if (!sessionId) return NextResponse.json({ success: false, error: "缺少 sessionId" }, { status: 400 });
    const meta = await readMeta(sessionId);
    if (!meta) return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
    if (meta.userId !== userId) return NextResponse.json({ success: false, error: "无权访问" }, { status: 403 });
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
    if ((error as Error).message === "UNAUTHORIZED") return NextResponse.json({ success: false, error: "请先登录" }, { status: 401 });
    return NextResponse.json({ success: false, error: "查询失败" }, { status: 500 });
  }
}

async function handleInit(formData: FormData, userId: string) {
  const fileName = formData.get("fileName") as string;
  const fileSize = Number(formData.get("fileSize"));
  const mimeType = formData.get("mimeType") as string;
  const totalChunks = Number(formData.get("totalChunks"));
  const chunkSize = Number(formData.get("chunkSize"));
  if (!fileName || !fileSize || !mimeType || !totalChunks || !chunkSize) {
    return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  }
  if (!isAllowedFileType(mimeType)) return NextResponse.json({ success: false, error: "不支持的文件类型" }, { status: 400 });
  const maxSize = Number(process.env.MAX_FILE_SIZE ?? 104857600);
  if (fileSize > maxSize) return NextResponse.json({ success: false, error: "文件大小超过限制" }, { status: 400 });

  const sessionId = `chunk-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  const sanitized = sanitizeFilename(fileName);
  await writeMeta(sessionId, {
    fileName: sanitized, originalName: sanitized, mimeType, fileSize, totalChunks,
    chunkSize, uploadedChunks: [], userId, createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ success: true, data: { sessionId } });
}

async function handleChunk(formData: FormData, userId: string) {
  const sessionId = formData.get("sessionId") as string;
  const chunkIndex = Number(formData.get("chunkIndex"));
  const chunk = formData.get("chunk") as File | null;
  if (!sessionId || Number.isNaN(chunkIndex) || !chunk) return NextResponse.json({ success: false, error: "参数不完整" }, { status: 400 });
  const meta = await readMeta(sessionId);
  if (!meta) return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
  if (meta.userId !== userId) return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
  if (chunkIndex < 0 || chunkIndex >= meta.totalChunks) return NextResponse.json({ success: false, error: "分片索引无效" }, { status: 400 });

  const dir = path.join(CHUNKS_DIR, sessionId);
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, `chunk-${chunkIndex}.part`), Buffer.from(await chunk.arrayBuffer()));
  if (!meta.uploadedChunks.includes(chunkIndex)) {
    meta.uploadedChunks.push(chunkIndex);
    meta.uploadedChunks.sort((a, b) => a - b);
  }
  await writeMeta(sessionId, meta);
  return NextResponse.json({ success: true, data: { chunkIndex, uploadedCount: meta.uploadedChunks.length, totalChunks: meta.totalChunks } });
}

async function handleComplete(formData: FormData, userId: string) {
  const sessionId = formData.get("sessionId") as string;
  if (!sessionId) return NextResponse.json({ success: false, error: "缺少 sessionId" }, { status: 400 });
  const meta = await readMeta(sessionId);
  if (!meta) return NextResponse.json({ success: false, error: "会话不存在" }, { status: 404 });
  if (meta.userId !== userId) return NextResponse.json({ success: false, error: "无权操作" }, { status: 403 });
  for (let i = 0; i < meta.totalChunks; i++) {
    if (!meta.uploadedChunks.includes(i)) return NextResponse.json({ success: false, error: `缺少分片 ${i + 1}/${meta.totalChunks}` }, { status: 400 });
  }

  const extension = getFileExtension(meta.originalName);
  const storedName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
  const uploadDir = process.env.UPLOAD_DIR ?? "public/uploads";
  const dateStr = new Date().toISOString().slice(0, 10);
  const filesDir = path.resolve(process.cwd(), uploadDir, "files", dateStr);
  await fs.mkdir(filesDir, { recursive: true });
  const destPath = path.join(filesDir, storedName);
  const chunks: Buffer[] = [];
  for (let i = 0; i < meta.totalChunks; i++) chunks.push(await fs.readFile(path.join(CHUNKS_DIR, sessionId, `chunk-${i}.part`)));
  await fs.writeFile(destPath, Buffer.concat(chunks));
  await fs.rm(path.join(CHUNKS_DIR, sessionId), { recursive: true, force: true });

  const created = await prisma.file.create({
    data: {
      name: meta.originalName,
      originalName: meta.originalName,
      extension,
      mimeType: meta.mimeType,
      size: meta.fileSize,
      path: `/uploads/files/${dateStr}/${storedName}`,
      userId,
    },
  });
  return NextResponse.json({
    success: true,
    data: {
      id: created.id, name: created.name, originalName: created.originalName,
      extension: created.extension, mimeType: created.mimeType, size: created.size,
      path: created.path, thumbnailPath: created.thumbnailPath, width: created.width,
      height: created.height, duration: created.duration,
      createdAt: created.createdAt, updatedAt: created.updatedAt,
    },
    message: "分片上传完成",
  });
}
