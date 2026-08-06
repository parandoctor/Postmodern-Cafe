// ============================================================
// Rainbow-box - Server Actions for Task (任务管理)
// 1.2.0 新增：任务名 / 目的 / 优先级(三档) / 完成状态 / 截止日期
// 支持父子任务拆分（parentId 自关联）与关联知识/文件（TaskLink）
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createTaskSchema, updateTaskSchema, addTaskLinkSchema, reorderTasksSchema, AppError } from "@/lib/validations";
import type { ApiResponse, TaskItem, TaskPriority, TaskLinkItem, NoteItem, FileItem } from "@/types";
import { logOperation } from "@/lib/security";

function serializeNote(n: {
  id: string; text: string; createdAt: Date; updatedAt: Date;
}): NoteItem {
  return { id: n.id, text: n.text, createdAt: n.createdAt, updatedAt: n.updatedAt };
}

function serializeFile(f: {
  id: string; name: string; originalName: string; extension: string;
  mimeType: string; size: number; path: string; thumbnailPath: string | null;
  categoryId: string | null; isFavorite: boolean; isDeleted: boolean;
  deletedAt: Date | null; createdAt: Date; updatedAt: Date;
}): FileItem {
  return {
    id: f.id, name: f.name, originalName: f.originalName, extension: f.extension,
    mimeType: f.mimeType, size: f.size, path: f.path, thumbnailPath: f.thumbnailPath,
    categoryId: f.categoryId, isFavorite: f.isFavorite, isDeleted: f.isDeleted,
    deletedAt: f.deletedAt, createdAt: f.createdAt, updatedAt: f.updatedAt,
  };
}

function serializeLink(l: {
  id: string; taskId: string; fileId: string | null; noteId: string | null;
  file: { id: string; name: string; originalName: string; extension: string; mimeType: string; size: number; path: string; thumbnailPath: string | null; categoryId: string | null; isFavorite: boolean; isDeleted: boolean; deletedAt: Date | null; createdAt: Date; updatedAt: Date } | null;
  note: { id: string; text: string; createdAt: Date; updatedAt: Date } | null;
}): TaskLinkItem {
  return {
    id: l.id,
    taskId: l.taskId,
    fileId: l.fileId,
    noteId: l.noteId,
    file: l.file ? serializeFile(l.file) : null,
    note: l.note ? serializeNote(l.note) : null,
  };
}

interface SerializableTask {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  done: boolean;
  dueDate: Date | null;
  sortOrder: number;
  parentId: string | null;
  createdAt: Date;
  updatedAt: Date;
  children: SerializableTask[];
  links: Array<{
    id: string;
    taskId: string;
    fileId: string | null;
    noteId: string | null;
    file: {
      id: string; name: string; originalName: string; extension: string;
      mimeType: string; size: number; path: string; thumbnailPath: string | null;
      categoryId: string | null; isFavorite: boolean; isDeleted: boolean;
      deletedAt: Date | null; createdAt: Date; updatedAt: Date;
    } | null;
    note: { id: string; text: string; createdAt: Date; updatedAt: Date } | null;
  }>;
}

function serializeTask(t: SerializableTask): TaskItem {
  return {
    id: t.id,
    title: t.title,
    description: t.description,
    priority: t.priority as TaskPriority,
    done: t.done,
    dueDate: t.dueDate,
    sortOrder: t.sortOrder,
    parentId: t.parentId,
    createdAt: t.createdAt,
    updatedAt: t.updatedAt,
    children: t.children.map(serializeTask),
    links: t.links.map(serializeLink),
  };
}

/**
 * 获取全部任务（含子任务树与关联目标），顶层任务按优先级/截止日期排序
 */
export async function getTasks(): Promise<ApiResponse<TaskItem[]>> {
  try {
    const userId = await requireAuth();
    const tasks = await prisma.task.findMany({
      where: { userId },
      include: {
        children: {
          include: {
            children: { orderBy: { sortOrder: "asc" } },
            links: { include: { file: true, note: true } },
          },
          orderBy: { sortOrder: "asc" },
        },
        links: { include: { file: true, note: true } },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    });

    const data = tasks
      .filter((t) => t.parentId === null)
      .map((t) => serializeTask(t as unknown as SerializableTask));

    return { success: true, data };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getTasks]", error);
    return { success: false, error: "获取任务失败" };
  }
}

/**
 * 创建任务（支持指定父任务实现拆分）
 */
