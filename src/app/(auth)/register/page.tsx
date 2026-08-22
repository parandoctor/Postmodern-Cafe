"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Entrance } from "@/components/ui/entrance";
import { Eye, EyeOff } from "lucide-react";
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

  const inputCls =
    "w-full border-0 border-b border-[#2a2a28] bg-transparent px-1 py-3.5 font-mono text-white outline-none placeholder:text-white/35 placeholder:uppercase placeholder:tracking-[0.14em] focus:border-white";

  return (
    <div className="relative min-h-screen overflow-hidden">

      <Entrance
        as="div"
        from={{ opacity: 0, y: 20 }}
        to={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="absolute left-[8%] top-1/2 z-10 w-[min(400px,84vw)] -translate-y-1/2"
      >
        <div
          className="border border-[#2a2a28] bg-black/60 px-8 py-10 backdrop-blur-sm"
          style={{
            clipPath:
              "polygon(0 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%)",
          }}
        >
          <div className="mb-6 font-mono text-[11px] tracking-[0.3em] text-white/50">
            POSTMODERN.CAFÉ
          </div>

          <h1
            className="mb-8 font-extrabold leading-[0.95] tracking-[-0.03em] text-white"
            style={{
              fontFamily: "Bahnschrift, Arial, sans-serif",
              fontSize: "clamp(46px, 6vw, 72px)",
            }}
          >
            创建
            <br />
            <span className="text-white/50">账户</span>
          </h1>

          {error && (
            <Entrance
              as="div"
              from={{ opacity: 0, y: -10 }}
              to={{ opacity: 1, y: 0 }}
              className="mb-4 border border-red-400/40 bg-red-500/10 p-3 font-mono text-sm text-red-300"
            >
              {error}
            </Entrance>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <input
              id="name"
              type="text"
              placeholder="NAME / 昵称"
              className={inputCls}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              minLength={2}
              maxLength={32}
              autoComplete="name"
            />
            <input
              id="email"
              type="email"
              placeholder="EMAIL"
              className={inputCls}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="PASSWORD"
                className={`${inputCls} pr-10`}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-1 top-1/2 -translate-y-1/2 text-white/40 transition-colors hover:text-white"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-2 w-full bg-white py-4 font-mono text-sm text-black transition-colors hover:bg-white/85 disabled:opacity-60"
            >
              {loading ? "创建中..." : "创建账户 →"}
            </button>
          </form>

          <p className="mt-6 font-mono text-xs text-white/50">
            已有账户？{" "}
            <Link href="/login" className="text-white hover:underline">
              立即登录
            </Link>
          </p>
        </div>
      </Entrance>
    </div>
  );
}
