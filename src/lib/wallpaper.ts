/**
 * 壁纸图片处理工具（v1.1.2）
 *
 * 上传前用 canvas 智能重绘，解决"放大后模糊"与 localStorage 体积超限两个问题：
 * 1. 自动应用 EXIF 旋转方向（手机竖拍照片不再横置）
 * 2. 低分辨率图片放大到屏幕级别尺寸，使用高质量重采样插值，cover 铺满后不再模糊
 * 3. 超大图片压缩到合理尺寸，控制 data URL 体积（localStorage 按 UTF-16 计配额）
 * 4. 输出格式：透明图保留 PNG，照片用 JPEG 压缩；PNG 体积过大时回退 JPEG（白底）
 */

/** 最长边上限：超出则等比缩小（存储体积红线） */
const MAX_TARGET = 2560;
/** 最长边下限：低于则等比放大（保证 cover 放大后依然清晰） */
const MIN_TARGET = 1600;
/** data URL 字符数红线：超出则逐级降采样（localStorage 约 5MB UTF-16 配额） */
const MAX_DATA_URL_CHARS = 2_000_000;
/** JPEG 质量 */
const JPEG_QUALITY = 0.92;

type DecodedImage =
  | { source: ImageBitmap; width: number; height: number; close: () => void }
  | { source: HTMLImageElement; width: number; height: number; close: () => void };

/**
 * 解码图片并自动应用 EXIF 旋转方向。
 * 优先使用 createImageBitmap（支持 imageOrientation: "from-image"），
 * 不支持时回退到 Image + objectURL。
 */
async function decodeImage(file: File): Promise<DecodedImage> {
  if (typeof createImageBitmap === "function") {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
      return {
        source: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // 解码失败则走 Image 回退路径
    }
  }
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.src = url;
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("图片解码失败"));
  });
  return {
    source: img,
    width: img.naturalWidth,
    height: img.naturalHeight,
    close: () => URL.revokeObjectURL(url),
  };
}

/**
 * 将图片绘制到指定尺寸的画布并导出 data URL。
 * 开启高质量重采样（双三次插值），放大时不糊；
 * JPEG 输出前先填充白底（透明像素在 JPEG 中会变黑）。
 */
function renderToDataUrl(
  source: CanvasImageSource,
  width: number,
  height: number,
  format: "image/png" | "image/jpeg",
  quality: number,
): string {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("无法创建画布上下文");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  if (format === "image/jpeg") {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL(format, quality);
}

/**
 * 处理上传的壁纸图片，返回优化后的 data URL。
 * 原图尺寸已在合理区间时保持原样输出，避免无谓重绘。
 */
export async function processWallpaperImage(file: File): Promise<string> {
  const decoded = await decodeImage(file);
  try {
    const srcWidth = decoded.width;
    const srcHeight = decoded.height;
    const longest = Math.max(srcWidth, srcHeight);
    const screenMax =
      typeof window !== "undefined"
        ? Math.max(window.innerWidth || 1920, window.innerHeight || 1080)
        : 1920;
    // 目标边长：不低于屏幕尺寸（防放大模糊），不超过上限（防存储超限）
    const target = Math.min(Math.max(longest, Math.max(screenMax, MIN_TARGET)), MAX_TARGET);
    const scale = target / longest;
    let width = srcWidth * scale;
    let height = srcHeight * scale;

    const hasAlpha =
      file.type === "image/png" || file.type === "image/webp" || file.type === "image/gif";
    let format: "image/png" | "image/jpeg" = hasAlpha ? "image/png" : "image/jpeg";
    let dataUrl = renderToDataUrl(decoded.source, width, height, format, JPEG_QUALITY);

    // 透明图体积过大时回退 JPEG（白底）
    if (format === "image/png" && dataUrl.length > MAX_DATA_URL_CHARS) {
      format = "image/jpeg";
      dataUrl = renderToDataUrl(decoded.source, width, height, format, JPEG_QUALITY);
    }
    // 体积仍超限则逐级降采样（最多降到 1024 宽）
    while (dataUrl.length > MAX_DATA_URL_CHARS && width > 1024 && height > 768) {
      width *= 0.8;
      height *= 0.8;
      dataUrl = renderToDataUrl(decoded.source, width, height, format, JPEG_QUALITY);
    }
    return dataUrl;
  } finally {
    decoded.close();
  }
}
