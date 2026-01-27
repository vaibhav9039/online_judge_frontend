import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useWindows } from '../contexts/WindowContext';
import { XPWindow } from '../components/xp/XPWindow';
import { Taskbar } from '../components/xp/Taskbar';
import { DesktopIcon } from '../components/xp/DesktopIcon';
import { ProblemsWindow } from '../components/windows/ProblemsWindow';
import { SubmissionsWindow } from '../components/windows/SubmissionsWindow';
import { AdminPanelWindow } from '../components/windows/AdminPanelWindow';
import { CodeRunnerWindow } from '../components/windows/CodeRunnerWindow';
import { MemoryGameWindow } from '../components/windows/MemoryGameWindow';
import { MathPuzzleWindow } from '../components/windows/MathPuzzleWindow';
import { WordScrambleWindow } from '../components/windows/WordScrambleWindow';
import { SlidingPuzzleWindow } from '../components/windows/SlidingPuzzleWindow';
import { PaintWindow } from '../components/windows/PaintWindow';
import blissWallpaper from '../assets/xp-bliss.jpg';

export function Desktop() {
  const { user } = useAuth();
  const { windows, openWindow } = useWindows();

  const handleOpenWindow = (id: string, title: string, icon: string, Component: React.ComponentType) => {
    openWindow({
      id,
      title,
      icon,
      component: Component,
      position: { x: 100 + Math.random() * 100, y: 50 + Math.random() * 50 },
      size: { width: 700, height: 500 },
    });
  };

  return (
    <div
      className="h-screen w-full relative overflow-hidden"
      style={{
        backgroundImage: `url(${blissWallpaper})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
      }}
    >
      {/* Desktop Icons */}
      <div className="absolute top-4 left-4 flex flex-col gap-2">
        {/* Guest Apps - Always visible */}
        <DesktopIcon
          icon="💻"
          label="Code Runner"
          onClick={() => handleOpenWindow('coderunner', 'Code Runner - Java/C++', '💻', CodeRunnerWindow)}
        />
        <DesktopIcon
          icon="🎨"
          label="Paint"
          onClick={() => handleOpenWindow('paint', 'Paint', '🎨', PaintWindow)}
        />

        {/* Logged-in user apps */}
        {user && (
          <>
            <DesktopIcon
              icon="📚"
              label="Problems"
              onClick={() => handleOpenWindow('problems', 'Problems', '📚', ProblemsWindow)}
            />
            <DesktopIcon
              icon="📋"
              label="My Submissions"
              onClick={() => handleOpenWindow('submissions', 'My Submissions', '📋', SubmissionsWindow)}
            />
            
            {/* Brain Teasers */}
            <DesktopIcon
              icon="🎴"
              label="Memory Game"
              onClick={() => handleOpenWindow('memory', 'Memory Game', '🎴', MemoryGameWindow)}
            />
            <DesktopIcon
              icon="🧮"
              label="Math Puzzle"
              onClick={() => handleOpenWindow('math', 'Math Challenge', '🧮', MathPuzzleWindow)}
            />
            <DesktopIcon
              icon="🔤"
              label="Word Scramble"
              onClick={() => handleOpenWindow('wordscramble', 'Word Scramble', '🔤', WordScrambleWindow)}
            />
            <DesktopIcon
              icon="🧩"
              label="Sliding Puzzle"
              onClick={() => handleOpenWindow('slidingpuzzle', 'Sliding Puzzle', '🧩', SlidingPuzzleWindow)}
            />
          </>
        )}

        {user?.role === 'admin' && (
          <DesktopIcon
            icon="⚙️"
            label="Admin Panel"
            onClick={() => handleOpenWindow('admin', 'Admin Panel', '⚙️', AdminPanelWindow)}
          />
        )}
        
        <DesktopIcon
          icon="🗑️"
          label="Recycle Bin"
          onClick={() => {}}
        />
      </div>

      {/* Windows */}
      {windows.map((window) => (
        <XPWindow
          key={window.id}
          id={window.id}
          title={window.title}
          icon={window.icon}
          isMinimized={window.isMinimized}
          isMaximized={window.isMaximized}
          zIndex={window.zIndex}
          position={window.position}
          size={window.size}
        >
          <window.component />
        </XPWindow>
      ))}

      {/* Taskbar */}
      <Taskbar />
    </div>
  );
}
