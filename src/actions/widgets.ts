// ============================================================
// Rainbow-box - Server Actions for Widgets (Note / 随手记)
// 1.2.0：随手记由 localStorage 迁移至数据库，按账号隔离
// 1.2.1：每日待办功能合并入任务管理，移除 Todo 相关操作
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { noteTextSchema, AppError } from "@/lib/validations";
import type { ApiResponse, NoteItem } from "@/types";

// ---------------- Note ----------------

export async function getNotes(): Promise<ApiResponse<NoteItem[]>> {
  try {
    const userId = await requireAuth();
    const notes = await prisma.note.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: notes.map((n) => ({
        id: n.id,
        text: n.text,
        createdAt: n.createdAt,
        updatedAt: n.updatedAt,
      })),
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getNotes]", error);
    return { success: false, error: "获取随手记失败" };
  }
}

export async function addNote(input: unknown): Promise<ApiResponse<NoteItem>> {
  try {
    const userId = await requireAuth();
    const { text } = noteTextSchema.parse(input);
    const note = await prisma.note.create({ data: { text, userId } });
    return {
      success: true,
      data: { id: note.id, text: note.text, createdAt: note.createdAt, updatedAt: note.updatedAt },
      message: "已保存",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[addNote]", error);
    return { success: false, error: "保存失败" };
  }
}

export async function updateNote(noteId: string, input: unknown): Promise<ApiResponse<NoteItem>> {
  try {
    const userId = await requireAuth();
    const { text } = noteTextSchema.parse(input);
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new AppError("记录不存在", 404);
    const updated = await prisma.note.update({ where: { id: noteId }, data: { text } });
    return {
      success: true,
      data: { id: updated.id, text: updated.text, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[updateNote]", error);
    return { success: false, error: "更新失败" };
  }
}

export async function removeNote(noteId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const note = await prisma.note.findFirst({ where: { id: noteId, userId } });
    if (!note) throw new AppError("记录不存在", 404);
    await prisma.note.delete({ where: { id: noteId } });
    return { success: true, message: "已删除" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[removeNote]", error);
    return { success: false, error: "删除失败" };
  }
}

export async function importLocalNotes(items: unknown): Promise<ApiResponse<{ imported: number }>> {
  try {
    const userId = await requireAuth();
    const list = Array.isArray(items) ? items : [];
    let imported = 0;
    for (const item of list) {
      const raw = item as { text?: string };
      if (typeof raw.text !== "string" || !raw.text.trim()) continue;
      await prisma.note.create({ data: { text: raw.text.trim(), userId } });
      imported += 1;
    }
    return { success: true, data: { imported }, message: `已导入 ${imported} 条记录` };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[importLocalNotes]", error);
    return { success: false, error: "导入失败" };
  }
}
