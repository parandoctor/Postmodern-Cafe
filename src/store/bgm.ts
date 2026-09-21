// ============================================================
// 全局背景音乐状态（默认背景音乐）
// 主页 / 登录注册页 / 后台系统 共用；
// 与音乐盒（本地曲库）完全独立：两者互不影响，可同时播放
// ============================================================

import { create } from "zustand";

interface BgmState {
  playing: boolean;
  setPlaying: (playing: boolean) => void;
}

export const useBgmStore = create<BgmState>((set) => ({
  playing: false,
  setPlaying: (playing) => set({ playing }),
}));
