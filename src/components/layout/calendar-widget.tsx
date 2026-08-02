"use client";

import * as React from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["一", "二", "三", "四", "五", "六", "日"];

function dateKey(y: number, m: number, d: number): string {
  return `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
}

export function CalendarWidget() {
  const today = new Date();
  const [viewYear, setViewYear] = React.useState(today.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(today.getMonth());
  const [selected, setSelected] = React.useState<string>(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));

  const firstDay = new Date(viewYear, viewMonth, 1);
  const startOffset = (firstDay.getDay() + 6) % 7; // 周一起始
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();

  const cells: Array<number | null> = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);

  const goPrev = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNext = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    setViewYear(today.getFullYear());
    setViewMonth(today.getMonth());
    setSelected(dateKey(today.getFullYear(), today.getMonth(), today.getDate()));
  };

  return (
    <section className="rounded-xl border border-black/10 bg-white/60 backdrop-blur-sm p-3">
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <CalendarDays className="h-4 w-4 text-foreground" />
          <h3 className="text-sm font-semibold tracking-tight">日历</h3>
        </div>
        <div className="flex items-center gap-0.5">
          <button
            onClick={goPrev}
            className="rounded-md p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={goToday}
            className="rounded-md px-1.5 py-0.5 text-xs font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
            title="回到今天"
          >
            {viewYear}年{viewMonth + 1}月
          </button>
          <button
            onClick={goNext}
            className="rounded-md p-1 text-muted-foreground hover:bg-black/5 hover:text-foreground transition-colors"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-0.5 text-center">
        {WEEKDAYS.map((w) => (
          <span key={w} className="py-0.5 text-[10px] font-medium text-muted-foreground">
            {w}
          </span>
        ))}
        {cells.map((d, i) => {
          if (d === null) {
            return <span key={`empty-${i}`} className="py-1" />;
          }
          const key = dateKey(viewYear, viewMonth, d);
          const isToday = key === dateKey(today.getFullYear(), today.getMonth(), today.getDate());
          const isSelected = selected === key;
          return (
            <button
              key={key}
              onClick={() => setSelected(key)}
              className={cn(
                "flex h-7 items-center justify-center rounded-md text-[12px] tabular-nums transition-colors",
                isToday && "bg-foreground font-semibold text-background",
                !isToday && isSelected && "bg-black/10 font-medium",
                !isToday && !isSelected && "text-foreground/80 hover:bg-black/5",
              )}
            >
              {d}
            </button>
          );
        })}
      </div>
    </section>
  );
}
