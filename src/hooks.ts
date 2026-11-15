import { useEffect, useState } from 'react'
import { colorGuess, Guess, isLetter, Letter, makesValidWord } from './logic'
import { answerWords, guessWords } from './words'

export function useGame() {
  const { entry, addLetter, removeLetter, clearEntry } = useEntry()
  const { guesses, addGuess, undoGuess, redoGuess, clearGuesses, clearUndone } =
    useGuesses()
  const [hardMode, setHardMode] = useState(false)
  const canToggleHardMode = guesses.length === 0
  function toggleHardMode() {
    if (!canToggleHardMode) {
      return
    }
    clearUndone()
    setHardMode(!hardMode)
  }
  const win = !!guesses.at(-1)?.colors.every(color => color === 'green')

  function submitEntry() {
    if (!makesValidWord(entry)) {
      return
    }
    addGuess(colorGuess(entry, guesses, hardMode ? guessWords : answerWords))
    clearEntry()
  }

  function undo() {
    if (entry.length > 0) {
      clearEntry()
      return
    }
    undoGuess()
  }

  function redo() {
    if (entry.length > 0) {
      return
    }
    redoGuess()
  }

  return {
    entry,
    guesses,
    win,
    hardMode,
    canToggleHardMode,
    reset: clearGuesses,
    toggleHardMode,
    addLetter,
    removeLetter,
    submitEntry,
    undo,
    redo,
  }
}

export type Game = ReturnType<typeof useGame>

function sameGuess(a: Guess, b: Guess | undefined) {
  return a.word === b?.word && a.colors.join() === b.colors.join()
}

function useGuesses() {
  const [guesses, setGuesses] = useState<Guess[]>([])
  const [undone, setUndone] = useState<Guess[]>([])

  function clearUndone() {
    setUndone([])
  }

  function addGuess(guess: Guess) {
    setGuesses([...guesses, guess])
    if (sameGuess(guess, undone.at(-1))) {
      setUndone(undone.slice(0, -1))
      return
    }
    setUndone([])
  }

  function undoGuess() {
    const last = guesses.at(-1)
    if (!last) {
      return
    }
    setGuesses(guesses.slice(0, -1))
    setUndone([...undone, last])
  }

  function redoGuess() {
    const last = undone.at(-1)
    if (!last) {
      return
    }
    addGuess(last)
  }

  function clearGuesses() {
    setGuesses([])
  }

  return {
    guesses,
    addGuess,
    undoGuess,
    redoGuess,
    clearGuesses,
    clearUndone,
  }
}

function useEntry() {
  const [entry, setEntry] = useState('')
  function addLetter(letter: Letter) {
    if (entry.length < 5) setEntry(entry + letter)
  }

  function removeLetter() {
    setEntry(entry.slice(0, -1))
  }

  function clearEntry() {
    setEntry('')
  }

  return { entry, addLetter, removeLetter, clearEntry }
}

export function useKeyDownListener(game: Game) {
  function handleKeydown(e: KeyboardEvent) {
    if (e.altKey || e.ctrlKey) {
      return
    }

    getKeyHandler(game)(e.key)
  }

  useEffect(() => {
    document.addEventListener('keydown', handleKeydown)
    return () => {
      document.removeEventListener('keydown', handleKeydown)
    }
  })
}

export function getKeyHandler(game: Game) {
  const { win, reset, addLetter, removeLetter, submitEntry, undo, redo } = game
  return function (key: string) {
    const keyUpper = key.toUpperCase()
    if (isLetter(keyUpper)) {
      addLetter(keyUpper)
    }
    if (key === 'Backspace') {
      removeLetter()
    }
    if (key === 'Enter') {
      if (win) {
        reset()
        return
      }
      submitEntry()
    }
    if (key === 'ArrowLeft') {
      undo()
    }
    if (key === 'ArrowRight') {
      redo()
    }
  }
}
