import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { guestStore } from '../lib/guestStore';

interface GuestModeContextValue {
  isGuestMode: boolean;
  enterGuestMode: () => string;
  exitGuestMode: () => void;
}

const GuestModeContext = createContext<GuestModeContextValue | null>(null);

export function GuestModeProvider({ children }: { children: ReactNode }) {
  const [isGuestMode, setIsGuestMode] = useState(false);

  const enterGuestMode = useCallback(() => {
    guestStore.reset();
    const dashboardId = guestStore.createDashboard('My Budget');
    setIsGuestMode(true);
    return dashboardId as unknown as string;
  }, []);

  const exitGuestMode = useCallback(() => {
    setIsGuestMode(false);
    guestStore.reset();
  }, []);

  const value = useMemo(
    () => ({ isGuestMode, enterGuestMode, exitGuestMode }),
    [isGuestMode, enterGuestMode, exitGuestMode]
  );

  return <GuestModeContext.Provider value={value}>{children}</GuestModeContext.Provider>;
}

export function useGuestMode() {
  const ctx = useContext(GuestModeContext);
  if (!ctx) {
    throw new Error('useGuestMode must be used inside <GuestModeProvider>');
  }
  return ctx;
}
