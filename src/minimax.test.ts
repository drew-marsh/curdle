import { describe, expect, it } from 'vitest'
import { _wordleColoring } from './logic'
import { partition } from './minimax'
import { answerWords } from './words'

describe('partition', () => {
  it('returns no groups for no answers', () => {
    expect(partition([], 'CRANE')).toEqual([])
  })

  it('groups answers that get the same pattern', () => {
    // SLATE and PLATE color CRANE the same way; SLOTH differs
    expect(partition(['SLATE', 'SLOTH', 'PLATE'], 'CRANE')).toEqual([
      {
        pattern: _wordleColoring('CRANE', 'SLATE'),
        answerSet: ['SLATE', 'PLATE'],
      },
      { pattern: _wordleColoring('CRANE', 'SLOTH'), answerSet: ['SLOTH'] },
    ])
  })

  it('gives the guess itself an all-green group', () => {
    const groups = partition(['SLOTH', 'CRANE'], 'CRANE')
    expect(groups[1]).toEqual({
      pattern: Array(5).fill('green'),
      answerSet: ['CRANE'],
    })
  })

  it('colors duplicate letters like wordle', () => {
    expect(partition(['ABBEY'], 'BOBBY')).toEqual([
      { pattern: _wordleColoring('BOBBY', 'ABBEY'), answerSet: ['ABBEY'] },
    ])
  })

  describe('on the full answer list', () => {
    const groups = partition(answerWords, 'RAISE')

    it('puts every answer in exactly one group, in order', () => {
      expect(
        groups
          .flatMap(group => group.answerSet)
          .slice()
          .sort()
      ).toEqual(answerWords.slice().sort())
      for (const group of groups) {
        const positions = group.answerSet.map(a => answerWords.indexOf(a))
        expect(positions).toEqual(positions.slice().sort((x, y) => x - y))
      }
    })

    it('gives each group a distinct pattern matching its answers', () => {
      const keys = groups.map(group => group.pattern.join())
      expect(new Set(keys).size).toBe(groups.length)
      for (const { pattern, answerSet } of groups) {
        for (const answer of answerSet) {
          expect(_wordleColoring('RAISE', answer)).toEqual(pattern)
        }
      }
    })

    it('orders groups by their first answer', () => {
      const firsts = groups.map(group =>
        answerWords.indexOf(group.answerSet[0])
      )
      expect(firsts).toEqual(firsts.slice().sort((x, y) => x - y))
    })
  })
})
