import React, { useState, useEffect, useCallback } from 'react';

type GridSize = 3 | 4 | 5;

export function SlidingPuzzleWindow() {
  const [gridSize, setGridSize] = useState<GridSize>(3);
  const [tiles, setTiles] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [bestMoves, setBestMoves] = useState<Record<GridSize, number | null>>({
    3: null,
    4: null,
    5: null,
  });
  const [timer, setTimer] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  const initializePuzzle = useCallback(() => {
    const totalTiles = gridSize * gridSize;
    let shuffled: number[];
    
    do {
      shuffled = Array.from({ length: totalTiles - 1 }, (_, i) => i + 1);
      shuffled.push(0); // Empty tile
      
      // Shuffle
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
    } while (!isSolvable(shuffled, gridSize));

    setTiles(shuffled);
    setMoves(0);
    setIsWon(false);
    setTimer(0);
    setIsPlaying(true);
  }, [gridSize]);

  const isSolvable = (puzzle: number[], size: number): boolean => {
    let inversions = 0;
    const flat = puzzle.filter((n) => n !== 0);
    
    for (let i = 0; i < flat.length; i++) {
      for (let j = i + 1; j < flat.length; j++) {
        if (flat[i] > flat[j]) inversions++;
      }
    }

    if (size % 2 === 1) {
      return inversions % 2 === 0;
    } else {
      const emptyRow = Math.floor(puzzle.indexOf(0) / size);
      return (inversions + emptyRow) % 2 === 1;
    }
  };

  const checkWin = useCallback((currentTiles: number[]) => {
    const solution = Array.from({ length: gridSize * gridSize - 1 }, (_, i) => i + 1);
    solution.push(0);
    return JSON.stringify(currentTiles) === JSON.stringify(solution);
  }, [gridSize]);

  const handleTileClick = (index: number) => {
    if (isWon || tiles[index] === 0) return;

    const emptyIndex = tiles.indexOf(0);
    const row = Math.floor(index / gridSize);
    const col = index % gridSize;
    const emptyRow = Math.floor(emptyIndex / gridSize);
    const emptyCol = emptyIndex % gridSize;

    const isAdjacent =
      (Math.abs(row - emptyRow) === 1 && col === emptyCol) ||
      (Math.abs(col - emptyCol) === 1 && row === emptyRow);

    if (isAdjacent) {
      const newTiles = [...tiles];
      [newTiles[index], newTiles[emptyIndex]] = [newTiles[emptyIndex], newTiles[index]];
      setTiles(newTiles);
      setMoves((m) => m + 1);

      if (checkWin(newTiles)) {
        setIsWon(true);
        setIsPlaying(false);
        const currentBest = bestMoves[gridSize];
        if (!currentBest || moves + 1 < currentBest) {
          setBestMoves((prev) => ({ ...prev, [gridSize]: moves + 1 }));
        }
      }
    }
  };

  useEffect(() => {
    initializePuzzle();
  }, [gridSize, initializePuzzle]);

  useEffect(() => {
    if (!isPlaying) return;
    
    const interval = setInterval(() => {
      setTimer((t) => t + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getTileSize = () => {
    switch (gridSize) {
      case 3: return 'w-20 h-20 text-2xl';
      case 4: return 'w-16 h-16 text-xl';
      case 5: return 'w-12 h-12 text-lg';
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      {/* Header */}
      <div className="xp-panel p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">🧩 Sliding Puzzle</span>
          <span className="text-xs">Moves: <strong>{moves}</strong></span>
          <span className="text-xs">⏱️ {formatTime(timer)}</span>
          {bestMoves[gridSize] && (
            <span className="text-xs text-green-600">🏆 Best: {bestMoves[gridSize]}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="xp-input text-xs"
            value={gridSize}
            onChange={(e) => setGridSize(Number(e.target.value) as GridSize)}
          >
            <option value={3}>3×3 (Easy)</option>
            <option value={4}>4×4 (Medium)</option>
            <option value={5}>5×5 (Hard)</option>
          </select>
          <button className="xp-button text-xs px-3" onClick={initializePuzzle}>
            🔄 Shuffle
          </button>
        </div>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        {isWon ? (
          <div className="xp-panel p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-2">Puzzle Solved!</div>
            <div className="text-sm mb-1">Moves: <strong>{moves}</strong></div>
            <div className="text-sm mb-4">Time: <strong>{formatTime(timer)}</strong></div>
            <button className="xp-button-primary px-6" onClick={initializePuzzle}>
              Play Again
            </button>
          </div>
        ) : (
          <div 
            className="xp-panel-inset p-2"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${gridSize}, 1fr)`,
              gap: '4px',
            }}
          >
            {tiles.map((tile, index) => (
              <button
                key={index}
                className={`${getTileSize()} font-bold flex items-center justify-center transition-all ${
                  tile === 0 
                    ? 'bg-gray-300 border-2 border-dashed border-gray-400' 
                    : 'xp-button hover:brightness-105'
                }`}
                onClick={() => handleTileClick(index)}
                disabled={tile === 0}
              >
                {tile !== 0 && tile}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="xp-panel p-1 text-xs text-center text-muted-foreground">
        Click tiles adjacent to the empty space to move them. Arrange numbers in order!
      </div>
    </div>
  );
}
