import React, { useState, useRef, useEffect } from 'react';
import { useWindows } from '../../contexts/WindowContext';
import { X, Minus, Square } from 'lucide-react';

interface XPWindowProps {
  id: string;
  title: string;
  icon: string;
  children: React.ReactNode;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
  position: { x: number; y: number };
  size: { width: number; height: number };
}

export function XPWindow({
  id,
  title,
  icon,
  children,
  isMinimized,
  isMaximized,
  zIndex,
  position,
  size,
}: XPWindowProps) {
  const { closeWindow, minimizeWindow, maximizeWindow, restoreWindow, focusWindow, updateWindowPosition, activeWindowId } = useWindows();
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const windowRef = useRef<HTMLDivElement>(null);
  
  const isActive = activeWindowId === id;

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.window-controls')) return;
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    });
    focusWindow(id);
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!isDragging || isMaximized) return;
      const newX = Math.max(0, e.clientX - dragOffset.x);
      const newY = Math.max(0, e.clientY - dragOffset.y);
      updateWindowPosition(id, { x: newX, y: newY });
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging, dragOffset, id, isMaximized, updateWindowPosition]);

  if (isMinimized) return null;

  const windowStyle = isMaximized
    ? { top: 0, left: 0, right: 0, bottom: 32, width: '100%', height: 'calc(100vh - 32px)', zIndex }
    : { top: position.y, left: position.x, width: size.width, height: size.height, zIndex };

  return (
    <div
      ref={windowRef}
      className="xp-window fixed flex flex-col"
      style={windowStyle}
      onMouseDown={() => focusWindow(id)}
    >
      {/* Title Bar */}
      <div
        className={isActive ? 'xp-titlebar' : 'xp-titlebar-inactive'}
        onMouseDown={handleMouseDown}
        style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
      >
        <div className="flex items-center gap-2">
          <span className="text-sm">{icon}</span>
          <span className="text-sm">{title}</span>
        </div>
        <div className="window-controls flex gap-1">
          <button
            onClick={() => minimizeWindow(id)}
            className="w-5 h-5 flex items-center justify-center bg-gradient-to-b from-blue-300 to-blue-500 rounded-sm border border-white/30 hover:from-blue-400 hover:to-blue-600"
          >
            <Minus size={10} />
          </button>
          <button
            onClick={() => (isMaximized ? restoreWindow(id) : maximizeWindow(id))}
            className="w-5 h-5 flex items-center justify-center bg-gradient-to-b from-blue-300 to-blue-500 rounded-sm border border-white/30 hover:from-blue-400 hover:to-blue-600"
          >
            <Square size={10} />
          </button>
          <button
            onClick={() => closeWindow(id)}
            className="w-5 h-5 flex items-center justify-center bg-gradient-to-b from-red-400 to-red-600 rounded-sm border border-white/30 hover:from-red-500 hover:to-red-700"
          >
            <X size={10} />
          </button>
        </div>
      </div>

      {/* Menu Bar */}
      <div className="bg-card border-b border-border px-1 py-0.5 flex gap-4 text-xs">
        <span className="hover:bg-primary hover:text-white px-1 cursor-pointer">File</span>
        <span className="hover:bg-primary hover:text-white px-1 cursor-pointer">Edit</span>
        <span className="hover:bg-primary hover:text-white px-1 cursor-pointer">View</span>
        <span className="hover:bg-primary hover:text-white px-1 cursor-pointer">Help</span>
      </div>

      {/* Content */}
      <div className="flex-1 bg-card overflow-auto xp-scroll p-2">
        {children}
      </div>

      {/* Status Bar */}
      <div className="bg-card border-t border-border px-2 py-0.5 text-xs text-muted-foreground">
        Ready
      </div>
    </div>
  );
}
