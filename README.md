# <img src="public/images/cafe-logo-black.png" width="26" height="26" align="center" alt="后现代咖啡馆"> 后现代咖啡馆 (Postmodern Cafe) `v1.3.2`

> 把记录，放在安静的地方。

<p align="center">
  <img src="https://img.shields.io/badge/version-1.3.2-black" alt="Version" />
  <img src="https://img.shields.io/badge/Next.js-15.5-black?logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Prisma-6-2D3748?logo=prisma" alt="Prisma" />
  <img src="https://img.shields.io/badge/Tailwind-3.4-06B6D4?logo=tailwindcss" alt="Tailwind" />
</p>

---

## 项目简介

**后现代咖啡馆 (Postmodern-Cafe)** 是一个白底、黑字、细线分隔的个人数字空间。1.3.2 起后台只保留三个模块：

- **笔记管理**：Markdown 编辑、自动保存、图片/视频/文档等文件抽屉
- **美学空间**：单实例音乐播放与浏览器内进阶图片编辑
- **实用工具**：跨页面持续倒计时与月历

首页为纯产品落地页；登录后进入由三根竖向细线、错位节点和动态半调点阵组成的空间图，再选择模块。后台不再使用左中右分栏。旧文件分类、收藏、回收站、任务与 Y2K 音乐盒已下线，旧地址会兼容跳转到对应新模块。

当前版本 **v1.3.2**：紧凑三节点空间图、鼠标响应半调阴影、全线悬浮交互、统一动效按钮、首页逐行滚动揭示，以及 1.3.1 的三模块与音乐修复。

---

## 核心功能

| 模块 | 能力 |
|------|------|
| **笔记管理** | Markdown 编辑与预览、标题自动提取、800ms 自动保存、Ctrl/⌘+S、100,000 字符上限 |
| **文件抽屉** | 图片/视频/音频/文档/压缩包上传、2MB 以上自动分片、预览、下载、删除 |
| **音乐** | 全后台单音频实例、收起导航与切换模块不中断、播放/暂停/停止/上下曲/随机/循环/音量/进度 |
| **图片编辑** | JPEG/PNG/WebP、裁剪、旋转、翻转、缩放、亮度/对比度/饱和度/模糊、文字、形状、贴纸、图片图层、50 步撤销重做、PNG/JPEG 导出 |
| **实用工具** | 自定义倒计时、快捷预设、跨页面持续、完成提示、月历与日期选择 |
| **账户** | 邮箱注册登录、bcrypt 密码、httpOnly Session、路由守卫 |
| **视觉** | 全白背景、宋体标题、细线分隔、无渐变/扫描线/ASCII/终端标签、响应式三端布局 |

---

## 技术栈

- Next.js 15 App Router + React 19 + TypeScript
- Tailwind CSS 3
- Prisma 6 + SQLite
- Zustand
- Fabric.js 7（图片编辑器）
- react-markdown + remark-gfm（Markdown 预览）

---

## 项目结构

```text
src/
├── app/
│   ├── (auth)/                 # 登录 / 注册
│   ├── dashboard/
│   │   ├── notes/              # 笔记管理
│   │   ├── aesthetic/          # 美学空间（音乐 / 图片）
│   │   ├── tools/              # 实用工具（倒计时 / 日历）
│   │   └── ...                 # 旧路由兼容跳转
│   ├── profile/                # 个人中心
│   ├── api/
│   │   ├── music/upload/       # 音乐上传
│   │   └── upload/chunk/       # 文件分片上传
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx                # 产品落地页
├── components/
│   ├── aesthetic/              # 音乐播放器 / 图片编辑器
│   ├── files/                  # 文件抽屉 / 上传组件
│   ├── landing/                # 首页导航、Hero、逐行揭示、功能、页脚
│   ├── layout/                 # 后台布局、音乐单例、倒计时指示、日历
│   ├── dashboard/             # 三节点空间图与动态半调阴影\n│   └── ui/                     # 动效按钮、基础对话框等
├── actions/                    # 文件 / 笔记 / 音乐 / 认证 / 个人资料
├── lib/                        # Prisma、认证、校验、安全、工具函数
├── store/                      # 用户、笔记/音乐、倒计时状态
├── types/                      # 核心类型
└── middleware.ts               # 路由守卫
prisma/
├── schema.prisma
├── seed.ts
└── dev.db
```

---

## 快速开始

### 1. 安装依赖

```bash
npm install
```

### 2. 配置环境变量

```bash
Copy-Item .env.example .env
```

默认 SQLite 配置 `DATABASE_URL="file:./dev.db"` 可直接使用。

### 3. 初始化数据库

```bash
npm run db:push
```

如需演示账号与示例笔记：

```bash
npm run seed
# demo@rainbow-box.com / 123456
```

> `seed` 会清空当前数据库，已有数据时不要执行。

### 4. 启动

```bash
npm run dev
```

访问 [http://localhost:3000](http://localhost:3000)。

---

## 常用脚本

```bash
npm run dev        # 开发服务器
npm run build      # 生产构建
npx tsc --noEmit   # 类型检查
npm run db:push    # 同步数据库结构
npm run seed       # 写入演示数据
```

---


