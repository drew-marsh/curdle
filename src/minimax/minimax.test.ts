import { describe, expect, it } from 'vitest'
import { partition } from './minimax'
import { allGreen, patternOf, patternTable } from './patterns'
import { answerWords as allAnswerWords } from '../words'

const guessWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY', 'BOBBY']
const answerWords = ['CRANE', 'SLATE', 'SLOTH', 'PLATE', 'ABBEY']
const { patternLookup, guessIndex, answerIndex } = patternTable(
  guessWords,
  answerWords
)

describe('partition', () => {
  it('returns no groups for no answers', () => {
    expect(partition([], guessIndex('CRANE'), patternLookup)).toEqual([])
  })

  it('groups answers that get the same pattern', () => {
    // SLATE and PLATE color CRANE the same way; SLOTH differs
    expect(
      partition(
        ['SLATE', 'SLOTH', 'PLATE'].map(answerIndex),
        guessIndex('CRANE'),
        patternLookup
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
      guessIndex('CRANE'),
      patternLookup
    )
    expect(groups[1]).toEqual({
      pattern: allGreen,
      answerSet: [answerIndex('CRANE')],
    })
  })

  it('colors duplicate letters like wordle', () => {
    expect(
      partition([answerIndex('ABBEY')], guessIndex('BOBBY'), patternLookup)
    ).toEqual([
      {
        pattern: patternOf('BOBBY', 'ABBEY'),
        answerSet: [answerIndex('ABBEY')],
      },
    ])
  })

  describe('on the full answer list', () => {
    // a one-guess table keeps this fast; the full table takes seconds to build
    const full = patternTable(['RAISE'], allAnswerWords)
    const allAnswers = allAnswerWords.map((_, index) => index)
    const groups = partition(
      allAnswers,
      full.guessIndex('RAISE'),
      full.patternLookup
    )

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
