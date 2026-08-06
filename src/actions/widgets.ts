// ============================================================
// Rainbow-box - Server Actions for Widgets (Todo / Note)
// 1.2.0：待办与随手记由 localStorage 迁移至数据库，按账号隔离
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { todoTextSchema, noteTextSchema, AppError } from "@/lib/validations";
import type { ApiResponse, TodoItem, NoteItem } from "@/types";

// ---------------- Todo ----------------

export async function getTodos(): Promise<ApiResponse<TodoItem[]>> {
  try {
    const userId = await requireAuth();
    const todos = await prisma.todo.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });
    return {
      success: true,
      data: todos.map((t) => ({
        id: t.id,
        text: t.text,
        done: t.done,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
      })),
    };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getTodos]", error);
    return { success: false, error: "获取待办失败" };
  }
}

export async function addTodo(input: unknown): Promise<ApiResponse<TodoItem>> {
  try {
    const userId = await requireAuth();
    const { text } = todoTextSchema.parse(input);
    const todo = await prisma.todo.create({ data: { text, userId } });
    return {
      success: true,
      data: { id: todo.id, text: todo.text, done: todo.done, createdAt: todo.createdAt, updatedAt: todo.updatedAt },
      message: "待办已添加",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[addTodo]", error);
    return { success: false, error: "添加待办失败" };
  }
}

export async function toggleTodo(todoId: string): Promise<ApiResponse<TodoItem>> {
  try {
    const userId = await requireAuth();
    const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } });
    if (!todo) throw new AppError("待办不存在", 404);
    const updated = await prisma.todo.update({
      where: { id: todoId },
      data: { done: !todo.done },
    });
    return {
      success: true,
      data: { id: updated.id, text: updated.text, done: updated.done, createdAt: updated.createdAt, updatedAt: updated.updatedAt },
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[toggleTodo]", error);
    return { success: false, error: "更新待办失败" };
  }
}

export async function removeTodo(todoId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const todo = await prisma.todo.findFirst({ where: { id: todoId, userId } });
    if (!todo) throw new AppError("待办不存在", 404);
    await prisma.todo.delete({ where: { id: todoId } });
    return { success: true, message: "待办已删除" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[removeTodo]", error);
    return { success: false, error: "删除待办失败" };
  }
}

export async function clearDoneTodos(): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    await prisma.todo.deleteMany({ where: { userId, done: true } });
    return { success: true, message: "已完成待办已清除" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[clearDoneTodos]", error);
    return { success: false, error: "清除待办失败" };
  }
}

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

/**
 * 批量导入旧版 localStorage 数据（1.2.0 数据迁移用）
 */
export async function importLocalTodos(items: unknown): Promise<ApiResponse<{ imported: number }>> {
  try {
    const userId = await requireAuth();
    const list = Array.isArray(items) ? items : [];
    let imported = 0;
    for (const item of list) {
      const raw = item as { text?: string; done?: boolean };
      if (typeof raw.text !== "string" || !raw.text.trim()) continue;
      await prisma.todo.create({
        data: { text: raw.text.trim(), done: Boolean(raw.done), userId },
      });
      imported += 1;
    }
    return { success: true, data: { imported }, message: `已导入 ${imported} 条待办` };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[importLocalTodos]", error);
    return { success: false, error: "导入失败" };
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
