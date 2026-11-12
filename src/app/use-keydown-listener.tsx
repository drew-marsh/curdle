import { useEffect } from 'react';
import { isLetter } from '../data/letters';
import { Game } from './use-game';

export function useKeyDownListener(game: Game) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey) {
      return;
    }

    getKeyHandler(game)(e.key);
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown);
    return () => {
      document.removeEventListener('keydown', handleKeydown);
    };
  });
}

export function getKeyHandler(game: Game) {
  const { win, reset, addLetter, removeLetter, submitEntry, undo, redo } = game;
  return function (key: string) {
    const keyUpper = key.toUpperCase();
    if (isLetter(keyUpper)) {
      addLetter(keyUpper);
    }
    if (key === 'Backspace') {
      removeLetter();
    }
    if (key === 'Enter') {
      if (win) {
        reset();
        return;
      }
      submitEntry();
    }
    if (key === 'ArrowLeft') {
      undo();
    }
    if (key === 'ArrowRight') {
      redo();
    }
  };
}
