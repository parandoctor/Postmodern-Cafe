"use client";

import * as React from "react";
import { Bell, Pause, Play, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import { countdownRemaining, formatCountdown, useCountdownStore } from "@/store/countdown";
import { CalendarWidget } from "@/components/layout/calendar-widget";

const PRESETS = [5, 10, 25, 45];

export default function ToolsPage() {
  const store = useCountdownStore();
  const [hours, setHours] = React.useState(0);
  const [minutes, setMinutes] = React.useState(25);
  const [seconds, setSeconds] = React.useState(0);
  const [now, setNow] = React.useState(Date.now());
  const [notice, setNotice] = React.useState("");

  React.useEffect(() => {
    if (!store.running) return;
    const timer = window.setInterval(() => setNow(Date.now()), 500);
    return () => window.clearInterval(timer);
  }, [store.running]);

  React.useEffect(() => {
    if (store.running) return;
    const total = Math.max(1000, (hours * 3600 + minutes * 60 + seconds) * 1000);
    if (total !== store.durationMs) store.setDuration(total);
  }, [hours, minutes, seconds, store]);

  const remaining = countdownRemaining({ ...store, remainingMs: store.remainingMs });
  const display = store.completed ? "00:00" : formatCountdown(remaining);

  const applyPreset = (value: number) => {
    setHours(0);
    setMinutes(value);
    setSeconds(0);
    store.setDuration(value * 60 * 1000);
    store.reset();
  };

  const toggle = () => {
    if (store.running) {
      store.pause();
      setNow(Date.now());
      return;
    }
    if (store.remainingMs > 0 && !store.completed) store.resume();
    else store.start((hours * 3600 + minutes * 60 + seconds) * 1000);
  };

  const toggleNotify = async () => {
    if (store.notify) {
      store.setNotify(false);
      return;
    }
    if (typeof Notification === "undefined") {
      setNotice("当前浏览器不支持通知");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") store.setNotify(true);
    else setNotice("通知权限未开启，结束时仍会播放提示音");
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-7 border-b border-[#dedede] pb-5">
        <p className="text-[11px] tracking-[0.2em] text-[#999]">UTILITIES</p>
        <h1 className="mt-2 font-editorial text-[32px] tracking-[-0.03em]">实用工具</h1>
        <p className="mt-2 text-[12px] text-[#888]">给一段时间，也给一天一个位置。</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
        <section className="border border-[#dedede] p-6">
          <div className="border-b border-[#ededed] pb-5">
            <p className="text-[11px] tracking-[0.18em] text-[#999]">COUNTDOWN</p>
            <h2 className="mt-1 text-[18px] font-medium">{store.completed ? "时间到了" : store.running ? "正在倒计时" : "设置倒计时"}</h2>
          </div>

          <div className="py-10 text-center font-mono text-[54px] tabular-nums tracking-[-0.04em] sm:text-[68px]">{display}</div>

          <div className="mx-auto grid max-w-sm grid-cols-3 gap-3">
            {[
              { label: "时", value: hours, set: setHours, max: 99 },
              { label: "分", value: minutes, set: setMinutes, max: 59 },
              { label: "秒", value: seconds, set: setSeconds, max: 59 },
            ].map((item) => (
              <label key={item.label} className="text-center">
                <span className="mb-1 block text-[10px] text-[#999]">{item.label}</span>
                <input type="number" min={0} max={item.max} value={item.value} disabled={store.running} onChange={(event) => item.set(Math.max(0, Math.min(item.max, Number(event.target.value))))} className="h-11 w-full border border-[#dedede] bg-white text-center text-[15px] tabular-nums outline-none focus:border-black disabled:bg-[#fafafa]" />
              </label>
            ))}
          </div>

          <div className="mt-5 flex flex-wrap justify-center gap-1.5">
            {PRESETS.map((value) => <button key={value} onClick={() => applyPreset(value)} disabled={store.running} className="border border-[#dedede] px-3 py-1.5 text-[11px] text-[#777] hover:border-black hover:text-black disabled:opacity-40">{value} 分钟</button>)}
          </div>

          <div className="mt-8 flex items-center justify-center gap-3">
            <button onClick={toggle} className="flex items-center gap-2 bg-[#111] px-5 py-2.5 text-[12px] text-white">{store.running ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}{store.running ? "暂停" : store.completed ? "重新开始" : "开始"}</button>
            <button onClick={() => { store.reset(); setNow(Date.now()); }} className="flex items-center gap-1.5 border border-[#dedede] px-4 py-2.5 text-[12px] text-[#666] hover:border-black hover:text-black"><RotateCcw className="h-3.5 w-3.5" />重置</button>
            <button onClick={() => void toggleNotify()} className={cn("flex items-center gap-1.5 border px-4 py-2.5 text-[12px]", store.notify ? "border-black text-black" : "border-[#dedede] text-[#888]")}><Bell className="h-3.5 w-3.5" />{store.notify ? "已开启提醒" : "完成提醒"}</button>
          </div>
          {(notice || store.completed) && <p className="mt-4 text-center text-[11px] text-[#888]">{notice || "倒计时结束，可以休息一下。"}</p>}
        </section>

        <CalendarWidget />
      </div>
    </div>
  );
}
