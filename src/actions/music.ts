// ============================================================
// Rainbow-box - Server Actions for Music (音乐盒)
// 1.2.0：音乐元数据由 IndexedDB 迁移至数据库，
// 音频文件本体写入 public/uploads/music/<userId>/ 目录
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { sanitizeFilename } from "@/lib/security";
import type { ApiResponse, MusicTrackItem } from "@/types";

const MUSIC_UPLOAD_DIR = "public/uploads/music";
const MUSIC_MAX_SIZE = 100 * 1024 * 1024; // 100MB

export async function getMusicTracks(): Promise<ApiResponse<MusicTrackItem[]>> {
  try {
    const userId = await requireAuth();
    const tracks = await prisma.musicTrack.findMany({
      where: { userId },
      orderBy: { addedAt: "desc" },
    });
    return {
      success: true,
      data: tracks.map((t) => ({
        id: t.id,
        name: t.name,
        size: t.size,
        path: t.path,
        addedAt: t.addedAt,
      })),
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getMusicTracks]", error);
    return { success: false, error: "获取音乐列表失败" };
  }
}

/**
 * 上传一首音乐：写入文件系统并创建数据库记录
 */
export async function uploadMusicTrack(
  formData: FormData,
): Promise<ApiResponse<MusicTrackItem>> {
  try {
    const userId = await requireAuth();
    const file = formData.get("file") as File | null;
    if (!file) return { success: false, error: "请选择音乐文件" };
    if (!file.type.startsWith("audio/")) return { success: false, error: "仅支持音频文件" };
    if (file.size > MUSIC_MAX_SIZE) return { success: false, error: "音乐文件超过 100MB 限制" };

    const originalName = sanitizeFilename(file.name);
    const extMatch = originalName.match(/\.([a-zA-Z0-9]+)$/);
    const extension = (extMatch?.[1] ?? "mp3").toLowerCase();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const buffer = Buffer.from(await file.arrayBuffer());

    const fs = await import("fs/promises");
    const path = await import("path");
    const dirPath = path.resolve(process.cwd(), MUSIC_UPLOAD_DIR, userId);
    await fs.mkdir(dirPath, { recursive: true });
    await fs.writeFile(path.join(dirPath, fileName), buffer);

    const filePath = `/uploads/music/${userId}/${fileName}`;

    const track = await prisma.musicTrack.create({
      data: {
        name: originalName,
        size: file.size,
        path: filePath,
        userId,
      },
    });

    return {
      success: true,
      data: { id: track.id, name: track.name, size: track.size, path: track.path, addedAt: track.addedAt },
      message: "音乐已上传",
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[uploadMusicTrack]", error);
    return { success: false, error: "音乐上传失败" };
  }
}

export async function removeMusicTrack(trackId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const track = await prisma.musicTrack.findFirst({ where: { id: trackId, userId } });
    if (!track) return { success: false, error: "音乐不存在" };

    // 删除数据库记录与磁盘文件
    await prisma.musicTrack.delete({ where: { id: trackId } });
    try {
      const fs = await import("fs/promises");
      const path = await import("path");
      const diskPath = path.resolve(process.cwd(), "public", track.path.replace(/^\//, ""));
      await fs.unlink(diskPath);
    } catch {
      // 文件可能已不存在，忽略
    }

    return { success: true, message: "音乐已删除" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[removeMusicTrack]", error);
    return { success: false, error: "删除音乐失败" };
  }
}
