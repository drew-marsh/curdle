const GREY = 0
const YELLOW = 1
const GREEN = 2

export const PATTERNS = 243
export const ALL_GREEN = 242

export function patternOf(guess: string, answer: string): number {
  const digits: number[] = Array(5).fill(GREY)
  const unmatched: string[] = []
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) digits[i] = GREEN
    else unmatched.push(answer[i])
  }
  for (let i = 0; i < 5; i++) {
    if (digits[i] === GREEN) continue
    const j = unmatched.indexOf(guess[i])
    if (j !== -1) {
      digits[i] = YELLOW
      unmatched.splice(j, 1)
    }
  }
  let pattern = 0
  for (let i = 0; i < 5; i++) {
    pattern += digits[i] * Math.pow(3, i)
  }
  return pattern
}

export type PatternLookup = (guessIndex: number, answerIndex: number) => number

function patternIndex(
  answerIndex: number,
  guessIndex: number,
  guessCount: number
) {
  return answerIndex * guessCount + guessIndex
}

export function buildPatternTable(guessWords: string[], answerWords: string[]) {
  const patternTable: Uint8Array = new Uint8Array(
    new ArrayBuffer(guessWords.length * answerWords.length)
  )
  guessWords.forEach((guess, guessIndex) => {
    answerWords.forEach((answer, answerIndex) => {
      patternTable[patternIndex(answerIndex, guessIndex, guessWords.length)] =
        patternOf(guess, answer)
    })
  })
  return patternTable
}

export function lookupFromTable(
  table: Uint8Array,
  guessCount: number
): PatternLookup {
  return (guessIndex, answerIndex) =>
    table[patternIndex(answerIndex, guessIndex, guessCount)]
}
