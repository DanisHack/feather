import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { User } from '../types';

export interface Preferences {
  darkMode: boolean;
  notifications: boolean;
  morningBriefEmails: boolean;
}

export interface OnboardingData {
  selectedSectors: string[];
  selectedStocks: string[];
}

interface UserStore {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  hasSeenWelcome: boolean;
  preferences: Preferences;
  onboarding: OnboardingData;
  setUser: (user: User) => void;
  clearUser: () => void;
  setLoading: (loading: boolean) => void;
  setHasSeenWelcome: () => void;
  updateSubscription: (subscription: User['subscription']) => void;
  updatePreference: (key: keyof Preferences, value: boolean) => void;
  updateOnboarding: (data: Partial<OnboardingData>) => void;
  completeOnboarding: () => void;
}

// User-scoped storage reads the user ID from state being written
// and stores under feather-user:{userId} key
function getUserScopedStorage() {
  let currentUserId: string | null = null;

  return createJSONStorage(() => ({
    getItem: (name: string) => {
      // Try scoped key first, then fall back to last-known user
      const lastId = currentUserId ?? localStorage.getItem('feather-last-user-id');
      if (lastId) {
        const scoped = localStorage.getItem(`${name}:${lastId}`);
        if (scoped) return scoped;
      }
      return localStorage.getItem(name);
    },
    setItem: (name: string, value: string) => {
      // Extract user ID from the serialized state to scope the key
      try {
        const parsed = JSON.parse(value);
        const userId = parsed?.state?.user?.id;
        if (userId) {
          currentUserId = userId;
          localStorage.setItem('feather-last-user-id', userId);
          localStorage.setItem(`${name}:${userId}`, value);
          return;
        }
      } catch {
        // fall through
      }
      localStorage.setItem(name, value);
    },
    removeItem: (name: string) => {
      const lastId = currentUserId ?? localStorage.getItem('feather-last-user-id');
      if (lastId) {
        localStorage.removeItem(`${name}:${lastId}`);
      }
      localStorage.removeItem(name);
    },
  }));
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      loading: true,
      hasSeenWelcome: false,
      preferences: {
        darkMode: true,
        notifications: true,
        morningBriefEmails: false,
      },
      onboarding: {
        selectedSectors: [],
        selectedStocks: [],
      },

      setUser: (user) => set({ user, isAuthenticated: true, loading: false }),

      clearUser: () => set({ user: null, isAuthenticated: false, loading: false }),

      setLoading: (loading) => set({ loading }),

      setHasSeenWelcome: () => set({ hasSeenWelcome: true }),

      updateSubscription: (subscription) =>
        set((state) => {
          if (!state.user) return state;
          return { user: { ...state.user, subscription } };
        }),

      updatePreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      updateOnboarding: (data) =>
        set((state) => ({
          onboarding: { ...state.onboarding, ...data },
        })),

      completeOnboarding: () => set({ hasSeenWelcome: true }),
    }),
    {
      name: 'feather-user',
      storage: getUserScopedStorage(),
      partialize: (state) => ({
        user: state.user,
        hasSeenWelcome: state.hasSeenWelcome,
        preferences: state.preferences,
        onboarding: state.onboarding,
      }),
      onRehydrateStorage: () => (state) => {
        if (state?.user) {
          state.isAuthenticated = true;
          state.loading = false;
        }
      },
    },
  ),
);
