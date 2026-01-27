import React, { useState, useEffect, useCallback } from 'react';

const WORD_LISTS = {
  easy: ['CAT', 'DOG', 'SUN', 'CUP', 'HAT', 'PEN', 'RED', 'BIG', 'RUN', 'FUN'],
  medium: ['APPLE', 'HOUSE', 'WATER', 'CHAIR', 'PHONE', 'LIGHT', 'MUSIC', 'DANCE', 'HAPPY', 'SMILE'],
  hard: ['COMPUTER', 'ELEPHANT', 'SUNSHINE', 'BIRTHDAY', 'MOUNTAIN', 'LANGUAGE', 'CHAMPION', 'TREASURE', 'KEYBOARD', 'ADVENTURE'],
};

type Difficulty = 'easy' | 'medium' | 'hard';

export function WordScrambleWindow() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [currentWord, setCurrentWord] = useState('');
  const [scrambled, setScrambled] = useState('');
  const [userGuess, setUserGuess] = useState('');
  const [score, setScore] = useState(0);
  const [round, setRound] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | 'hint' | null>(null);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  const scrambleWord = (word: string): string => {
    const arr = word.split('');
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    // Make sure it's actually scrambled
    if (arr.join('') === word) {
      return scrambleWord(word);
    }
    return arr.join('');
  };

  const startNewRound = useCallback(() => {
    const words = WORD_LISTS[difficulty];
    const availableWords = words.filter((w) => !usedWords.includes(w));
    
    if (availableWords.length === 0) {
      setGameOver(true);
      return;
    }

    const word = availableWords[Math.floor(Math.random() * availableWords.length)];
    setCurrentWord(word);
    setScrambled(scrambleWord(word));
    setUserGuess('');
    setFeedback(null);
    setUsedWords((prev) => [...prev, word]);
  }, [difficulty, usedWords]);

  const startGame = () => {
    setScore(0);
    setRound(0);
    setHintsUsed(0);
    setGameOver(false);
    setUsedWords([]);
    setFeedback(null);
  };

  useEffect(() => {
    if (!gameOver && usedWords.length === 0) {
      startNewRound();
    }
  }, [gameOver, usedWords.length, startNewRound]);

  const checkGuess = () => {
    if (!userGuess.trim()) return;

    if (userGuess.toUpperCase() === currentWord) {
      const points = (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30) - (hintsUsed * 5);
      setScore((s) => s + Math.max(points, 5));
      setFeedback('correct');
      setRound((r) => r + 1);
      
      setTimeout(() => {
        startNewRound();
      }, 1000);
    } else {
      setFeedback('wrong');
      setTimeout(() => setFeedback(null), 1000);
    }
  };

  const showHint = () => {
    if (hintsUsed < currentWord.length - 2) {
      setHintsUsed((h) => h + 1);
      setFeedback('hint');
      setTimeout(() => setFeedback(null), 1500);
    }
  };

  const getHintDisplay = () => {
    if (hintsUsed === 0) return scrambled;
    
    let result = scrambled.split('');
    for (let i = 0; i < hintsUsed && i < currentWord.length; i++) {
      result[i] = currentWord[i];
    }
    return result.join('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkGuess();
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      {/* Header */}
      <div className="xp-panel p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">🔤 Word Scramble</span>
          <span className="text-xs">Score: <strong>{score}</strong></span>
          <span className="text-xs">Round: <strong>{round + 1}</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <select
            className="xp-input text-xs"
            value={difficulty}
            onChange={(e) => {
              setDifficulty(e.target.value as Difficulty);
              startGame();
            }}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
          <button className="xp-button text-xs px-2" onClick={startGame}>
            🔄 Reset
          </button>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        {gameOver ? (
          <div className="xp-panel p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-2">Congratulations!</div>
            <div className="text-sm mb-1">You completed all words!</div>
            <div className="text-sm mb-4">Final Score: <strong>{score}</strong></div>
            <button className="xp-button-primary px-6" onClick={startGame}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="xp-panel p-8 text-center">
            <div className="text-sm text-muted-foreground mb-2">Unscramble this word:</div>
            <div 
              className={`text-4xl font-bold mb-6 tracking-widest transition-colors ${
                feedback === 'correct' ? 'text-green-600' :
                feedback === 'wrong' ? 'text-red-600' :
                feedback === 'hint' ? 'text-blue-600' : ''
              }`}
            >
              {hintsUsed > 0 ? (
                <span>
                  <span className="text-green-600">{currentWord.slice(0, hintsUsed)}</span>
                  {scrambled.slice(hintsUsed)}
                </span>
              ) : (
                scrambled
              )}
            </div>
            
            <div className="flex items-center justify-center gap-2 mb-4">
              <input
                type="text"
                className="xp-input text-xl text-center uppercase tracking-wider"
                style={{ width: `${currentWord.length * 30}px` }}
                value={userGuess}
                onChange={(e) => setUserGuess(e.target.value.toUpperCase())}
                onKeyPress={handleKeyPress}
                maxLength={currentWord.length}
                autoFocus
                placeholder={'_'.repeat(currentWord.length)}
              />
            </div>

            <div className="flex items-center justify-center gap-2">
              <button
                className="xp-button-primary px-4"
                onClick={checkGuess}
                disabled={!userGuess.trim()}
              >
                ✓ Check
              </button>
              <button
                className="xp-button px-4"
                onClick={showHint}
                disabled={hintsUsed >= currentWord.length - 2}
              >
                💡 Hint ({hintsUsed}/{currentWord.length - 2})
              </button>
              <button
                className="xp-button px-4"
                onClick={startNewRound}
              >
                ⏭️ Skip
              </button>
            </div>

            {feedback === 'correct' && (
              <div className="mt-4 text-lg text-green-600">✓ Correct! +{(difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30) - (hintsUsed * 5)} points</div>
            )}
            {feedback === 'wrong' && (
              <div className="mt-4 text-lg text-red-600">✗ Try again!</div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="xp-panel p-1 text-xs text-center text-muted-foreground">
        Rearrange the letters to form a word. Use hints sparingly - they cost points!
      </div>
    </div>
  );
}
