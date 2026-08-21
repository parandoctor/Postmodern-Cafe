"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import { MyFilesView } from "@/components/files/views/my-files-view";
import { CategoriesView } from "@/components/files/views/categories-view";
import { FavoritesView } from "@/components/files/views/favorites-view";
import { RecentView } from "@/components/files/views/recent-view";
import { RecycleView } from "@/components/files/views/recycle-view";

type FileTab = "files" | "categories" | "favorites" | "recent" | "recycle";

const TABS: { key: FileTab; label: string }[] = [
  { key: "files", label: "我的文件" },
  { key: "categories", label: "分类管理" },
  { key: "favorites", label: "收藏夹" },
  { key: "recent", label: "最近使用" },
  { key: "recycle", label: "回收站" },
];

export default function FileManagementPage() {
  // 默认主页为分类管理
  const [tab, setTab] = React.useState<FileTab>("categories");

  return (
    <div className="space-y-4">
      {/* 五个分栏：切换 我的文件 / 分类管理 / 收藏夹 / 最近使用 / 回收站 */}
      <div className="flex items-center gap-1 overflow-x-auto rounded-lg border border-whisper bg-white/60 p-1 backdrop-blur-sm">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 whitespace-nowrap rounded-md px-3 py-2 text-sm font-medium transition-colors",
              tab === t.key
                ? "bg-foreground text-background"
                : "text-muted-foreground hover:bg-secondary hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* 对应分栏内容 */}
      {tab === "files" && <MyFilesView />}
      {tab === "categories" && <CategoriesView />}
      {tab === "favorites" && <FavoritesView />}
      {tab === "recent" && <RecentView />}
      {tab === "recycle" && <RecycleView />}
    </div>
  );
}
