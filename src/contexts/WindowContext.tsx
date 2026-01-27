import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { XPWindow } from '../types';

interface WindowContextType {
  windows: XPWindow[];
  activeWindowId: string | null;
  openWindow: (window: Omit<XPWindow, 'zIndex' | 'isMinimized' | 'isMaximized'>) => void;
  closeWindow: (id: string) => void;
  minimizeWindow: (id: string) => void;
  maximizeWindow: (id: string) => void;
  restoreWindow: (id: string) => void;
  focusWindow: (id: string) => void;
  updateWindowPosition: (id: string, position: { x: number; y: number }) => void;
}

const WindowContext = createContext<WindowContextType | undefined>(undefined);

export function WindowProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<XPWindow[]>([]);
  const [activeWindowId, setActiveWindowId] = useState<string | null>(null);
  const [maxZIndex, setMaxZIndex] = useState(1);

  const openWindow = useCallback((windowData: Omit<XPWindow, 'zIndex' | 'isMinimized' | 'isMaximized'>) => {
    setWindows((prev) => {
      const existing = prev.find((w) => w.id === windowData.id);
      if (existing) {
        // If already open, just focus it
        return prev.map((w) =>
          w.id === windowData.id
            ? { ...w, isMinimized: false, zIndex: maxZIndex + 1 }
            : w
        );
      }
      return [
        ...prev,
        {
          ...windowData,
          zIndex: maxZIndex + 1,
          isMinimized: false,
          isMaximized: false,
        },
      ];
    });
    setMaxZIndex((prev) => prev + 1);
    setActiveWindowId(windowData.id);
  }, [maxZIndex]);

  const closeWindow = useCallback((id: string) => {
    setWindows((prev) => prev.filter((w) => w.id !== id));
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const minimizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMinimized: true } : w))
    );
    setActiveWindowId((prev) => (prev === id ? null : prev));
  }, []);

  const maximizeWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isMaximized: true } : w))
    );
  }, []);

  const restoreWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) =>
        w.id === id ? { ...w, isMinimized: false, isMaximized: false, zIndex: maxZIndex + 1 } : w
      )
    );
    setMaxZIndex((prev) => prev + 1);
    setActiveWindowId(id);
  }, [maxZIndex]);

  const focusWindow = useCallback((id: string) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, zIndex: maxZIndex + 1 } : w))
    );
    setMaxZIndex((prev) => prev + 1);
    setActiveWindowId(id);
  }, [maxZIndex]);

  const updateWindowPosition = useCallback((id: string, position: { x: number; y: number }) => {
    setWindows((prev) =>
      prev.map((w) => (w.id === id ? { ...w, position } : w))
    );
  }, []);

  return (
    <WindowContext.Provider
      value={{
        windows,
        activeWindowId,
        openWindow,
        closeWindow,
        minimizeWindow,
        maximizeWindow,
        restoreWindow,
        focusWindow,
        updateWindowPosition,
      }}
    >
      {children}
    </WindowContext.Provider>
  );
}

export function useWindows() {
  const context = useContext(WindowContext);
  if (!context) {
    throw new Error('useWindows must be used within a WindowProvider');
  }
  return context;
}
