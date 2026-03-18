import { useCallback } from 'react';
import { useClerk } from '@clerk/clerk-react';
import { useUserStore } from '../store/userStore';

const hasClerk = Boolean(import.meta.env.VITE_CLERK_PUBLISHABLE_KEY);

function useClerkSignOut() {
  const { signOut } = useClerk();
  const { clearUser } = useUserStore();

  return useCallback(() => {
    signOut();
    clearUser();
  }, [signOut, clearUser]);
}

function useMockSignOut() {
  const { clearUser } = useUserStore();
  return useCallback(() => {
    clearUser();
  }, [clearUser]);
}

export const useSignOut = hasClerk ? useClerkSignOut : useMockSignOut;
