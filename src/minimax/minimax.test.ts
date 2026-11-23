import { describe, expect, it } from 'vitest'
import {
  answerWords as allAnswerWords,
  guessWords as allGuessWords,
} from '../words'
import { makeMinimax } from './minimax'
import { allGreen, patternOf } from './pattern'

const guessWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY', 'BOBBY']
const answerWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY']
const { lookupPattern, guessIndex, answerIndex, partition } = makeMinimax(
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

describe('lookupPattern', () => {
  it('matches patternOf for every guess and answer', () => {
    for (const guess of guessWords) {
      for (const answer of answerWords) {
        expect(lookupPattern(guessIndex(guess), answerIndex(answer))).toBe(
          patternOf(guess, answer)
        )
      }
    }
  })
})

describe('partition', () => {
  it('returns no groups for no answers', () => {
    expect(partition([], guessIndex('CRANE'))).toEqual([])
  })

  it('groups answers that get the same pattern', () => {
    // SLATE and PLATE color CRANE the same way; SLOTH differs
    expect(
      partition(
        ['SLATE', 'SLOTH', 'PLATE'].map(answerIndex),
        guessIndex('CRANE')
      )
    ).toEqual([
      {
        pattern: patternOf('CRANE', 'SLATE'),
        answerSet: ['SLATE', 'PLATE'].map(answerIndex),
      },
      {
        pattern: patternOf('CRANE', 'SLOTH'),
        answerSet: [answerIndex('SLOTH')],
      },
    ])
  })

  it('gives the guess itself an all-green group', () => {
    const groups = partition(
      ['SLOTH', 'CRANE'].map(answerIndex),
      guessIndex('CRANE')
    )
    expect(groups[1]).toEqual({
      pattern: allGreen,
      answerSet: [answerIndex('CRANE')],
    })
  })

  it('colors duplicate letters like wordle', () => {
    expect(partition([answerIndex('ABBEY')], guessIndex('BOBBY'))).toEqual([
      {
        pattern: patternOf('BOBBY', 'ABBEY'),
        answerSet: [answerIndex('ABBEY')],
      },
    ])
  })

  describe('on the full answer list', () => {
    // a one-guess table keeps this fast; the full table takes seconds to build
    const full = makeMinimax(['RAISE'], allAnswerWords)
    const allAnswers = allAnswerWords.map((_, index) => index)
    const groups = full.partition(allAnswers, full.guessIndex('RAISE'))

    it('puts every answer in exactly one group, in order', () => {
      expect(
        groups.flatMap(group => group.answerSet).sort((x, y) => x - y)
      ).toEqual(allAnswers)
      for (const group of groups) {
        expect(group.answerSet).toEqual(
          group.answerSet.slice().sort((x, y) => x - y)
        )
      }
    })

    it('gives each group a distinct pattern matching its answers', () => {
      const keys = groups.map(group => group.pattern)
      expect(new Set(keys).size).toBe(groups.length)
      for (const { pattern, answerSet } of groups) {
        for (const answer of answerSet) {
          expect(patternOf('RAISE', allAnswerWords[answer])).toEqual(pattern)
        }
      }
    })

    it('orders groups by their first answer', () => {
      const firsts = groups.map(group => group.answerSet[0])
      expect(firsts).toEqual(firsts.slice().sort((x, y) => x - y))
    })
  })
})

// solvable tries every word in the guess list, so its table needs the full
// guess list. a few answers keep it small
const atch = ['BATCH', 'CATCH', 'HATCH', 'LATCH', 'MATCH', 'PATCH', 'WATCH']
const searchAnswers = ['CRANE', 'SLOTH', 'ABBEY', 'SLATE', 'PLATE', ...atch]
const search = makeMinimax(allGuessWords, searchAnswers)

describe('solvable', () => {
  const isSolvable = (answers: string[], numGuesses: number) =>
    search.solvable(answers.map(search.answerIndex), numGuesses)

  it('needs at least one guess', () => {
    expect(() => isSolvable(['CRANE'], 0)).throws()
  })

  it('solves a single answer in one guess', () => {
    expect(isSolvable(['CRANE'], 1)).toBe(true)
  })

  it('cannot solve two answers in one guess', () => {
    expect(isSolvable(['SLATE', 'PLATE'], 1)).toBe(false)
  })

  it('solves two answers in two guesses', () => {
    // guess one; if it's wrong, the other is left
    expect(isSolvable(['SLATE', 'PLATE'], 2)).toBe(true)
  })

  it('solves in two when one guess splits every answer apart', () => {
    // CRANE colors CRANE, SLOTH and ABBEY three different ways
    expect(isSolvable(['CRANE', 'SLOTH', 'ABBEY'], 2)).toBe(true)
    expect(isSolvable(['CRANE', 'SLOTH', 'ABBEY'], 1)).toBe(false)
  })

  it('needs three guesses for the _ATCH trap', () => {
    // no guess colors all seven _ATCH words differently, but ABAMP splits
    // them into groups that a second guess can each split apart
    expect(isSolvable(atch, 3)).toBe(true)
    expect(isSolvable(atch, 2)).toBe(false)
  })
})

describe('guessesNeeded', () => {
  const guessesNeeded = (answers: string[]) =>
    search.guessesNeeded(answers.map(search.answerIndex))

  it('throws for no answers', () => {
    expect(() => guessesNeeded([])).toThrow()
  })

  it('needs one guess for a single answer', () => {
    expect(guessesNeeded(['CRANE'])).toBe(1)
  })

  it('needs two guesses for two answers', () => {
    expect(guessesNeeded(['SLATE', 'PLATE'])).toBe(2)
  })

  it('needs two guesses when one guess splits every answer apart', () => {
    expect(guessesNeeded(['CRANE', 'SLOTH', 'ABBEY'])).toBe(2)
  })

  it('needs three guesses for the _ATCH trap', () => {
    expect(guessesNeeded(atch)).toBe(3)
  })
})

describe('choosePattern', () => {
  const { choosePattern } = search

  it('throws for no answers', () => {
    expect(() => choosePattern('CRANE', [])).toThrow()
  })

  it('gives all green when last answer is guessed', () => {
    expect(choosePattern('CRANE', ['CRANE'])).toBe(allGreen)
  })

  it('picks the pattern that leaves the most guesses', () => {
    // CRANE lumps SLATE and PLATE together (2 guesses left) and leaves SLOTH
    // alone (1 guess left)
    expect(choosePattern('CRANE', ['SLOTH', 'SLATE', 'PLATE'])).toBe(
      patternOf('CRANE', 'SLATE')
    )
  })

  it('picks the _ATCH group over an easy one', () => {
    // SLOTH colors every _ATCH word the same way, leaving 3 guesses
    expect(choosePattern('SLOTH', ['CRANE', ...atch])).toBe(
      patternOf('SLOTH', 'BATCH')
    )
  })

  it('does not give away the answer when another pattern is as hard', () => {
    // CRANE and SLOTH each leave one answer, but all green ends the game
    expect(choosePattern('CRANE', ['CRANE', 'SLOTH'])).toBe(
      patternOf('CRANE', 'SLOTH')
    )
  })
})
