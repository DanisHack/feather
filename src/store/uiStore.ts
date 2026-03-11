import { create } from 'zustand';

interface UIStore {
  sidebarCollapsed: boolean;
  commandBarOpen: boolean;
  activeScreen: string;
  selectedTicker: string | null;
  toggleSidebar: () => void;
  openCommandBar: () => void;
  closeCommandBar: () => void;
  setActiveScreen: (screen: string) => void;
  selectTicker: (ticker: string | null) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  sidebarCollapsed: false,
  commandBarOpen: false,
  activeScreen: '/',
  selectedTicker: null,

  toggleSidebar: () =>
    set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),

  openCommandBar: () => set({ commandBarOpen: true }),
  closeCommandBar: () => set({ commandBarOpen: false }),
  setActiveScreen: (screen) => set({ activeScreen: screen }),
  selectTicker: (ticker) => set({ selectedTicker: ticker }),
}));
