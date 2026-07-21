// ============================================================
// Rainbow-box - Server Actions for Categories
// ============================================================

"use server";

import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/auth";
import { createCategorySchema, updateCategorySchema, AppError } from "@/lib/validations";
import { logOperation } from "@/lib/security";
import type { ApiResponse, Category } from "@/types";

/**
 * Get all categories for the current user
 */
export async function getCategories(): Promise<ApiResponse<Category[]>> {
  try {
    const userId = await requireAuth();

    const categories = await prisma.category.findMany({
      where: { userId },
      orderBy: { sortOrder: "asc" },
      include: {
        _count: { select: { files: true } },
      },
    });

    const data: Category[] = categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      color: cat.color as Category["color"],
      icon: cat.icon,
      description: cat.description,
      sortOrder: cat.sortOrder,
      fileCount: cat._count.files,
      createdAt: cat.createdAt,
      updatedAt: cat.updatedAt,
    }));

    return { success: true, data };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") {
      return { success: false, error: "请先登录" };
    }
    console.error("[getCategories]", error);
    return { success: false, error: "获取分类失败" };
  }
}

/**
 * Create a new category
 */
export async function createCategory(
  input: unknown,
): Promise<ApiResponse<Category>> {
  try {
    const userId = await requireAuth();
    const data = createCategorySchema.parse(input);

    const maxOrder = await prisma.category.aggregate({
      where: { userId },
      _max: { sortOrder: true },
    });

    const category = await prisma.category.create({
      data: {
        name: data.name,
        color: data.color,
        icon: data.icon,
        description: data.description ?? null,
        sortOrder: (maxOrder._max.sortOrder ?? -1) + 1,
        userId,
      },
      include: {
        _count: { select: { files: true } },
      },
    });

    await logOperation({
      userId,
      operation: "CREATE_CATEGORY",
      targetType: "category",
      targetId: category.id,
      detail: `创建分类：${category.name}`,
    });

    return {
      success: true,
      data: {
        id: category.id,
        name: category.name,
        color: category.color as Category["color"],
        icon: category.icon,
        description: category.description,
        sortOrder: category.sortOrder,
        fileCount: category._count.files,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      },
      message: "分类创建成功",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[createCategory]", error);
    return { success: false, error: "创建分类失败" };
  }
}

/**
 * Update a category
 */
export async function updateCategory(
  categoryId: string,
  input: unknown,
): Promise<ApiResponse<Category>> {
  try {
    const userId = await requireAuth();
    const data = updateCategorySchema.parse(input);

    const existing = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!existing) throw new AppError("分类不存在", 404);

    const updated = await prisma.category.update({
      where: { id: categoryId },
      data,
      include: { _count: { select: { files: true } } },
    });

    await logOperation({
      userId,
      operation: "UPDATE_CATEGORY",
      targetType: "category",
      targetId: categoryId,
      detail: `更新分类：${updated.name}`,
    });

    return {
      success: true,
      data: {
        id: updated.id,
        name: updated.name,
        color: updated.color as Category["color"],
        icon: updated.icon,
        description: updated.description,
        sortOrder: updated.sortOrder,
        fileCount: updated._count.files,
        createdAt: updated.createdAt,
        updatedAt: updated.updatedAt,
      },
      message: "分类已更新",
    };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[updateCategory]", error);
    return { success: false, error: "更新分类失败" };
  }
}

/**
 * Delete a category
 */
export async function deleteCategory(
  categoryId: string,
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    const existing = await prisma.category.findFirst({
      where: { id: categoryId, userId },
    });
    if (!existing) throw new AppError("分类不存在", 404);

    // Unlink all files in this category
    await prisma.file.updateMany({
      where: { categoryId, userId },
      data: { categoryId: null },
    });

    await prisma.category.delete({ where: { id: categoryId } });

    await logOperation({
      userId,
      operation: "DELETE_CATEGORY",
      targetType: "category",
      targetId: categoryId,
      detail: `删除分类：${existing.name}`,
    });

    return { success: true, message: "分类已删除" };
  } catch (error) {
    if (error instanceof AppError) return { success: false, error: error.message };
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[deleteCategory]", error);
    return { success: false, error: "删除分类失败" };
  }
}

/**
 * Reorder categories
 */
export async function reorderCategories(
  categoryIds: string[],
): Promise<ApiResponse> {
  try {
    const userId = await requireAuth();

    await prisma.$transaction(
      categoryIds.map((id, index) =>
        prisma.category.updateMany({
          where: { id, userId },
          data: { sortOrder: index },
        }),
      ),
    );

    return { success: true, message: "排序已更新" };
  } catch (error) {
    if ((error as Error).message === "UNAUTHORIZED") return { success: false, error: "请先登录" };
    console.error("[reorderCategories]", error);
    return { success: false, error: "排序失败" };
  }
}
