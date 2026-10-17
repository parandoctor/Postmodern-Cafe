import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符").max(100, "密码过长"),
});

export const registerSchema = z.object({
  name: z.string().min(2, "昵称至少2个字符").max(32, "昵称最长32个字符").regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "昵称包含非法字符"),
  email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
  password: z.string().min(6, "密码至少6个字符").max(100, "密码过长").regex(/[A-Za-z]/, "密码必须包含字母").regex(/[0-9]/, "密码必须包含数字"),
});

export const updateProfileSchema = z.object({
  name: z.string().min(2, "昵称至少2个字符").max(32, "昵称最长32个字符").regex(/^[a-zA-Z0-9\u4e00-\u9fa5_-]+$/, "昵称包含非法字符").optional(),
  bio: z.string().max(200, "个人简介最长200个字符").optional(),
});

export const updateEmailSchema = z.object({
  email: z.string().min(1, "邮箱不能为空").email("请输入有效的邮箱地址"),
  password: z.string().min(1, "请输入当前密码确认"),
});

export const updatePasswordSchema = z.object({
  currentPassword: z.string().min(1, "请输入当前密码"),
  newPassword: z.string().min(6, "密码至少6个字符").max(100, "密码过长").regex(/[A-Za-z]/, "密码必须包含字母").regex(/[0-9]/, "密码必须包含数字"),
});

export const renameFileSchema = z.object({
  name: z.string().min(1, "文件名不能为空").max(255, "文件名过长").regex(/^[^\\/:*?"<>|]+$/, "文件名包含非法字符"),
});

export const deleteFilesSchema = z.object({
  fileIds: z.array(z.string()).min(1, "请选择文件"),
});

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).max(100).default(24),
  search: z.string().optional(),
  sortBy: z.enum(["name", "size", "createdAt", "updatedAt"]).optional(),
  sortOrder: z.enum(["asc", "desc"]).optional(),
});

export const noteTextSchema = z.object({
  text: z.string().min(1, "内容不能为空").max(100000, "内容最长100000个字符"),
});

export class AppError extends Error {
  constructor(message: string, public statusCode: number = 400, public code?: string) {
    super(message);
    this.name = "AppError";
  }
}

export function validateInput<T>(schema: z.ZodSchema<T>, input: unknown): T {
  const result = schema.safeParse(input);
  if (!result.success) {
    throw new AppError(result.error.errors[0]?.message ?? "输入数据校验失败", 400, "VALIDATION_ERROR");
  }
  return result.data;
}
