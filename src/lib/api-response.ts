import { NextResponse } from "next/server";
import type { ApiResponse } from "@/types";
import { AppError } from "@/lib/validations";

/**
 * Success response helper
 */
export function successResponse<T>(data: T, message?: string): NextResponse {
  const body: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return NextResponse.json(body);
}

/**
 * Error response helper
 */
export function errorResponse(
  error: unknown,
  statusCode: number = 500,
): NextResponse {
  if (error instanceof AppError) {
    const body: ApiResponse = {
      success: false,
      error: error.message,
    };
    return NextResponse.json(body, { status: error.statusCode });
  }

  if (error instanceof Error) {
    if (error.message === "UNAUTHORIZED") {
      const body: ApiResponse = {
        success: false,
        error: "请先登录",
      };
      return NextResponse.json(body, { status: 401 });
    }

    console.error("[API Error]", error);
    const body: ApiResponse = {
      success: false,
      error: process.env.NODE_ENV === "production" ? "服务器内部错误" : error.message,
    };
    return NextResponse.json(body, { status: statusCode });
  }

  console.error("[API Error]", error);
  const body: ApiResponse = {
    success: false,
    error: "服务器内部错误",
  };
  return NextResponse.json(body, { status: 500 });
}

/**
 * Not found response
 */
export function notFoundResponse(message = "资源不存在"): NextResponse {
  const body: ApiResponse = {
    success: false,
    error: message,
  };
  return NextResponse.json(body, { status: 404 });
}

/**
 * Rate limit headers helper
 */
export function rateLimitResponse(): NextResponse {
  const body: ApiResponse = {
    success: false,
    error: "请求过于频繁，请稍后重试",
  };
  return NextResponse.json(body, {
    status: 429,
    headers: {
      "Retry-After": "60",
    },
  });
}
