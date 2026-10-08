// ============================================================
// Rainbow-box - 音乐上传 API（1.3.0）
// 走 Route Handler，绕开 Server Action 的 bodySizeLimit，
// 解决大体积音频上传时报 "Unexpected end of form" 的问题
// ============================================================

import { NextRequest, NextResponse } from "next/server";
import fs from "fs/promises";
import path from "path";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeFilename } from "@/lib/security";

const MUSIC_UPLOAD_DIR = "public/uploads/music";
const MUSIC_MAX_SIZE = 100 * 1024 * 1024; // 100MB

export const runtime = "nodejs";

function fail(error: string, status = 400) {
  return NextResponse.json({ success: false, error }, { status });
}

export async function POST(req: NextRequest) {
  let userId: string;
  try {
    userId = await requireAuth();
  } catch {
    return fail("请先登录", 401);
  }

  try {
    const formData = await req.formData();
    const file = formData.get("file");
    if (!(file instanceof File) || file.size === 0) {
      return fail("请选择音乐文件");
    }
    if (file.type && !file.type.startsWith("audio/")) {
      return fail("仅支持音频文件");
    }
    if (file.size > MUSIC_MAX_SIZE) {
      return fail("音乐文件超过 100MB 限制");
    }

    const originalName = sanitizeFilename(file.name);
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const extension = (extMatch?.[1] ?? "mp3").toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const dirPath = path.resolve(process.cwd(), MUSIC_UPLOAD_DIR, userId);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(path.join(dirPath, fileName), buffer);

    const filePath = `/uploads/music/${userId}/${fileName}`;
    const track = await prisma.musicTrack.create({
      data: { name: originalName, size: file.size, path: filePath, userId },
    });

    return NextResponse.json({
      success: true,
      data: {
        id: track.id,
        name: track.name,
        size: track.size,
        path: track.path,
        addedAt: track.addedAt,
      },
      message: "音乐已上传",
    });
  } catch (error) {
    console.error("[api/music/upload]", error);
    const raw = error instanceof Error ? error.message : "";
    const message = /end of form|aborted|body exceeded/i.test(raw)
      ? "上传中断，请保持页面开启并重试（或换更小的音频文件）"
      : "音乐上传失败";
    return fail(message, 500);
  }
}