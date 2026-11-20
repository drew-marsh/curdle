import { test } from 'vitest'
import { partition } from './minimax'
import { patternTable } from './patterns'
import { answerWords } from '../words'

const answerIndices = answerWords.map((_, index) => index)
const { patternLookup, guessIndex } = patternTable(['RAISE'], answerWords)
const raiseIndex = guessIndex('RAISE')

// copy to a local so calls skip vitest's module export getter
const split = partition

test('partition', ({ bench }) => {
  bench(`partition (1 guess × ${answerWords.length} answers)`, () => {
    split(answerIndices, raiseIndex, patternLookup)
  }).run({ iterations: 10, warmupIterations: 2 })
})
