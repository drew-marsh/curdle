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

const sets: { name: string; words: string[] }[] = [
  { name: '_ATCH', words: ATCH },
  { name: 'families of 6+', words: FAMILIES },
  { name: 'every 5th answer', words: everyNth(5) },
]

const minimax = makeMinimax(
  guessWords,
  answerWords,
  lookupFromTable(loadPatternTable(), guessWords.length)
)

// prints a text table: columns padded to a width, the first left aligned and
// the rest right. returns a function that prints one row
function table(columns: [header: string, width: number][]) {
  const line = (cells: (string | number)[], note = '') =>
    console.log(
      cells
        .map((cell, i) =>
          i === 0
            ? String(cell).padEnd(columns[i][1])
            : String(cell).padStart(columns[i][1])
        )
        .join('  ') + note
    )
  line(columns.map(([header]) => header))
  return line
}

// a mismatch is noted after the row
const timeSince = (start: number) =>
  `${((performance.now() - start) / 1000).toFixed(2)}s`
const nodeCounts = () => [
  minimax.nodeVisits.guess.toLocaleString(),
  minimax.nodeVisits.set.toLocaleString(),
]
const resetNodeVisits = () => {
  minimax.nodeVisits.guess = 0
  minimax.nodeVisits.set = 0
}

const setRow = table([
  ['set', 22],
  ['size', 4],
  ['guesses', 7],
  ['time', 8],
  ['guess nodes', 12],
  ['set nodes', 12],
])
for (const { name, words } of sets) {
  resetNodeVisits()
  const start = performance.now()
  const guesses = minimax.guessesNeeded(words.map(minimax.answerIndex))
  setRow([name, words.length, guesses, timeSince(start), ...nodeCounts()])
}

// CRANE is a known good guess - should be fast
const choices = ['CRANE']

console.log()
const choiceRow = table([
  ['choosePattern', 13],
  ['answers', 7],
  ['pattern', 7],
  ['left', 4],
  ['time', 8],
  ['guess nodes', 12],
  ['set nodes', 12],
])
for (const guess of choices) {
  resetNodeVisits()
  const start = performance.now()
  const pattern = minimax.choosePattern(guess, answerWords)
  const seconds = timeSince(start)
  const guessIndex = minimax.guessIndex(guess)
  const left = answerWords.filter(
    (_, answer) => minimax.lookupPattern(guessIndex, answer) === pattern
  ).length
  choiceRow([
    guess,
    answerWords.length,
    pattern,
    left,
    seconds,
    ...nodeCounts(),
  ])
}
