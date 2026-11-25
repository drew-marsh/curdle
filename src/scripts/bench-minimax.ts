import { makeMinimax } from '../minimax/minimax'
import { loadPatternTable } from '../minimax/pattern-io'
import { lookupFromTable } from '../minimax/pattern'
import { answerWords, guessWords } from '../words'

// every family of 6+ answers that differ in one letter. these are the hard
// cases
const FAMILIES = `
  EIGHT FIGHT LIGHT MIGHT NIGHT RIGHT SIGHT TIGHT WIGHT
  BOUND FOUND HOUND MOUND POUND ROUND SOUND WOUND
  BATCH CATCH HATCH LATCH MATCH PATCH WATCH
  COWER LOWER MOWER POWER ROWER SOWER TOWER
  SHADE SHAKE SHALE SHAME SHAPE SHARE SHAVE
  BASTE CASTE HASTE PASTE TASTE WASTE
  BATTY CATTY FATTY PATTY RATTY TATTY
  BILLY DILLY FILLY HILLY SILLY WILLY
  DAUNT GAUNT HAUNT JAUNT TAUNT VAUNT
  GRACE GRADE GRAPE GRATE GRAVE GRAZE
  SCORE SHORE SNORE SPORE STORE SWORE
  STAGE STAKE STALE STARE STATE STAVE
`
  .trim()
  .split(/\s+/)
const ATCH = FAMILIES.filter(word => word.endsWith('ATCH'))

// evenly spaced samples of the answer list: bigger, but mostly easy words
const everyNth = (n: number) => answerWords.filter((_, i) => i % n === 0)

// _ATCH's expected count is known; the others come from this search itself, so
// they catch regressions rather than prove the search right. every 2nd
// answer (1155) takes ~250s and the full list over 10 minutes, so they're
// left out
const sets: { name: string; words: string[]; expected: number }[] = [
  { name: '_ATCH', words: ATCH, expected: 3 },
  { name: 'families of 6+', words: FAMILIES, expected: 4 },
  { name: 'every 5th answer', words: everyNth(5), expected: 4 },
]

const minimax = makeMinimax(
  guessWords,
  answerWords,
  lookupFromTable(loadPatternTable(), guessWords.length)
)

console.log(
  'set                     size  guesses     time   guess nodes     set nodes'
)
for (const { name, words, expected } of sets) {
  minimax.nodeVisits.guess = 0
  minimax.nodeVisits.set = 0
  const start = performance.now()
  const guesses = minimax.guessesNeeded(words.map(minimax.answerIndex))
  const seconds = ((performance.now() - start) / 1000).toFixed(2)
  const note = guesses === expected ? '' : `  (expected ${expected})`
  console.log(
    `${name.padEnd(22)}  ${String(words.length).padStart(4)}  ${String(guesses).padStart(7)}  ${seconds.padStart(7)}s  ${minimax.nodeVisits.guess.toLocaleString().padStart(12)}  ${minimax.nodeVisits.set.toLocaleString().padStart(12)}${note}`
  )
}
