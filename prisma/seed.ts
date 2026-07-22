// ============================================================
// Rainbow-box Database Seed
// ============================================================

import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 开始播种数据...");

  // ---- 清理旧数据 ----
  await prisma.operationLog.deleteMany();
  await prisma.uploadRecord.deleteMany();
  await prisma.recycleBin.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.file.deleteMany();
  await prisma.category.deleteMany();
  await prisma.session.deleteMany();
  await prisma.account.deleteMany();
  await prisma.user.deleteMany();

  // ---- 创建演示用户 ----
  const password = await bcrypt.hash("123456", 12);
  const user = await prisma.user.create({
    data: {
      name: "Demo 用户",
      email: "demo@rainbow-box.com",
      password,
      bio: "这是一个演示账号，七彩分类让文件管理更轻松。",
    },
  });
  console.log(`  ✅ 创建用户: ${user.name} (demo@rainbow-box.com / 123456)`);

  // ---- 创建七彩分类 ----
  const categories = [
    { name: "工作文档", color: "red",    icon: "file-text",   description: "工作相关的文档、表格、报告", sortOrder: 1 },
    { name: "学习资料", color: "orange", icon: "book",        description: "教程、笔记、电子书",         sortOrder: 2 },
    { name: "图片素材", color: "yellow", icon: "image",       description: "照片、设计稿、截图",         sortOrder: 3 },
    { name: "个人文件", color: "green",  icon: "user",        description: "简历、证件、合同",           sortOrder: 4 },
    { name: "代码仓库", color: "blue",   icon: "code",        description: "项目代码、脚本、配置文件",   sortOrder: 5 },
    { name: "媒体娱乐", color: "blue",   icon: "music",       description: "音乐、视频、游戏",           sortOrder: 6 },
    { name: "其他归档", color: "purple", icon: "archive",     description: "其他需要归档的文件",         sortOrder: 7 },
  ];

  const createdCategories = await Promise.all(
    categories.map((cat) =>
      prisma.category.create({
        data: { ...cat, userId: user.id },
      }),
    ),
  );
  console.log(`  ✅ 创建 ${createdCategories.length} 个分类`);

  // ---- 为每个分类创建示例文件 ----
  const sampleFiles: Array<{
    name: string;
    originalName: string;
    extension: string;
    mimeType: string;
    size: number;
    path: string;
    categoryIndex: number;
  }> = [
    // 工作文档
    { name: "2024年度总结报告",    originalName: "2024年度总结报告.docx",  extension: "docx", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document", size: 256_000,  path: "/uploads/demo/work/report.docx",  categoryIndex: 0 },
    { name: "项目计划表",         originalName: "项目计划表.xlsx",        extension: "xlsx", mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",        size: 128_000,  path: "/uploads/demo/work/plan.xlsx",   categoryIndex: 0 },
    // 学习资料
    { name: "React 入门笔记",      originalName: "React入门笔记.pdf",      extension: "pdf",   mimeType: "application/pdf",  size: 1_024_000, path: "/uploads/demo/study/react.pdf",     categoryIndex: 1 },
    { name: "TypeScript 教程",     originalName: "TypeScript教程.pdf",     extension: "pdf",   mimeType: "application/pdf",  size: 2_048_000, path: "/uploads/demo/study/ts.pdf",       categoryIndex: 1 },
    // 图片素材
    { name: "团队合照",           originalName: "团队合照.jpg",           extension: "jpg",   mimeType: "image/jpeg",       size: 3_500_000, path: "/uploads/demo/images/team.jpg",     categoryIndex: 2 },
    { name: "Logo 设计稿",        originalName: "logo-design.png",        extension: "png",   mimeType: "image/png",        size: 512_000,   path: "/uploads/demo/images/logo.png",     categoryIndex: 2 },
    // 个人文件
    { name: "个人简历",           originalName: "个人简历.pdf",           extension: "pdf",   mimeType: "application/pdf",  size: 380_000,   path: "/uploads/demo/personal/resume.pdf", categoryIndex: 3 },
    // 代码仓库
    { name: "彩虹盒项目",         originalName: "rainbow-box-main.zip",   extension: "zip",   mimeType: "application/zip",  size: 10_000_000, path: "/uploads/demo/code/rb.zip",       categoryIndex: 4 },
    // 媒体娱乐
    { name: "夏日歌单",           originalName: "summer-playlist.mp3",    extension: "mp3",   mimeType: "audio/mpeg",       size: 8_000_000, path: "/uploads/demo/media/summer.mp3",  categoryIndex: 5 },
    // 其他归档
    { name: "备份配置文件",       originalName: "config-backup.tar.gz",   extension: "gz",    mimeType: "application/gzip", size: 520_000,   path: "/uploads/demo/archive/config.gz",  categoryIndex: 6 },
  ];

  const createdFiles = await Promise.all(
    sampleFiles.map((f) =>
      prisma.file.create({
        data: {
          name: f.name,
          originalName: f.originalName,
          extension: f.extension,
          mimeType: f.mimeType,
          size: f.size,
          path: f.path,
          categoryId: createdCategories[f.categoryIndex]!.id,
          userId: user.id,
        },
      }),
    ),
  );
  console.log(`  ✅ 创建 ${createdFiles.length} 个示例文件`);

  // ---- 添加收藏 ----
  const favorites = [createdFiles[0]!, createdFiles[2]!];
  await Promise.all(
    favorites.map((f) =>
      prisma.favorite.create({
        data: { fileId: f.id, userId: user.id },
      }),
    ),
  );
  console.log(`  ✅ 创建 ${favorites.length} 个收藏`);

  // ---- 添加标签 ----
  const tagsData = [
    { name: "重要", color: "#EF4444" },
    { name: "进行中", color: "#F97316" },
  ];

  await Promise.all(
    tagsData.map((t) =>
      prisma.tag.create({
        data: {
          name: t.name,
          color: t.color,
          userId: user.id,
        },
      }),
    ),
  );
  console.log(`  ✅ 创建 ${tagsData.length} 个标签`);

  // ---- 添加操作日志 ----
  await prisma.operationLog.create({
    data: {
      operation: "SEED",
      targetType: "system",
      targetId: "seed-init",
      detail: "数据库初始化",
      userId: user.id,
    },
  });
  console.log("  ✅ 创建操作日志");

  console.log("");
  console.log("🎉 数据库播种完成！");
  console.log("   📧 演示账号: demo@rainbow-box.com");
  console.log("   🔑 密码: 123456");
}

main()
  .catch((e) => {
    console.error("❌ 播种失败:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
