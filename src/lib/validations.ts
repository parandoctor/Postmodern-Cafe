import { z } from "zod";

// ---- Auth Schemas ----
export const loginSchema = z.object({
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少6个字符")
    .max(100, "密码过长"),
});

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, "昵称至少2个字符")
    .max(32, "昵称最长32个字符")
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "昵称包含非法字符"),
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(6, "密码至少6个字符")
    .max(100, "密码过长")
    .regex(/[A-Za-z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
});

// ---- Profile Schemas ----
export const updateProfileSchema = z.object({
  name: z
    .string()
    .min(2, "昵称至少2个字符")
    .max(32, "昵称最长32个字符")
    .regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "昵称包含非法字符")
    .optional(),
  bio: z
    .string()
    .max(200, "个人简介最长200个字符")
    .optional(),
});

export const updateEmailSchema = z.object({
  email: z
    .string()
    .min(1, "邮箱不能为空")
    .email("请输入有效的邮箱地址"),
  password: z
    .string()
    .min(1, "请输入当前密码确认"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z
    .string()
    .min(1, "请输入当前密码"),
  newPassword: z
    .string()
    .min(6, "密码至少6个字符")
    .max(100, "密码过长")
    .regex(/[A-Za-z]/, "密码必须包含字母")
    .regex(/[0-9]/, "密码必须包含数字"),
});

// ---- Category Schemas ----
export const createCategorySchema = z.object({
  name: z
    .string()
    .min(1, "分类名称不能为空")
    .max(32, "分类名称最长32个字符"),
  color: z.enum(["red", "orange", "yellow", "green", "blue", "darkblue", "purple"]),
  icon: z
    .string()
    .min(1, "请选择图标")
    .max(64, "图标名称过长"),
  description: z
    .string()
    .max(200, "描述最长200个字符")
    .optional(),
});

export const updateCategorySchema = createCategorySchema.partial().extend({
  sortOrder: z.number().int().min(0).optional(),
});

// ---- File Schemas ----
export const renameFileSchema = z.object({
  name: z
    .string()
    .min(1, "文件名不能为空")
    .max(255, "文件名过长")
    .regex(/^[^\\/:*?"<>|]+$/, "文件名包含非法字符"),
});

export const moveFilesSchema = z.object({
  fileIds: z.array(z.string()).min(1, "请选择文件"),
  categoryId: z.string().nullable(),
});

export const deleteFilesSchema = z.object({
  fileIds: z.array(z.string()).min(1, "请选择文件"),
});

// ---- Pagination ----
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  categoryId: z.string().optional(),
  sortBy: z.enum(["name", "size", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

// ---- API Error Response ----
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 400,
    public code?: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

/**
 * Validate input with a Zod schema and return parsed data or throw formatted error
 */
export function validateInput<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    const firstError = result.error.errors[0];
    throw new AppError(
      firstError?.message ?? "输入数据校验失败",
      400,
      "VALIDATION_ERROR",
    );
  }
  return result.data;
}

/**
 * Validate input safely without throwing
 */
export function validateInputSafe<T>(
  schema: z.ZodSchema<T>,
  input: unknown,
): { success: true; data: T } | { success: false; error: z.ZodError } {
  const result = schema.safeParse(input);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, error: result.error };
}
