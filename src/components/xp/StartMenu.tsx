import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useWindows } from '../../contexts/WindowContext';
import { ProblemsWindow } from '../../components/windows/ProblemsWindow';
import { SubmissionsWindow } from '../../components/windows/SubmissionsWindow';
import { AdminPanelWindow } from '../../components/windows/AdminPanelWindow';
import { CodeRunnerWindow } from '../../components/windows/CodeRunnerWindow';
import { MemoryGameWindow } from '../../components/windows/MemoryGameWindow';
import { MathPuzzleWindow } from '../../components/windows/MathPuzzleWindow';
import { WordScrambleWindow } from '../../components/windows/WordScrambleWindow';
import { SlidingPuzzleWindow } from '../../components/windows/SlidingPuzzleWindow';
import { PaintWindow } from '../../components/windows/PaintWindow';

interface StartMenuProps {
  onClose: () => void;
}

export function StartMenu({ onClose }: StartMenuProps) {
  const { user, logout } = useAuth();
  const { openWindow } = useWindows();

  const handleOpenWindow = (id: string, title: string, icon: string, component: React.ComponentType) => {
    openWindow({
      id,
      title,
      icon,
      component,
      position: { x: 100 + Math.random() * 100, y: 50 + Math.random() * 50 },
      size: { width: 700, height: 500 },
    });
    onClose();
  };

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      <div className="fixed bottom-8 left-0 z-50 w-80 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="xp-start-menu-header p-3 rounded-t-lg flex items-center gap-3">
          <div className="w-12 h-12 bg-white/20 rounded flex items-center justify-center text-2xl">
            👤
          </div>
          <div className="text-white">
            <div className="font-bold">{user?.username}</div>
            <div className="text-xs opacity-80">{user?.role === 'admin' ? 'Administrator' : 'User'}</div>
          </div>
        </div>

        {/* Content */}
        <div className="flex bg-card">
          {/* Left side - Programs */}
          <div className="flex-1 p-2 bg-white border-r border-border overflow-auto max-h-80">
            <div className="text-xs font-bold text-muted-foreground mb-2 px-2">Guest Apps</div>
            
            <button
              className="xp-menu-item w-full text-left"
              onClick={() => handleOpenWindow('coderunner', 'Code Runner - Java/C++', '💻', CodeRunnerWindow)}
            >
              <span className="text-lg">💻</span>
              <span>Code Runner</span>
            </button>
            
            <button
              className="xp-menu-item w-full text-left"
              onClick={() => handleOpenWindow('paint', 'Paint', '🎨', PaintWindow)}
            >
              <span className="text-lg">🎨</span>
              <span>Paint</span>
            </button>

            {user && (
              <>
                <div className="border-t border-border my-2" />
                <div className="text-xs font-bold text-muted-foreground mb-2 px-2">Learning</div>
                
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('problems', 'Problems', '📚', ProblemsWindow)}
                >
                  <span className="text-lg">📚</span>
                  <span>Problems</span>
                </button>
                
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('submissions', 'My Submissions', '📋', SubmissionsWindow)}
                >
                  <span className="text-lg">📋</span>
                  <span>My Submissions</span>
                </button>

                <div className="border-t border-border my-2" />
                <div className="text-xs font-bold text-muted-foreground mb-2 px-2">Games & Puzzles</div>

                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('memory', 'Memory Game', '🎴', MemoryGameWindow)}
                >
                  <span className="text-lg">🎴</span>
                  <span>Memory Game</span>
                </button>
                
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('math', 'Math Challenge', '🧮', MathPuzzleWindow)}
                >
                  <span className="text-lg">🧮</span>
                  <span>Math Puzzle</span>
                </button>
                
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('wordscramble', 'Word Scramble', '🔤', WordScrambleWindow)}
                >
                  <span className="text-lg">🔤</span>
                  <span>Word Scramble</span>
                </button>
                
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('slidingpuzzle', 'Sliding Puzzle', '🧩', SlidingPuzzleWindow)}
                >
                  <span className="text-lg">🧩</span>
                  <span>Sliding Puzzle</span>
                </button>
              </>
            )}

            {user?.role === 'admin' && (
              <>
                <div className="border-t border-border my-2" />
                <button
                  className="xp-menu-item w-full text-left"
                  onClick={() => handleOpenWindow('admin', 'Admin Panel', '⚙️', AdminPanelWindow)}
                >
                  <span className="text-lg">⚙️</span>
                  <span>Admin Panel</span>
                </button>
              </>
            )}
          </div>

          {/* Right side - Shortcuts */}
          <div className="w-28 p-2 xp-start-menu-sidebar">
            <button className="xp-menu-item w-full text-left text-xs py-0.5">
              <span>My Documents</span>
            </button>
            <button className="xp-menu-item w-full text-left text-xs py-0.5">
              <span>My Computer</span>
            </button>
            <button className="xp-menu-item w-full text-left text-xs py-0.5">
              <span>Control Panel</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="xp-start-menu-footer p-2 flex justify-end gap-2 rounded-b">
          <button
            className="xp-button text-xs flex items-center gap-1"
            onClick={() => {
              logout();
              onClose();
            }}
          >
            <span>🔌</span>
            <span>Log Off</span>
          </button>
          <button className="xp-button text-xs flex items-center gap-1">
            <span>⏻</span>
            <span>Shut Down</span>
          </button>
        </div>
      </div>
    </>
  );
}
