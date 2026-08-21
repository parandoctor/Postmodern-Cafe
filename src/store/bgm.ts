// ============================================================
// 全局背景音乐状态（默认背景音乐）
// 主页 / 登录注册页 / 后台系统 共用；
// 与音乐盒（本地曲库）互斥：任一侧开始播放时另一侧暂停
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
