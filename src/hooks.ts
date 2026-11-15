import { useEffect, useState } from 'react'
import { colorGuess, Guessed, isLetter, Letter, makesValidWord } from './logic'
import { answerWords, guessWords } from './words'

export function useGame() {
  const { entry, addLetter, removeLetter, clearEntry } = useEntry()
  const {
    guesseds,
    addGuessed,
    undoGuessed,
    redoGuessed,
    clearGuesseds,
    clearUndid,
  } = useGuesseds()
  const [hardMode, setHardMode] = useState(false)
  function toggleHardMode() {
    clearUndid()
    setHardMode(!hardMode)
  }
  const lastGuess =
    guesseds.length > 0 ? guesseds[guesseds.length - 1] : undefined
  const win = !!lastGuess?.every(gl => gl.color === 'green')

  function submitEntry() {
    if (!makesValidWord(entry)) {
      return
    }
    const guessed = colorGuess(
      entry,
      guesseds,
      hardMode ? guessWords : answerWords
    )
    addGuessed(guessed)
    clearEntry()
  }

  function undo() {
    if (entry.length > 0) {
      clearEntry()
      return
    }
    undoGuessed()
  }

  function redo() {
    if (entry.length > 0) {
      return
    }
    redoGuessed()
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
  }
}

export type Game = ReturnType<typeof useGame>

function useGuesseds() {
  const [guesseds, setGuesseds] = useState<Guessed[]>([])
  const [undid, setUndid] = useState<Guessed[]>([])

  function clearUndid() {
    setUndid([])
  }

  function addGuessed(guessed: Guessed) {
    setGuesseds([...guesseds, guessed])
    const lastUndid = undid.at(-1)
    if (JSON.stringify(guessed) === JSON.stringify(lastUndid)) {
      setUndid(undid.slice(0, -1))
      return
    }
    setUndid([])
  }

  function undoGuessed() {
    if (guesseds.length === 0) {
      return
    }
    setGuesseds(guesseds.slice(0, -1))
    const lastGuessed = guesseds.at(-1)
    setUndid([...undid, lastGuessed!])
  }

  function redoGuessed() {
    if (undid.length === 0) {
      return
    }
    const lastUndid = undid.at(-1)
    addGuessed(lastUndid!)
  }

  function clearGuesseds() {
    setGuesseds([])
  }

  return {
    guesseds,
    addGuessed,
    undoGuessed,
    redoGuessed,
    clearGuesseds,
    clearUndid,
  }
}

function useEntry() {
  const [entry, setEntry] = useState<Letter[]>([])
  function addLetter(letter: Letter) {
    if (entry.length < 5) setEntry([...entry, letter])
  }

  function removeLetter() {
    setEntry(entry.slice(0, entry.length - 1))
  }

  function clearEntry() {
    setEntry([])
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
