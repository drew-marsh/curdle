import { describe, expect, it } from 'vitest'
import {
  _wordleColoring,
  colorGuess,
  Guess,
  isLetter,
  makesValidWord,
} from './logic'
import { answerWords, guessWords } from './words'

describe('isLetter', () => {
  it('accepts uppercase A-Z', () => {
    expect(isLetter('A')).toBe(true)
    expect(isLetter('Z')).toBe(true)
  })

  it('rejects lowercase, multi-char and non-letters', () => {
    expect(isLetter('a')).toBe(false)
    expect(isLetter('AB')).toBe(false)
    expect(isLetter('1')).toBe(false)
    expect(isLetter('Enter')).toBe(false)
  })
})

describe('makesValidWord', () => {
  it('accepts words in the guess list', () => {
    expect(makesValidWord('SPAIN')).toBe(true)
  })

  it('rejects non-words and incomplete entries', () => {
    expect(makesValidWord('XXXXX')).toBe(false)
    expect(makesValidWord('CRAN')).toBe(false)
  })
})

describe('_wordleColoring', () => {
  it('colors an exact match all green', () => {
    expect(_wordleColoring('CRANE', 'CRANE')).toEqual(Array(5).fill('green'))
  })

  it('colors letters not in the answer grey', () => {
    expect(_wordleColoring('CRANE', 'SLOTH')).toEqual(Array(5).fill('grey'))
  })

  it('colors misplaced letters yellow', () => {
    expect(_wordleColoring('LEAST', 'SLATE')).toEqual([
      'yellow',
      'yellow',
      'green',
      'yellow',
      'yellow',
    ])
  })

  it('only marks as many repeats as the answer contains', () => {
    // ABIDE has one E, so only the first E in SPEED is yellow
    expect(_wordleColoring('SPEED', 'ABIDE')).toEqual([
      'grey',
      'grey',
      'yellow',
      'grey',
      'yellow',
    ])
  })

  it('gives greens priority over earlier yellows', () => {
    // CRANE's only E is matched green at the end, so the earlier Es are grey
    expect(_wordleColoring('EERIE', 'CRANE')).toEqual([
      'grey',
      'grey',
      'yellow',
      'grey',
      'green',
    ])
  })

  it('handles repeats in both guess and answer', () => {
    // ABBEY has two Bs: one green, one left for a yellow
    expect(_wordleColoring('BOBBY', 'ABBEY')).toEqual([
      'yellow',
      'grey',
      'green',
      'grey',
      'green',
    ])
  })
})

describe('colorGuess', () => {
  it('returns the guessed word', () => {
    expect(colorGuess('SLATE', [], ['CRANE']).word).toBe('SLATE')
  })

  it('colors against the only possible answer', () => {
    expect(colorGuess('SLATE', [], ['CRANE']).colors).toEqual(
      _wordleColoring('SLATE', 'CRANE')
    )
    expect(colorGuess('CRANE', [], ['CRANE']).colors).toEqual(
      Array(5).fill('green')
    )
  })

  it('colors duplicate letters like wordle', () => {
    expect(colorGuess('BOBBY', [], ['ABBEY']).colors).toEqual(
      _wordleColoring('BOBBY', 'ABBEY')
    )
  })

  it('picks the coloring shared by the most potential answers', () => {
    // SLATE and PLATE color CRANE the same way; SLOTH differs
    const guessed = colorGuess('CRANE', [], ['SLATE', 'SLOTH', 'PLATE'])
    expect(guessed.colors).toEqual(_wordleColoring('CRANE', 'SLATE'))
  })

  it('avoids a win when tied with another coloring', () => {
    const guessed = colorGuess('CRANE', [], ['CRANE', 'SLOTH'])
    expect(guessed.colors).toEqual(_wordleColoring('CRANE', 'SLOTH'))
  })

  it('only considers answers consistent with previous guesses', () => {
    // without the previous guess, SLATE and PLATE would outvote CRANE
    const previous = colorGuess('SLOTH', [], ['CRANE'])
    const guessed = colorGuess('CRANE', [previous], ['SLATE', 'PLATE', 'CRANE'])
    expect(guessed.colors).toEqual(Array(5).fill('green'))
  })

  it('throws when no answer fits the previous guesses', () => {
    const previous = colorGuess('CRANE', [], ['CRANE'])
    expect(() => colorGuess('SLATE', [previous], ['SLATE'])).toThrow()
  })

  it('always leaves at least one answer consistent with every coloring', () => {
    // deterministic pseudo-random guesses
    let seed = 1
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }

    for (let game = 0; game < 10; game++) {
      const guesses: Guess[] = []
      for (let turn = 0; turn < 6; turn++) {
        const guess = guessWords[Math.floor(random() * guessWords.length)]
        guesses.push(colorGuess(guess, guesses, answerWords))

        const consistent = answerWords.some(answer =>
          guesses.every(
            ({ word, colors }) =>
              colors.join() === _wordleColoring(word, answer).join()
          )
        )
        expect(consistent).toBe(true)
      }
    }
  })
})
