import { describe, expect, it } from 'vitest'
import { colorGuess, Guessed, isLetter, Letter, makesValidWord } from './logic'
import { wordleColoring } from './test-utils'
import { answerWords, guessWords } from './words'

const letters = (word: string) => word.split('') as Letter[]
const colors = (guessed: Guessed) => guessed.map(gl => gl.color)

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
    expect(makesValidWord(letters('SPAIN'))).toBe(true)
  })

  it('rejects non-words and incomplete entries', () => {
    expect(makesValidWord(letters('XXXXX'))).toBe(false)
    expect(makesValidWord(letters('CRAN'))).toBe(false)
  })
})

describe('colorGuess', () => {
  it('keeps the guessed letters in order', () => {
    const guessed = colorGuess(letters('SLATE'), [], ['CRANE'])
    expect(guessed.map(gl => gl.letter).join('')).toBe('SLATE')
  })

  it('colors against the only possible answer', () => {
    expect(colors(colorGuess(letters('SLATE'), [], ['CRANE']))).toEqual(
      wordleColoring('SLATE', 'CRANE')
    )
    expect(colors(colorGuess(letters('CRANE'), [], ['CRANE']))).toEqual(
      Array(5).fill('green')
    )
  })

  it('colors duplicate letters like wordle', () => {
    expect(colors(colorGuess(letters('BOBBY'), [], ['ABBEY']))).toEqual(
      wordleColoring('BOBBY', 'ABBEY')
    )
  })

  it('picks the coloring shared by the most potential answers', () => {
    // SLATE and PLATE color CRANE the same way; SLOTH differs
    const guessed = colorGuess(
      letters('CRANE'),
      [],
      ['SLATE', 'SLOTH', 'PLATE']
    )
    expect(colors(guessed)).toEqual(wordleColoring('CRANE', 'SLATE'))
  })

  it('avoids a win when tied with another coloring', () => {
    const guessed = colorGuess(letters('CRANE'), [], ['CRANE', 'SLOTH'])
    expect(colors(guessed)).toEqual(wordleColoring('CRANE', 'SLOTH'))
  })

  it('only considers answers consistent with previous guesses', () => {
    // without the previous guess, SLATE and PLATE would outvote CRANE
    const previous = colorGuess(letters('SLOTH'), [], ['CRANE'])
    const guessed = colorGuess(
      letters('CRANE'),
      [previous],
      ['SLATE', 'PLATE', 'CRANE']
    )
    expect(colors(guessed)).toEqual(Array(5).fill('green'))
  })

  it('throws when no answer fits the previous guesses', () => {
    const previous = colorGuess(letters('CRANE'), [], ['CRANE'])
    expect(() => colorGuess(letters('SLATE'), [previous], ['SLATE'])).toThrow()
  })

  it('always leaves at least one answer consistent with every coloring', () => {
    // deterministic pseudo-random guesses
    let seed = 1
    const random = () => {
      seed = (seed * 16807) % 2147483647
      return seed / 2147483647
    }

    for (let game = 0; game < 10; game++) {
      const guesseds: Guessed[] = []
      for (let turn = 0; turn < 6; turn++) {
        const guess = guessWords[Math.floor(random() * guessWords.length)]
        guesseds.push(colorGuess(letters(guess), guesseds, answerWords))

        const consistent = answerWords.some(answer =>
          guesseds.every(
            guessed =>
              JSON.stringify(colors(guessed)) ===
              JSON.stringify(
                wordleColoring(guessed.map(gl => gl.letter).join(''), answer)
              )
          )
        )
        expect(consistent).toBe(true)
      }
    }
  })
})
