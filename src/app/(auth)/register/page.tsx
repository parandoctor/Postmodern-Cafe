"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { UserPlus, Mail, Lock, User, Eye, EyeOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { registerUser } from "@/actions/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [error, setError] = React.useState("");
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const result = await registerUser({ name, email, password });
    if (result.success) {
      router.push("/dashboard/files");
    } else {
      setError(result.error ?? "注册失败");
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6">
      {/* Background */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-background" />
      <div className="pointer-events-none absolute -top-40 right-0 h-[600px] w-[600px] rounded-full bg-primary/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-40 left-0 h-[500px] w-[500px] rounded-full bg-purple-500/5 blur-3xl" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="mb-8 text-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-blue-600 shadow-lg shadow-primary/20">
              <span className="text-lg font-bold text-white">R</span>
            </div>
            <span className="text-2xl font-semibold">
              <span className="rainbow-text">收纳盒</span>
            </span>
          </Link>
        </div>

        {/* Card */}
        <div className="rounded-2xl border border-border/50 bg-card/80 p-8 backdrop-blur-xl shadow-xl">
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mb-2 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
              <Sparkles className="h-3 w-3" />
              开始使用
            </div>
            <h1 className="text-2xl font-bold tracking-tight">创建账户</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              注册后即可开始管理你的文件
            </p>
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 rounded-xl bg-destructive/10 p-3 text-sm text-destructive"
            >
              {error}
            </motion.div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="name">昵称</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="name"
                  type="text"
                  placeholder="你的昵称"
                  className="pl-10"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  minLength={2}
                  maxLength={32}
                  autoComplete="name"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">邮箱</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="your@email.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">密码</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="至少6位，包含字母和数字"
                  className="pl-10 pr-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              <p className="text-xs text-muted-foreground">
                至少6个字符，包含字母和数字
              </p>
            </div>

            <Button
              type="submit"
              className="w-full gap-2"
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent" />
              ) : (
                <UserPlus className="h-4 w-4" />
              )}
              {loading ? "注册中..." : "创建账户"}
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-6 text-center text-sm text-muted-foreground">
            已有账户？{" "}
            <a
              href="/login"
              className="font-medium text-primary hover:underline"
            >
              立即登录
            </a>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