export async function createTask(input: unknown): Promise<ApiResponse<TaskItem>> {
  try {
    const userId = await requireAuth();
    const data = createTaskSchema.parse(input);

    if (data.parentId) {
      const parent = await prisma.task.findFirst({ where: { id: data.parentId, userId } });
      if (!parent) throw new AppError("父任务不存在", 404);
    }

    // 新任务追加到同级末尾（自定义排序 sortOrder 取同级最大值 + 1）
    const maxSort = await prisma.task.aggregate({
      where: { userId, parentId: data.parentId ?? null },
      _max: { sortOrder: true },
    });
    const sortOrder = (maxSort._max.sortOrder ?? -1) + 1;

    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description ?? null,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        sortOrder,
        parentId: data.parentId ?? null,
        userId,
      },
      include: { children: { include: { links: { include: { file: true, note: true } } } }, links: { include: { file: true, note: true } } },
    });

    await logOperation({
      userId,
      operation: "CREATE_CATEGORY",
      targetType: "task",
      targetId: task.id,
      detail: `创建任务：${task.title}`,
    });

    return { success: true, data: serializeTask(task as unknown as SerializableTask), message: "任务已创建" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[createTask]", error);
    return { success: false, error: "创建任务失败" };
  }
}

/**
 * 更新任务（标题 / 目的 / 优先级 / 完成状态 / 截止日期 / 父任务）
 */
export async function updateTask(
  taskId: string,
  input: unknown,
): Promise<ApiResponse<TaskItem>> {
  try {
    const userId = await requireAuth();
    const data = updateTaskSchema.parse(input);
    const task = await prisma.task.findFirst({
      where: { id: taskId, userId },
      include: { children: true },
    });
    if (!task) throw new AppError("任务不存在", 404);

    // 防止把任务设为自身的子任务
    if (data.parentId && (data.parentId === taskId || task.children.some((c) => c.id === data.parentId))) {
      throw new AppError("不能将任务拆分为自身的子任务", 400);
    }

    const updated = await prisma.task.update({
      where: { id: taskId },
      data: {
        ...(data.title !== undefined ? { title: data.title } : {}),
        ...(data.description !== undefined ? { description: data.description ?? null } : {}),
        ...(data.priority !== undefined ? { priority: data.priority } : {}),
        ...(data.done !== undefined ? { done: data.done } : {}),
        ...(data.dueDate !== undefined ? { dueDate: data.dueDate ? new Date(data.dueDate) : null } : {}),
        ...(data.parentId !== undefined ? { parentId: data.parentId ?? null } : {}),
      },
      include: { children: { include: { links: { include: { file: true, note: true } } }, orderBy: { sortOrder: "asc" } }, links: { include: { file: true, note: true } } },
    });

    return { success: true, data: serializeTask(updated as unknown as SerializableTask), message: "任务已更新" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[updateTask]", error);
    return { success: false, error: "更新任务失败" };
  }
}

export async function deleteTask(taskId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const task = await prisma.task.findFirst({ where: { id: taskId, userId } });
    if (!task) throw new AppError("任务不存在", 404);
    // 级联删除子任务与关联（onDelete: Cascade）
    await prisma.task.delete({ where: { id: taskId } });
    return { success: true, message: "任务已删除" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[deleteTask]", error);
    return { success: false, error: "删除任务失败" };
  }
}

/**
 * 批量更新同级任务的自定义排序（拖拽排序后保存）
 */
export async function reorderTasks(input: unknown): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const data = reorderTasksSchema.parse(input);
    await prisma.$transaction(
      data.items.map((item) =>
        prisma.task.updateMany({
          where: { id: item.id, userId },
          data: { sortOrder: item.sortOrder },
        }),
      ),
    );
    return { success: true, message: "排序已保存" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[reorderTasks]", error);
    return { success: false, error: "保存排序失败" };
  }
}

/**
 * 为任务关联知识（随手记）或项目文件
 */
export async function addTaskLink(input: unknown): Promise<ApiResponse<TaskLinkItem>> {
  try {
    const userId = await requireAuth();
    const data = addTaskLinkSchema.parse(input);

    const task = await prisma.task.findFirst({ where: { id: data.taskId, userId } });
    if (!task) throw new AppError("任务不存在", 404);

    if (data.fileId) {
      const file = await prisma.file.findFirst({ where: { id: data.fileId, userId } });
      if (!file) throw new AppError("关联的文件不存在", 404);
    }
    if (data.noteId) {
      const note = await prisma.note.findFirst({ where: { id: data.noteId, userId } });
      if (!note) throw new AppError("关联的知识不存在", 404);
    }

    const link = await prisma.taskLink.create({
      data: {
        taskId: data.taskId,
        fileId: data.fileId ?? null,
        noteId: data.noteId ?? null,
        userId,
      },
      include: { file: true, note: true },
    });

    return { success: true, data: serializeLink(link), message: "已关联" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[addTaskLink]", error);
    return { success: false, error: "关联失败" };
  }
}

export async function removeTaskLink(linkId: string): Promise<ApiResponse<null>> {
  try {
    const userId = await requireAuth();
    const link = await prisma.taskLink.findFirst({ where: { id: linkId, userId } });
    if (!link) throw new AppError("关联不存在", 404);
    await prisma.taskLink.delete({ where: { id: linkId } });
    return { success: true, message: "已取消关联" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[removeTaskLink]", error);
    return { success: false, error: "取消关联失败" };
  }
}
