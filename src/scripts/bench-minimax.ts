import { makeMinimax } from '../minimax/minimax'
import { loadPatternTable } from '../minimax/pattern-io'
import { lookupFromTable } from '../minimax/pattern'
import { answerWords, guessWords } from '../words'

// answer sets whose minimax guess count is known; families of words that
// differ in one letter are the hard cases
const IGHT = [
  'EIGHT',
  'FIGHT',
  'LIGHT',
  'MIGHT',
  'NIGHT',
  'RIGHT',
  'SIGHT',
  'TIGHT',
  'WIGHT',
]
const OUND = [
  'BOUND',
  'FOUND',
  'HOUND',
  'MOUND',
  'POUND',
  'ROUND',
  'SOUND',
  'WOUND',
]
const ATCH = ['BATCH', 'CATCH', 'HATCH', 'LATCH', 'MATCH', 'PATCH', 'WATCH']

const sets: { name: string; words: string[]; expected: number }[] = [
  { name: '_ATCH', words: ATCH, expected: 3 },
  { name: '_IGHT', words: IGHT, expected: 3 },
  { name: '_IGHT + _OUND', words: [...IGHT, ...OUND], expected: 3 },
  {
    name: '_IGHT + _OUND + _ATCH',
    words: [...IGHT, ...OUND, ...ATCH],
    expected: 4,
  },
]

const minimax = makeMinimax(
  guessWords,
  answerWords,
  lookupFromTable(loadPatternTable(), guessWords.length)
)

console.log('set                     size  guesses  time')
for (const { name, words, expected } of sets) {
  const start = performance.now()
  const guesses = minimax.guessesNeeded(words.map(minimax.answerIndex))
  const seconds = ((performance.now() - start) / 1000).toFixed(2)
  const note = guesses === expected ? '' : `  (expected ${expected})`
  console.log(
    `${name.padEnd(22)}  ${String(words.length).padStart(4)}  ${String(guesses).padStart(7)}  ${seconds.padStart(6)}s${note}`
  )
}
