import { test } from 'vitest'
import { partition } from './minimax'
import { answerWords } from './words'

// copy to a local so calls skip vitest's module export getter
const split = partition

test('partition', ({ bench }) => {
  bench(`partition (1 guess × ${answerWords.length} answers)`, () => {
      split(answerWords, 'RAISE')
    })
  
})
