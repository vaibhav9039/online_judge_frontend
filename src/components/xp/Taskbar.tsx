import React, { useState } from 'react';
import { useWindows } from '../../contexts/WindowContext';
import { useAuth } from '../../contexts/AuthContext';
import { StartMenu } from './StartMenu';

export function Taskbar() {
  const { windows, restoreWindow, focusWindow, activeWindowId } = useWindows();
  const { user } = useAuth();
  const [showStartMenu, setShowStartMenu] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  React.useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const handleTaskbarButtonClick = (windowId: string, isMinimized: boolean) => {
    if (isMinimized) {
      restoreWindow(windowId);
    } else {
      focusWindow(windowId);
    }
  };

  return (
    <>
      {showStartMenu && <StartMenu onClose={() => setShowStartMenu(false)} />}
      <div className="xp-taskbar fixed bottom-0 left-0 right-0">
        {/* Start Button */}
        <button
          className="xp-start-button"
          onClick={() => setShowStartMenu(!showStartMenu)}
        >
          <span className="text-lg">🪟</span>
          <span className="italic">start</span>
        </button>

        {/* Quick Launch */}
        <div className="border-l border-blue-300/30 ml-2 pl-2 flex gap-1">
          {/* Separator */}
        </div>

        {/* Running Windows */}
        <div className="flex-1 flex items-center px-2">
          {windows.map((window) => (
            <button
              key={window.id}
              className={`xp-taskbar-button ${activeWindowId === window.id && !window.isMinimized ? 'active' : ''}`}
              onClick={() => handleTaskbarButtonClick(window.id, window.isMinimized)}
            >
              <span>{window.icon}</span>
              <span className="truncate">{window.title}</span>
            </button>
          ))}
        </div>

        {/* System Tray */}
        <div className="flex items-center gap-2 px-2 bg-gradient-to-b from-blue-400/50 to-blue-600/50 h-full">
          <span className="text-white text-xs">👤 {user?.username}</span>
          <div className="border-l border-blue-300/30 h-4" />
          <span className="text-white text-xs">
            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>
    </>
  );
}
