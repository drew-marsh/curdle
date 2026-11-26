import { test } from 'vitest'
import { answerWords, guessWords } from '../words'
import { makeMinimax } from './minimax'

const answerIndices = answerWords.map((_, index) => index)
const raise = makeMinimax(['RAISE'], answerWords)
const raiseIndex = raise.guessIndex('RAISE')

// mulberry32: a small seeded generator so the sample is the same every run
function seededRandom(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0
    let t = Math.imul(seed ^ (seed >>> 15), seed | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sample<T>(items: T[], count: number, seed: number): T[] {
  const random = seededRandom(seed)
  const shuffled = items.slice()
  for (let i = 0; i < count; i++) {
    const j = i + Math.floor(random() * (shuffled.length - i))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled.slice(0, count)
}

// one level of the search: a small answer set partitioned by every guess
const sampleAnswers = sample(answerWords, 50, 1)
const level = makeMinimax(guessWords, sampleAnswers)
const sampleIndices = sampleAnswers.map((_, index) => index)

test('partition', async ({ bench }) => {
  await bench(`partition (1 guess × ${answerWords.length} answers)`, () => {
    raise.partition(answerIndices, raiseIndex)
  }).run()
})

test('partition every guess', async ({ bench }) => {
  await bench(`partition (${guessWords.length} guesses × ${sampleAnswers.length} answers)`, () => {
    for (let guess = 0; guess < guessWords.length; guess++) {
      level.partition(sampleIndices, guess)
    }
  }).run()
})

test('orderGuesses', async ({ bench }) => {
  await bench(`order guesses for ${sampleAnswers.length} answers`, () => {
    level.orderGuesses(sampleIndices, 3)
  }).run()
})

// separable and splittable are two ways to answer "solvable in 2?"; compare
// them on a set that is separable and one that isn't
const ATCH = ['BATCH', 'CATCH', 'HATCH', 'LATCH', 'MATCH', 'PATCH', 'WATCH']
const separableAnswers = answerWords.slice(0, 10)
const twoGuess = makeMinimax(guessWords, [...ATCH, ...separableAnswers])
const separableSets = [
  {
    name: `first ${separableAnswers.length} answers (separable)`,
    words: separableAnswers,
  },
  { name: `_ATCH (not separable)`, words: ATCH },
]

for (const { name, words } of separableSets) {
  const answerSet = words.map(twoGuess.answerIndex)
  test(`separable: ${name}`, async ({ bench }) => {
    await bench.compare(
      bench('separable', () => {
        twoGuess.separable(answerSet)
      }),
      bench('splittable in 2', () => {
        twoGuess.splittable(answerSet, 2)
      })
    )
  })
}
