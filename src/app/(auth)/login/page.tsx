"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { loginUser } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");
    setLoading(true);
    const result = await loginUser({ email, password });
    if (result.success) router.push("/dashboard");
    else {
      setError(result.error ?? "登录失败");
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-[#ececec]">
        <div className="mx-auto flex h-16 max-w-5xl items-center justify-between px-5 sm:px-8">
          <Link href="/" className="text-[15px] font-medium">后现代咖啡馆</Link>
          <Link href="/" className="text-[12px] text-[#888] hover:text-black">返回首页</Link>
        </div>
      </header>
      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="w-full max-w-[380px]">
          <p className="text-[11px] tracking-[0.24em] text-[#999]">WELCOME BACK</p>
          <h1 className="mt-4 font-editorial text-[38px] tracking-[-0.03em]">登录账户</h1>
          <p className="mt-3 text-[13px] leading-6 text-[#777]">回到你的笔记、声音和时间里。</p>

          {error && <div className="mt-6 border border-[#d8d8d8] bg-[#fafafa] px-4 py-3 text-[13px] text-[#444]">{error}</div>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <label className="block">
              <span className="mb-2 block text-[12px] text-[#777]">邮箱</span>
              <input type="email" value={email} onChange={(event) => setEmail(event.target.value)} required autoComplete="email" className="h-11 w-full border border-[#d8d8d8] bg-white px-3 text-[14px] outline-none transition-colors focus:border-black" placeholder="you@example.com" />
            </label>
            <label className="block">
              <span className="mb-2 block text-[12px] text-[#777]">密码</span>
              <span className="relative block">
                <input type={showPassword ? "text" : "password"} value={password} onChange={(event) => setPassword(event.target.value)} required autoComplete="current-password" className="h-11 w-full border border-[#d8d8d8] bg-white px-3 pr-11 text-[14px] outline-none transition-colors focus:border-black" placeholder="输入密码" />
                <button type="button" onClick={() => setShowPassword((value) => !value)} className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-[#999] hover:text-black" aria-label={showPassword ? "隐藏密码" : "显示密码"}>
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </span>
            </label>
            <button type="submit" disabled={loading} className="w-full bg-[#111] py-3 text-[13px] text-white transition-opacity hover:opacity-80 disabled:opacity-50">{loading ? "登录中..." : "进入空间"}</button>
          </form>

          <p className="mt-6 text-[12px] text-[#888]">还没有账户？ <Link href="/register" className="text-black underline underline-offset-4">立即注册</Link></p>
        </div>
      </main>
    </div>
  );
}

