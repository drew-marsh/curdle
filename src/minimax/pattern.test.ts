import { describe, expect, it } from 'vitest'
import { patternOf, patternTable } from './pattern'

const guessWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY', 'BOBBY']
const answerWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY']
const { patternLookup, guessIndex, answerIndex } = patternTable(
  guessWords,
  answerWords
)

describe('guessIndex', () => {
  it('finds the first word', () => {
    expect(guessIndex('CRANE')).toBe(0)
  })

  it('throws for a word not in the list', () => {
    expect(() => guessIndex('RAISE')).toThrow()
  })
})

describe('answerIndex', () => {
  it('indexes the answer list, not the guess list', () => {
    expect(answerIndex('ABBEY')).toBe(4)
    expect(() => answerIndex('BOBBY')).toThrow()
  })
})

describe('patternLookup', () => {
  it('matches patternOf for every guess and answer', () => {
    for (const guess of guessWords) {
      for (const answer of answerWords) {
        expect(patternLookup(guessIndex(guess), answerIndex(answer))).toBe(
          patternOf(guess, answer)
        )
      }
    }
  })
})
