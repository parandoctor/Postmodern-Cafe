"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  User,
  Mail,
  Lock,
  Save,
  Camera,
  AtSign,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { updateProfile, updatePassword } from "@/actions/profile";
import { useUserStore } from "@/store";

export default function ProfilePage() {
  const router = useRouter();
  const { user, setUser } = useUserStore();
  const [name, setName] = React.useState(user?.name ?? "");
  const [bio, setBio] = React.useState(user?.bio ?? "");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSaveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateProfile({ name, bio });
    if (result.success) {
      setUser(result.data ?? null);
      setMessage({ type: "success", text: "个人资料已更新" });
    } else {
      setMessage({ type: "error", text: result.error ?? "更新失败" });
    }
    setSaving(false);
  };

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setSaving(true);
    setMessage(null);
    const result = await updatePassword({ currentPassword, newPassword });
    if (result.success) {
      setMessage({ type: "success", text: "密码已更新" });
      setCurrentPassword("");
      setNewPassword("");
    } else {
      setMessage({ type: "error", text: result.error ?? "更新失败" });
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">个人中心</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          管理你的个人信息和账户设置
        </p>
      </div>

      {/* Message */}
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className={`
            rounded-xl p-4 text-sm
            ${message.type === "success" ? "bg-green-500/10 text-green-600 dark:text-green-400" : "bg-destructive/10 text-destructive"}
          `}
        >
          {message.text}
        </motion.div>
      )}

      {/* Profile Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
      >
        <h2 className="text-lg font-semibold mb-6">个人资料</h2>

        {/* Avatar */}
        <div className="mb-8 flex items-center gap-6">
          <div className="relative group">
            <Avatar className="h-20 w-20 ring-2 ring-border/50 ring-offset-2 ring-offset-background">
              <AvatarImage src={user?.image ?? ""} alt="头像" />
              <AvatarFallback className="bg-primary/10 text-2xl text-primary">
                {user?.name?.[0]?.toUpperCase() ?? "U"}
              </AvatarFallback>
            </Avatar>
            <button className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
              <Camera className="h-6 w-6 text-white" />
            </button>
          </div>
          <div>
            <p className="font-medium">{user?.name ?? "用户"}</p>
            <p className="text-sm text-muted-foreground">{user?.email ?? ""}</p>
          </div>
        </div>

        {/* Form */}
        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="name">昵称</Label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="name"
                className="pl-10"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="你的昵称"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">邮箱</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                className="pl-10"
                value={user?.email ?? ""}
                disabled
                placeholder="your@email.com"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              邮箱暂不支持修改
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">个人简介</Label>
            <textarea
              id="bio"
              className="flex min-h-[100px] w-full rounded-xl border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 transition-all"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="介绍一下自己..."
              maxLength={200}
            />
            <p className="text-xs text-muted-foreground text-right">{bio.length}/200</p>
          </div>

          <Button onClick={handleSaveProfile} disabled={saving} className="gap-2">
            <Save className="h-4 w-4" />
            {saving ? "保存中..." : "保存修改"}
          </Button>
        </div>
      </motion.div>

      {/* Password Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm"
      >
        <h2 className="text-lg font-semibold mb-6">修改密码</h2>

        <div className="space-y-5">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">当前密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="currentPassword"
                type="password"
                className="pl-10"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="输入当前密码"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="newPassword">新密码</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="newPassword"
                type="password"
                className="pl-10"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="输入新密码"
              />
            </div>
            <p className="text-xs text-muted-foreground">
              至少6个字符，包含字母和数字
            </p>
          </div>

          <Button
            onClick={handleChangePassword}
            disabled={saving || !currentPassword || !newPassword}
            variant="outline"
            className="gap-2"
          >
            <Save className="h-4 w-4" />
            {saving ? "更新中..." : "更新密码"}
          </Button>
        </div>
      </motion.div>
    </div>
  );
}
