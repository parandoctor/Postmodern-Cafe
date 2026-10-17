import Link from "next/link";
import { MotionButton } from "@/components/ui/motion-button";

export function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-[#ececec] bg-white/90 backdrop-blur-md">
      <nav className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link href="/" className="group text-[15px] font-medium tracking-wide">
          后现代咖啡馆
          <span className="mt-0.5 block h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
        </Link>
        <div className="hidden items-center gap-8 md:flex">
          <a href="#features" className="group relative text-[13px] text-[#777] transition-colors hover:text-black">
            三个空间
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
          </a>
          <a href="#about" className="group relative text-[13px] text-[#777] transition-colors hover:text-black">
            关于
            <span className="absolute -bottom-1 left-0 h-px w-0 bg-black transition-all duration-300 group-hover:w-full" />
          </a>
        </div>
        <div className="flex items-center gap-2">
          <MotionButton href="/login" variant="ghost" size="sm">登录</MotionButton>
          <MotionButton href="/register" variant="primary" size="sm" arrow>进入空间</MotionButton>
        </div>
      </nav>
    </header>
  );
}
