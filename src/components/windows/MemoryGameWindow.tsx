import React, { useState, useEffect } from 'react';

const CARD_EMOJIS = ['🎮', '🎲', '🎯', '🎪', '🎨', '🎭', '🎸', '🎺'];

interface Card {
  id: number;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export function MemoryGameWindow() {
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCards, setFlippedCards] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [bestScore, setBestScore] = useState<number | null>(null);

  const initializeGame = () => {
    const shuffled = [...CARD_EMOJIS, ...CARD_EMOJIS]
      .sort(() => Math.random() - 0.5)
      .map((emoji, index) => ({
        id: index,
        emoji,
        isFlipped: false,
        isMatched: false,
      }));
    setCards(shuffled);
    setFlippedCards([]);
    setMoves(0);
    setMatches(0);
    setGameWon(false);
  };

  useEffect(() => {
    initializeGame();
  }, []);

  useEffect(() => {
    if (matches === CARD_EMOJIS.length && matches > 0) {
      setGameWon(true);
      if (!bestScore || moves < bestScore) {
        setBestScore(moves);
      }
    }
  }, [matches, moves, bestScore]);

  const handleCardClick = (id: number) => {
    if (isChecking || flippedCards.length >= 2) return;
    if (cards[id].isFlipped || cards[id].isMatched) return;

    const newCards = [...cards];
    newCards[id].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedCards, id];
    setFlippedCards(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      setIsChecking(true);

      const [first, second] = newFlipped;
      if (cards[first].emoji === cards[second].emoji) {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isMatched: true }
                : card
            )
          );
          setMatches((m) => m + 1);
          setFlippedCards([]);
          setIsChecking(false);
        }, 500);
      } else {
        setTimeout(() => {
          setCards((prev) =>
            prev.map((card) =>
              card.id === first || card.id === second
                ? { ...card, isFlipped: false }
                : card
            )
          );
          setFlippedCards([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  return (
    <div className="h-full flex flex-col gap-2 p-2">
      {/* Header */}
      <div className="xp-panel p-2 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs font-bold">🎴 Memory Match</span>
          <span className="text-xs">Moves: <strong>{moves}</strong></span>
          <span className="text-xs">Matches: <strong>{matches}/{CARD_EMOJIS.length}</strong></span>
          {bestScore && (
            <span className="text-xs text-green-600">🏆 Best: {bestScore}</span>
          )}
        </div>
        <button className="xp-button text-xs px-3" onClick={initializeGame}>
          🔄 New Game
        </button>
      </div>

      {/* Game Board */}
      <div className="flex-1 flex items-center justify-center">
        {gameWon ? (
          <div className="xp-panel p-6 text-center">
            <div className="text-4xl mb-2">🎉</div>
            <div className="text-lg font-bold mb-2">Congratulations!</div>
            <div className="text-sm mb-4">You won in {moves} moves!</div>
            <button className="xp-button-primary px-4" onClick={initializeGame}>
              Play Again
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-4 gap-2">
            {cards.map((card) => (
              <button
                key={card.id}
                className={`w-16 h-16 text-2xl flex items-center justify-center transition-all duration-200 ${
                  card.isFlipped || card.isMatched
                    ? 'xp-panel-inset bg-white'
                    : 'xp-button hover:brightness-105'
                } ${card.isMatched ? 'opacity-60' : ''}`}
                onClick={() => handleCardClick(card.id)}
                disabled={card.isMatched}
              >
                {card.isFlipped || card.isMatched ? card.emoji : '❓'}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="xp-panel p-1 text-xs text-center text-muted-foreground">
        Match all pairs of cards in as few moves as possible!
      </div>
    </div>
  );
}
