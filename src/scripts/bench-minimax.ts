import { makeMinimax } from '../minimax/minimax'
import { loadPatternTable } from '../minimax/pattern-io'
import { lookupFromTable } from '../minimax/pattern'
import { answerWords, guessWords } from '../words'

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
