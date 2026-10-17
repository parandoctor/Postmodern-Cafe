import Link from "next/link";

export function Footer() {
  return (
    <footer className="border-t border-[#ececec] px-5 py-10 sm:px-8">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5 text-[12px] text-[#999] sm:flex-row sm:items-center sm:justify-between">
        <span>© {new Date().getFullYear()} 后现代咖啡馆 · Rainbow-box</span>
        <div className="flex gap-6">
          <Link href="/login" className="hover:text-black">登录</Link>
          <Link href="/register" className="hover:text-black">注册</Link>
          <span>记录 · 声音 · 时间</span>
        </div>
      </div>
    </footer>
  );
}
