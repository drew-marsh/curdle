import { describe, expect, it } from 'vitest'
import { wordleColoring } from './test-utils'

describe('wordleColoring', () => {
  it('colors an exact match all green', () => {
    expect(wordleColoring('CRANE', 'CRANE')).toEqual(Array(5).fill('green'))
  })

  it('colors letters not in the answer grey', () => {
    expect(wordleColoring('CRANE', 'SLOTH')).toEqual(Array(5).fill('grey'))
  })

  it('colors misplaced letters yellow', () => {
    expect(wordleColoring('LEAST', 'SLATE')).toEqual([
      'yellow',
      'yellow',
      'green',
      'yellow',
      'yellow',
    ])
  })

  it('only marks as many repeats as the answer contains', () => {
    // ABIDE has one E, so only the first E in SPEED is yellow
    expect(wordleColoring('SPEED', 'ABIDE')).toEqual([
      'grey',
      'grey',
      'yellow',
      'grey',
      'yellow',
    ])
  })

  it('gives greens priority over earlier yellows', () => {
    // CRANE's only E is matched green at the end, so the earlier Es are grey
    expect(wordleColoring('EERIE', 'CRANE')).toEqual([
      'grey',
      'grey',
      'yellow',
      'grey',
      'green',
    ])
  })

  it('handles repeats in both guess and answer', () => {
    // ABBEY has two Bs: one green, one left for a yellow
    expect(wordleColoring('BOBBY', 'ABBEY')).toEqual([
      'yellow',
      'grey',
      'green',
      'grey',
      'green',
    ])
  })
})
