import { readFileSync } from 'node:fs'
import { guessWords, answerWords } from '../words'

const GREY = 0
const YELLOW = 1
const GREEN = 2

export const allGreen = 242

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

function makeWordIndex(words: string[]): (word: string) => number {
  const wordIndices = new Map<string, number>(
    words.map((word, index) => [word, index])
  )
  function indexOf(word: string) {
    const index = wordIndices.get(word)
    if (index === undefined) {
      throw new Error('word not indexed')
    }
    return index
  }
  return indexOf
}

export type PatternLookup = (guessIndex: number, answerIndex: number) => number

function makePatternLookup(
  guessWords: string[],
  answerWords: string[],
  filePath?: string
): PatternLookup {
  const table = filePath
    ? loadPatternTable(filePath)
    : buildPatternTable(guessWords, answerWords)

  function patternLookup(guessIndex: number, answerIndex: number) {
    return table[patternIndex(answerIndex, guessIndex, guessWords.length)]
  }

  return patternLookup
}

export function patternTable(
  guessWords: string[],
  answerWords: string[],
  filePath?: string
) {
  return {
    patternLookup: makePatternLookup(guessWords, answerWords, filePath),
    guessIndex: makeWordIndex(guessWords),
    answerIndex: makeWordIndex(answerWords),
  }
}

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

export const patternTablePath = new URL(
  '../data/pattern-table.bin',
  import.meta.url
)

export function loadPatternTable(
  path: URL | string = patternTablePath
): Uint8Array {
  const buffer = readFileSync(path)
  const expected = guessWords.length * answerWords.length
  if (buffer.byteLength !== expected) {
    throw new Error(
      `pattern table at ${path} has ${buffer.byteLength} bytes, expected ${expected}; rerun save-pattern-table`
    )
  }
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}
