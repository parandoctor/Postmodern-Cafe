"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProfile, updateProfile, updatePassword } from "@/actions/profile";
import { MotionButton } from "@/components/ui/motion-button";

export default function ProfilePage() {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [saving, setSaving] = React.useState(false);
  const [message, setMessage] = React.useState<{ type: "success" | "error"; text: string } | null>(null);

  React.useEffect(() => {
    void getProfile().then((result) => {
      if (result.success && result.data) {
        setName(result.data.name ?? "");
        setEmail(result.data.email ?? "");
        setBio(result.data.bio ?? "");
      }
    });
  }, []);

  const saveProfile = async () => {
    setSaving(true);
    setMessage(null);
    const result = await updateProfile({ name, bio });
    setMessage({ type: result.success ? "success" : "error", text: result.success ? "个人资料已保存" : result.error ?? "保存失败" });
    setSaving(false);
  };

  const changePassword = async () => {
    if (!currentPassword || !newPassword) return;
    setSaving(true);
    setMessage(null);
    const result = await updatePassword({ currentPassword, newPassword });
    setMessage({ type: result.success ? "success" : "error", text: result.success ? "密码已更新" : result.error ?? "更新失败" });
    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
    }
    setSaving(false);
  };

  const inputCls = "h-11 w-full border border-[#d8d8d8] bg-white px-3 text-[14px] outline-none transition-colors focus:border-black";

  return (
    <div className="min-h-screen bg-white">
      <header className="border-b border-[#ececec]">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5 sm:px-8">
          <MotionButton href="/dashboard" variant="ghost" size="sm" icon={<ArrowLeft className="h-4 w-4" />}>返回空间</MotionButton>
          <span className="text-[13px] text-[#999]">个人中心</span>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-5 py-12 sm:px-8">
        <h1 className="font-editorial text-[38px] tracking-[-0.03em]">账户与偏好</h1>
        <p className="mt-3 text-[13px] text-[#777]">只留下必要的信息。</p>

        {message && <div className={`mt-6 border px-4 py-3 text-[13px] ${message.type === "success" ? "border-[#d8d8d8] bg-[#fafafa] text-[#444]" : "border-[#c9c9c9] text-[#333]"}`}>{message.text}</div>}

        <section className="mt-10 border-t border-[#dedede] pt-8">
          <h2 className="text-[16px] font-medium">个人资料</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label><span className="mb-2 block text-[12px] text-[#777]">昵称</span><input value={name} onChange={(event) => setName(event.target.value)} className={inputCls} /></label>
            <label><span className="mb-2 block text-[12px] text-[#777]">邮箱</span><input value={email} readOnly className={`${inputCls} bg-[#fafafa] text-[#888]`} /></label>
          </div>
          <label className="mt-5 block"><span className="mb-2 block text-[12px] text-[#777]">个人简介</span><textarea value={bio} onChange={(event) => setBio(event.target.value)} maxLength={200} rows={3} className="w-full resize-none border border-[#d8d8d8] bg-white px-3 py-2 text-[14px] outline-none focus:border-black" /></label>
          <MotionButton onClick={saveProfile} disabled={saving} variant="primary" size="md" floating arrow className="mt-5">{saving ? "保存中..." : "保存资料"}</MotionButton>
        </section>

        <section className="mt-12 border-t border-[#dedede] pt-8">
          <h2 className="text-[16px] font-medium">修改密码</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <label><span className="mb-2 block text-[12px] text-[#777]">当前密码</span><input type="password" value={currentPassword} onChange={(event) => setCurrentPassword(event.target.value)} className={inputCls} /></label>
            <label><span className="mb-2 block text-[12px] text-[#777]">新密码</span><input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)} className={inputCls} /></label>
          </div>
          <MotionButton onClick={changePassword} disabled={saving || !currentPassword || !newPassword} variant="secondary" size="md" className="mt-5">更新密码</MotionButton>
        </section>
      </main>
    </div>
  );
}


