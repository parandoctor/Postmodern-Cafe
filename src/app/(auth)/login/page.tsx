"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { LogIn, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { loginUser } from "@/actions/auth";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await loginUser({ email, password });
    if (result.success) {
      router.push("/dashboard/files");
    } else {
      setError(result.error ?? "登录失败");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center border border-white/20 bg-white/5">
              <Image src="/images/cafe-logo-white.png" alt="后现代咖啡馆" width={28} height={28} className="h-7 w-7 object-contain" />
            </div>
            <span className="text-2xl font-semibold text-white">后现代咖啡馆</span>
          </Link>
        </div>

        {/* Card */}
        <div className="border border-white/15 bg-black/5 p-8">
          {/* Header */}
          <div className="mb-8 text-center">
            <h1 className="text-2xl font-bold tracking-tight text-white">登录账户</h1>
            <p className="mt-1 text-sm text-white/50">
              登录以管理你的文件
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 border border-red-400/40 bg-red-500/10 p-3 text-sm text-red-300"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-white/70">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10 rounded-none !border-white/20 !bg-white/5 !text-white placeholder:!text-white/35"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-white/70">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="输入密码"
                  className="pl-10 pr-10 rounded-none !border-white/20 !bg-white/5 !text-white placeholder:!text-white/35"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full gap-2 rounded-none border border-white/25 bg-white text-black hover:bg-white/90 hover:text-black"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <LogIn className="h-4 w-4" />
              )}
              {loading ? "登录中..." : "登录"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-white/50">
            还没有账户？{" "}
            <Link
              href="/register"
              className="font-medium underline underline-offset-4 hover:text-white"
            >
              立即注册
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
