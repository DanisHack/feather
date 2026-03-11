import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { TitleBar } from './TitleBar';
import { CommandBar } from './CommandBar';
import { AuthGate } from '../components/AuthGate';
import { ErrorBoundary } from '../components/ErrorBoundary';
import { useUIStore } from '../store/uiStore';
import { useAuth } from '../hooks/useAuth';
import { useCheckoutReturn } from '../hooks/useCheckoutReturn';
import { useSubscriptionSync } from '../hooks/useSubscriptionSync';

export function AppShell() {
  const { commandBarOpen, openCommandBar, closeCommandBar } = useUIStore();

  // Initialize auth (Clerk or mock)
  useAuth();
  useCheckoutReturn();
  useSubscriptionSync();

  // Listen for ⌘K — both Electron IPC and browser keydown
  useEffect(() => {
    // Electron IPC from main process globalShortcut
    const electronAPI = (window as unknown as Record<string, unknown>).electronAPI as {
      onToggleCommandBar?: (cb: () => void) => () => void;
    } | undefined;

    const cleanupIPC = electronAPI?.onToggleCommandBar?.(() => {
      if (commandBarOpen) {
        closeCommandBar();
      } else {
        openCommandBar();
      }
    });

    // Browser keydown fallback
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (commandBarOpen) {
          closeCommandBar();
        } else {
          openCommandBar();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      cleanupIPC?.();
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [commandBarOpen, openCommandBar, closeCommandBar]);

  return (
    <AuthGate>
      <div className="h-screen w-screen flex flex-col bg-bg-primary overflow-hidden">
        <TitleBar />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar />
          <main className="flex-1 overflow-hidden">
            <ErrorBoundary>
              <Outlet />
            </ErrorBoundary>
          </main>
        </div>
        <CommandBar />
      </div>
    </AuthGate>
  );
}
