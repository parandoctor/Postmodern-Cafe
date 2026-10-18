"use client";

import * as React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

export function Dialog({ open, onClose, title, description, children, className, maxWidth = "max-w-2xl" }: {
  open: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  className?: string;
  maxWidth?: string;
}) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <button aria-label="关闭" className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className={cn("relative z-10 max-h-[88vh] w-full overflow-y-auto border border-[#d8d8d8] bg-white p-6", maxWidth, className)}>
        <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center text-[#777] hover:text-black" aria-label="关闭"><X className="h-4 w-4" /></button>
        {(title || description) && <div className="mb-5 pr-8"><h2 className="text-[18px] font-medium">{title}</h2>{description && <p className="mt-1 text-[12px] leading-5 text-[#888]">{description}</p>}</div>}
        {children}
      </div>
    </div>
  );
}
