import { useState } from 'react';
import { Letter } from '../data/letters';
import { Guessed } from '../data/types';
import _ from 'lodash';
import { answerWords } from '../data/answer-words';
import { guessWords } from '../data/guess-words';
import { colorGuess } from '../logic/color-guess';
import { makesValidWord } from '../logic/makes-valid-word';

export function useGame() {
  const [entry, addLetter, removeLetter, clearEntry] = useEntry();
  const {
    guesseds,
    addGuessed,
    undoGuessed,
    redoGuessed,
    clearGuesseds,
    clearUndid,
  } = useGuesseds();
  const [hardMode, setHardMode] = useState(false);
  function toggleHardMode() {
    clearUndid();
    setHardMode(!hardMode);
  }
  const lastGuess =
    guesseds.length > 0 ? guesseds[guesseds.length - 1] : undefined;
  const win = !!lastGuess?.every(gl => gl.color === 'green');

  function submitEntry() {
    if (!makesValidWord(entry)) {
      return;
    }
    const guessed = colorGuess(
      entry,
      guesseds,
      hardMode ? guessWords : answerWords
    );
    addGuessed(guessed);
    clearEntry();
  }

  function undo() {
    if (entry.length > 0) {
      clearEntry();
      return;
    }
    undoGuessed();
  }

  function redo() {
    if (entry.length > 0) {
      return;
    }
    redoGuessed();
  }

  return {
    entry,
    guesseds,
    win,
    hardMode,
    reset: clearGuesseds,
    toggleHardMode,
    addLetter,
    removeLetter,
    submitEntry,
    undo,
    redo,
  };
}

export type Game = ReturnType<typeof useGame>;

function useGuesseds() {
  const [guesseds, setGuesseds] = useState<Guessed[]>([]);
  const [undid, setUndid] = useState<Guessed[]>([]);

  function clearUndid() {
    setUndid([]);
  }

  function addGuessed(guessed: Guessed) {
    setGuesseds([...guesseds, guessed]);
    const lastUndid = _.last(undid);
    if (JSON.stringify(guessed) === JSON.stringify(lastUndid)) {
      setUndid(_.dropRight(undid, 1));
      return;
    }
    setUndid([]);
  }

  function undoGuessed() {
    if (guesseds.length === 0) {
      return;
    }
    setGuesseds(_.dropRight(guesseds, 1));
    const lastGuessed = _.last(guesseds);
    setUndid([...undid, lastGuessed!]);
  }

  function redoGuessed() {
    if (undid.length === 0) {
      return;
    }
    const lastUndid = _.last(undid);
    addGuessed(lastUndid!);
  }

  function clearGuesseds() {
    setGuesseds([]);
  }

  return {
    guesseds,
    addGuessed,
    undoGuessed,
    redoGuessed,
    clearGuesseds,
    clearUndid,
  };
}

function useEntry() {
  const [entry, setEntry] = useState<Letter[]>([]);
  function addLetter(letter: Letter) {
    if (entry.length < 5) setEntry([...entry, letter]);
  }

  function removeLetter() {
    setEntry(entry.slice(0, entry.length - 1));
  }

  function clearEntry() {
    setEntry([]);
  }

  return [entry, addLetter, removeLetter, clearEntry] as [
    typeof entry,
    typeof addLetter,
    typeof removeLetter,
    typeof clearEntry,
  ];
}
