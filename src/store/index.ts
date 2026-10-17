import { create } from "zustand";
import type { UserProfile } from "@/types";
import { setActiveUserId } from "@/lib/utils";

interface UserState {
  user: UserProfile | null;
  isLoading: boolean;
  setUser: (user: UserProfile | null) => void;
  setLoading: (loading: boolean) => void;
}

export const useUserStore = create<UserState>((set) => ({
  user: null,
  isLoading: true,
  setUser: (user) => {
    set({ user });
    setActiveUserId(user?.id ?? null);
  },
  setLoading: (loading) => set({ isLoading: loading }),
}));
