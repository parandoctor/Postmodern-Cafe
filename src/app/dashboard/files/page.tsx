import { MyFilesView } from "@/components/files/views/my-files-view";
import { CategoriesView } from "@/components/files/views/categories-view";
import { FavoritesView } from "@/components/files/views/favorites-view";
import { RecentView } from "@/components/files/views/recent-view";
import { RecycleView } from "@/components/files/views/recycle-view";

type FileTab = "files" | "categories" | "favorites" | "recent" | "recycle";

const TAB_KEYS: FileTab[] = ["files", "categories", "favorites", "recent", "recycle"];

/**
 * 文件管理主入口（默认「我的文件」）。
 * 兼容旧链接 ?tab=files|categories|favorites|recent|recycle，
 * 具体板块同时提供独立路由：/dashboard/categories、/favorites、/recent、/recycle
 */
export default async function FileManagementPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const params = await searchParams;
  const tab = (TAB_KEYS.includes(params.tab as FileTab) ? params.tab : "files") as FileTab;

  switch (tab) {
    case "categories":
      return <CategoriesView />;
    case "favorites":
      return <FavoritesView />;
    case "recent":
      return <RecentView />;
    case "recycle":
      return <RecycleView />;
    default:
      return <MyFilesView />;
  }
}