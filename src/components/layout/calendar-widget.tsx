"use client";

import * as React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function dateKey(year: number, month: number, day: number) {
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

export function CalendarWidget() {
  const today = new Date();
  const [year, setYear] = React.useState(today.getFullYear());
  const [month, setMonth] = React.useState(today.getMonth());
  const [selected, setSelected] = React.useState(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));

  const offset = (new Date(year, month, 1).getDay() + 6) % 7;
  const days = new Date(year, month + 1, 0).getDate();
  const cells: Array<number | null> = Array.from({ length: offset }, () => null);
  for (let day = 1; day <= days; day++) cells.push(day);

  const move = (delta: number) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const goToday = () => {
    setYear(today.getFullYear());
    setMonth(today.getMonth());
    setSelected(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  return (
    <section className="border border-[#dedede] p-6">
      <div className="flex items-center justify-between border-b border-[#ededed] pb-4">
        <div>
          <p className="text-[11px] tracking-[0.18em] text-[#999]">CALENDAR</p>
          <h2 className="mt-1 text-[18px] font-medium">{year} 年 {month + 1} 月</h2>
        </div>
        <div className="flex items-center gap-1">
          <button onClick={() => move(-1)} className="p-2 text-[#777] hover:text-black" aria-label="上个月"><ChevronLeft className="h-4 w-4" /></button>
          <button onClick={goToday} className="px-2 py-1 text-[11px] text-[#888] hover:text-black">今天</button>
          <button onClick={() => move(1)} className="p-2 text-[#777] hover:text-black" aria-label="下个月"><ChevronRight className="h-4 w-4" /></button>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((label) => <span key={label} className="py-1 text-[10px] text-[#aaa]">{label}</span>)}
        {cells.map((day, index) => {
          if (day === null) return <span key={`empty-${index}`} className="h-9" />;
          const key = dateKey(year, month, day);
          const isToday = key === dateKey(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected = key === selected;
          return (
            <button key={key} onClick={() => setSelected(key)} className={cn("flex h-9 items-center justify-center rounded-full text-[12px] tabular-nums transition-colors", isToday ? "bg-[#111] text-white" : isSelected ? "bg-[#f0f0f0] text-black" : "text-[#666] hover:bg-[#f5f5f5] hover:text-black")}>
              {day}
            </button>
          );
        })}
      </div>
      <p className="mt-4 border-t border-[#ededed] pt-3 text-[11px] text-[#999]">已选择 {selected}</p>
    </section>
  );
}
