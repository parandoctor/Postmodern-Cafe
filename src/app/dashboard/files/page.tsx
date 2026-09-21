"use client";

import * as React from "react";
import { MyFilesView } from "@/components/files/views/my-files-view";
import { CategoriesView } from "@/components/files/views/categories-view";
import { FavoritesView } from "@/components/files/views/favorites-view";
import { RecentView } from "@/components/files/views/recent-view";
import { RecycleView } from "@/components/files/views/recycle-view";

type FileTab = "files" | "categories" | "favorites" | "recent" | "recycle";

const TAB_KEYS: FileTab[] = ["files", "categories", "favorites", "recent", "recycle"];

export default function FileManagementPage() {
  // 默认主页为分类管理；子视图由左侧栏二级目录的 ?tab= 决定
  const [tab, setTab] = React.useState<FileTab>("categories");

  React.useEffect(() => {
    const read = () => {
      const value = new URLSearchParams(window.location.search).get("tab") as FileTab | null;
      setTab(value && TAB_KEYS.includes(value) ? value : "categories");
    };
    read();
    window.addEventListener("popstate", read);
    return () => window.removeEventListener("popstate", read);
  }, []);

  return (
    <div className="space-y-4">
      {tab === "files" && <MyFilesView />}
      {tab === "categories" && <CategoriesView />}
      {tab === "favorites" && <FavoritesView />}
      {tab === "recent" && <RecentView />}
      {tab === "recycle" && <RecycleView />}
    </div>
  );
}
