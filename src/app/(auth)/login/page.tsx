"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Entrance } from "@/components/ui/entrance";
import { Eye, EyeOff } from "lucide-react";
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

  const inputCls =
    "w-full border-0 border-b border-white/25 bg-black/30 px-3 py-3.5 font-mono text-white outline-none transition-all placeholder:text-white/65 placeholder:uppercase placeholder:tracking-[0.14em] focus:border-white focus:bg-black/45 focus:shadow-[0_1px_0_rgba(255,255,255,0.5)]";

  return (
    <div className="relative flex min-h-screen items-center overflow-hidden">
      {/* 巨型描边数字 */}

      <Entrance
        as="div"
        from={{ opacity: 0, y: 20 }}
        to={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 ml-[8vw] w-[min(400px,84vw)] max-h-[calc(100vh-3rem)] overflow-y-auto"
      >
        <div
          className="border border-white/15 bg-black/10 px-8 py-10 shadow-[0_0_80px_rgba(0,0,0,0.55)]"
          style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)",
            clipPath:
              "polygon(0 0,100% 0,100% calc(100% - 22px),calc(100% - 22px) 100%,0 100%)",
          }}
        >
          <div className="mb-6 font-mono text-[11px] tracking-[0.3em] text-white/50">
            POSTMODERN.CAFÉ
          </div>

          <h1
            className="mb-8 font-extrabold leading-[0.95] tracking-[-0.03em] text-white"
            style={{ textShadow: "0 1px 3px rgba(0,0,0,0.9)",
              fontFamily: "Bahnschrift, Arial, sans-serif",
              fontSize: "clamp(46px, 6vw, 72px)",
            }}
          >
            登录
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
                autoComplete="current-password"
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
              className="mt-2 auth-btn font-mono text-sm disabled:opacity-60"
            >
              {loading ? "登录中..." : "进入 →"}
            </button>
          </form>

          <p className="mt-6 font-mono text-xs text-white/50">
            还没有账户？{" "}
            <Link href="/register" className="text-white hover:underline">
              立即注册
            </Link>
          </p>
        </div>
      </Entrance>
    </div>
  );
}







