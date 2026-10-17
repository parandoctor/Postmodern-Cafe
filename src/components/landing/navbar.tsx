import Link from "next/link";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ececec] bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="text-[15px] font-medium tracking-wide">后现代咖啡馆</Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="text-[13px] text-[#777] transition-colors hover:text-black">三个空间</a>
          <a href="#about" className="text-[13px] text-[#777] transition-colors hover:text-black">关于</a>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/login" className="px-3 py-2 text-[13px] text-[#666] transition-colors hover:text-black">登录</Link>
          <Link href="/register" className="border border-[#111] px-4 py-2 text-[13px] transition-colors hover:bg-[#111] hover:text-white">进入空间</Link>
        </div>
      </nav>
    </header>
  );
}
