// @vitest-environment jsdom
import { act, renderHook } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { Game, getKeyHandler, useGame, useKeyDownListener } from './hooks'
import { Letter } from './logic'

function setup() {
  const { result } = renderHook(() => useGame())
  const type = (word: string) => {
    for (const letter of word) {
      act(() => result.current.addLetter(letter as Letter))
    }
  }
  const submit = () => act(() => result.current.submitEntry())
  const guess = (word: string) => {
    type(word)
    submit()
  }
  const guessWords = () => result.current.guesses.map(g => g.word)
  return { result, type, submit, guess, guessWords }
}

describe('useGame', () => {
  it('starts empty', () => {
    const { result } = setup()
    expect(result.current.entry).toBe('')
    expect(result.current.guesses).toEqual([])
    expect(result.current.win).toBe(false)
    expect(result.current.hardMode).toBe(false)
  })

  describe('entry', () => {
    it('adds letters up to five', () => {
      const { result, type } = setup()
      type('CRANES')
      expect(result.current.entry).toBe('CRANE')
    })

    it('removes the last letter', () => {
      const { result, type } = setup()
      type('CRA')
      act(() => result.current.removeLetter())
      expect(result.current.entry).toBe('CR')
    })

    it('does nothing when removing from an empty entry', () => {
      const { result } = setup()
      act(() => result.current.removeLetter())
      expect(result.current.entry).toBe('')
    })
  })

  describe('submitEntry', () => {
    it('ignores invalid words', () => {
      const { result, guess } = setup()
      guess('XXXXX')
      expect(result.current.guesses).toEqual([])
      expect(result.current.entry).toBe('XXXXX')
    })

    it('ignores incomplete entries', () => {
      const { result, guess } = setup()
      guess('CRAN')
      expect(result.current.guesses).toEqual([])
    })

    it('adds a colored guess and clears the entry', () => {
      const { result, guess, guessWords } = setup()
      guess('CRANE')
      expect(guessWords()).toEqual(['CRANE'])
      expect(result.current.guesses[0].colors).toHaveLength(5)
      expect(result.current.entry).toBe('')
    })
  })

  describe('undo / redo', () => {
    it('undo clears a non-empty entry before removing guesses', () => {
      const { result, guess, type, guessWords } = setup()
      guess('CRANE')
      type('SL')
      act(() => result.current.undo())
      expect(result.current.entry).toBe('')
      expect(guessWords()).toEqual(['CRANE'])
    })

    it('undo removes the last guess and redo restores it', () => {
      const { result, guess, guessWords } = setup()
      guess('CRANE')
      guess('SLOTH')
      const before = result.current.guesses

      act(() => result.current.undo())
      expect(guessWords()).toEqual(['CRANE'])

      act(() => result.current.redo())
      expect(result.current.guesses).toEqual(before)
    })

    it('undo with no guesses does nothing', () => {
      const { result } = setup()
      act(() => result.current.undo())
      expect(result.current.guesses).toEqual([])
    })

    it('redo does nothing while an entry is being typed', () => {
      const { result, guess, type, guessWords } = setup()
      guess('CRANE')
      act(() => result.current.undo())
      type('S')
      act(() => result.current.redo())
      expect(guessWords()).toEqual([])
    })

    it('a different new guess clears the redo stack', () => {
      const { result, guess, guessWords } = setup()
      guess('CRANE')
      act(() => result.current.undo())
      guess('SLOTH')
      act(() => result.current.redo())
      expect(guessWords()).toEqual(['SLOTH'])
    })

    it('toggling hard mode clears the redo stack', () => {
      const { result, guess, guessWords } = setup()
      guess('CRANE')
      act(() => result.current.undo())
      act(() => result.current.toggleHardMode())
      expect(result.current.hardMode).toBe(true)
      act(() => result.current.redo())
      expect(guessWords()).toEqual([])
    })
  })

  it('reset clears guesses', () => {
    const { result, guess } = setup()
    guess('CRANE')
    act(() => result.current.reset())
    expect(result.current.guesses).toEqual([])
  })
})

function fakeGame(overrides: Partial<Game> = {}): Game {
  return {
    entry: '',
    guesses: [],
    win: false,
    hardMode: false,
    reset: vi.fn(),
    toggleHardMode: vi.fn(),
    addLetter: vi.fn(),
    removeLetter: vi.fn(),
    submitEntry: vi.fn(),
    undo: vi.fn(),
    redo: vi.fn(),
    ...overrides,
  }
}

describe('getKeyHandler', () => {
  it('adds letters, uppercasing them', () => {
    const game = fakeGame()
    getKeyHandler(game)('a')
    getKeyHandler(game)('B')
    expect(game.addLetter).toHaveBeenNthCalledWith(1, 'A')
    expect(game.addLetter).toHaveBeenNthCalledWith(2, 'B')
  })

  it('ignores other keys', () => {
    const game = fakeGame()
    getKeyHandler(game)('1')
    getKeyHandler(game)('Shift')
    expect(game.addLetter).not.toHaveBeenCalled()
  })

  it('maps special keys to actions', () => {
    const game = fakeGame()
    const handle = getKeyHandler(game)
    handle('Backspace')
    handle('Enter')
    handle('ArrowLeft')
    handle('ArrowRight')
    expect(game.removeLetter).toHaveBeenCalledOnce()
    expect(game.submitEntry).toHaveBeenCalledOnce()
    expect(game.undo).toHaveBeenCalledOnce()
    expect(game.redo).toHaveBeenCalledOnce()
  })

  it('Enter resets instead of submitting after a win', () => {
    const game = fakeGame({ win: true })
    getKeyHandler(game)('Enter')
    expect(game.reset).toHaveBeenCalledOnce()
    expect(game.submitEntry).not.toHaveBeenCalled()
  })
})

describe('useKeyDownListener', () => {
  const press = (key: string, init: KeyboardEventInit = {}) =>
    document.dispatchEvent(new KeyboardEvent('keydown', { key, ...init }))

  it('handles document keydown events', () => {
    const game = fakeGame()
    renderHook(() => useKeyDownListener(game))
    press('a')
    expect(game.addLetter).toHaveBeenCalledWith('A')
  })

  it('ignores keys with ctrl or alt held', () => {
    const game = fakeGame()
    renderHook(() => useKeyDownListener(game))
    press('a', { ctrlKey: true })
    press('a', { altKey: true })
    expect(game.addLetter).not.toHaveBeenCalled()
  })

  it('stops listening after unmount', () => {
    const game = fakeGame()
    const { unmount } = renderHook(() => useKeyDownListener(game))
    unmount()
    press('a')
    expect(game.addLetter).not.toHaveBeenCalled()
  })
})
