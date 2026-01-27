import React, { useState, useEffect, useCallback } from 'react';

type Operation = '+' | '-' | '×' | '÷';
type Difficulty = 'easy' | 'medium' | 'hard';

interface Puzzle {
  num1: number;
  num2: number;
  operation: Operation;
  answer: number;
}

export function MathPuzzleWindow() {
  const [difficulty, setDifficulty] = useState<Difficulty>('easy');
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null);
  const [userAnswer, setUserAnswer] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [feedback, setFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);
  const [isPlaying, setIsPlaying] = useState(false);
  const [highScore, setHighScore] = useState(0);

  const generatePuzzle = useCallback((): Puzzle => {
    const operations: Operation[] = 
      difficulty === 'easy' ? ['+', '-'] :
      difficulty === 'medium' ? ['+', '-', '×'] :
      ['+', '-', '×', '÷'];

    const operation = operations[Math.floor(Math.random() * operations.length)];
    
    let num1: number, num2: number, answer: number;

    const maxNum = difficulty === 'easy' ? 20 : difficulty === 'medium' ? 50 : 100;

    switch (operation) {
      case '+':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * maxNum) + 1;
        answer = num1 + num2;
        break;
      case '-':
        num1 = Math.floor(Math.random() * maxNum) + 1;
        num2 = Math.floor(Math.random() * num1) + 1;
        answer = num1 - num2;
        break;
      case '×':
        num1 = Math.floor(Math.random() * 12) + 1;
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = num1 * num2;
        break;
      case '÷':
        num2 = Math.floor(Math.random() * 12) + 1;
        answer = Math.floor(Math.random() * 12) + 1;
        num1 = num2 * answer;
        break;
      default:
        num1 = 1; num2 = 1; answer = 2;
    }

    return { num1, num2, operation, answer };
  }, [difficulty]);

  const startGame = () => {
    setScore(0);
    setStreak(0);
    setTimeLeft(30);
    setIsPlaying(true);
    setPuzzle(generatePuzzle());
    setUserAnswer('');
    setFeedback(null);
  };

  const checkAnswer = () => {
    if (!puzzle || !userAnswer) return;

    const isCorrect = parseInt(userAnswer) === puzzle.answer;
    setFeedback(isCorrect ? 'correct' : 'wrong');

    if (isCorrect) {
      const points = (streak + 1) * (difficulty === 'easy' ? 10 : difficulty === 'medium' ? 20 : 30);
      setScore((s) => s + points);
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }

    setTimeout(() => {
      setPuzzle(generatePuzzle());
      setUserAnswer('');
      setFeedback(null);
    }, 500);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      checkAnswer();
    }
  };

  useEffect(() => {
    if (!isPlaying) return;

    const timer = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setIsPlaying(false);
          if (score > highScore) {
            setHighScore(score);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPlaying, score, highScore]);

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      {/* Header */}
      <div className="xp-panel p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">🧮 Math Challenge</span>
          {isPlaying && (
            <>
              <span className="text-xs">Score: <strong>{score}</strong></span>
              <span className="text-xs">Streak: <strong>🔥 {streak}</strong></span>
              <span className={`text-xs font-bold ${timeLeft <= 10 ? 'text-red-600' : ''}`}>
                ⏱️ {timeLeft}s
              </span>
            </>
          )}
          {highScore > 0 && (
            <span className="text-xs text-green-600">🏆 High: {highScore}</span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <select
            className="xp-input text-xs"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as Difficulty)}
            disabled={isPlaying}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 flex items-center justify-center">
        {!isPlaying ? (
          <div className="xp-panel p-6 text-center">
            {timeLeft === 0 ? (
              <>
                <div className="text-4xl mb-2">⏰</div>
                <div className="text-lg font-bold mb-2">Time's Up!</div>
                <div className="text-sm mb-1">Final Score: <strong>{score}</strong></div>
                {score >= highScore && score > 0 && (
                  <div className="text-sm text-green-600 mb-4">🎉 New High Score!</div>
                )}
              </>
            ) : (
              <>
                <div className="text-4xl mb-2">🧮</div>
                <div className="text-lg font-bold mb-2">Math Puzzle</div>
                <div className="text-sm mb-4 text-muted-foreground">
                  Solve as many problems as you can in 30 seconds!
                </div>
              </>
            )}
            <button className="xp-button-primary px-6" onClick={startGame}>
              {timeLeft === 0 ? 'Play Again' : 'Start Game'}
            </button>
          </div>
        ) : puzzle && (
          <div className="xp-panel p-8 text-center">
            <div 
              className={`text-4xl font-bold mb-6 transition-colors ${
                feedback === 'correct' ? 'text-green-600' :
                feedback === 'wrong' ? 'text-red-600' : ''
              }`}
            >
              {puzzle.num1} {puzzle.operation} {puzzle.num2} = ?
            </div>
            <div className="flex items-center justify-center gap-2">
              <input
                type="number"
                className="xp-input text-2xl text-center w-32"
                value={userAnswer}
                onChange={(e) => setUserAnswer(e.target.value)}
                onKeyPress={handleKeyPress}
                autoFocus
                placeholder="?"
              />
              <button
                className="xp-button-primary px-4 py-2"
                onClick={checkAnswer}
                disabled={!userAnswer}
              >
                ✓
              </button>
            </div>
            {feedback && (
              <div className={`mt-4 text-lg ${
                feedback === 'correct' ? 'text-green-600' : 'text-red-600'
              }`}>
                {feedback === 'correct' ? '✓ Correct!' : `✗ Answer: ${puzzle.answer}`}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="xp-panel p-1 text-xs text-center text-muted-foreground">
        Type your answer and press Enter. Build streaks for bonus points!
      </div>
    </div>
  );
}
