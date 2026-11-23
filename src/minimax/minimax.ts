import {
  allGreen,
  buildPatternTable,
  lookupFromTable,
  PatternLookup,
} from './pattern'

export function makeWordIndex(words: string[]): (word: string) => number {
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

export type Partition = { pattern: number; answerSet: number[] }

export function makeMinimax(
  guessWords: string[],
  answerWords: string[],
  lookupPattern: PatternLookup = lookupFromTable(
    buildPatternTable(guessWords, answerWords),
    guessWords.length
  )
) {
  const guessIndices = guessWords.map((_, index) => index)
  const guessIndex = makeWordIndex(guessWords)
  const answerIndex = makeWordIndex(answerWords)

  function partition(answerSet: number[], guess: number): Partition[] {
    const byPattern = new Map<number, Partition>()
    for (const answer of answerSet) {
      const pattern = lookupPattern(guess, answer)
      const group = byPattern.get(pattern)
      if (group) group.answerSet.push(answer)
      else byPattern.set(pattern, { pattern, answerSet: [answer] })
    }
    return [...byPattern.values()]
  }

  function guessSolves(
    guess: number,
    answerSet: number[],
    numGuesses: number
  ): boolean {
    // redundant at time of writing
    if (numGuesses < 1) {
      throw new Error(`bad state: ${numGuesses}`)
    }

    const subsets = partition(answerSet, guess)

    // optimization - if you don't split the set it's not a good guess
    if (subsets.length === 1) {
      return false
    }

    return subsets.every(({ answerSet }) => solvable(answerSet, numGuesses - 1))
  }

  function solvable(answerSet: number[], numGuesses: number): boolean {
    if (numGuesses < 1 || answerSet.length < 1) {
      throw new Error(
        `bad state: ${JSON.stringify({ numGuesses, answers: answerSet.length })}`
      )
    }

    if (answerSet.length === 1) {
      return true
    }

    if (numGuesses === 1) {
      return false
    }

    return guessIndices.some(g => guessSolves(g, answerSet, numGuesses))
  }

  function guessesNeeded(answerSet: number[]) {
    let numGuesses = 1
    while (!solvable(answerSet, numGuesses)) {
      numGuesses++
    }
    return numGuesses
  }

  function choosePattern(guessWord: string, answers: string[]): number {
    const options = partition(answers.map(answerIndex), guessIndex(guessWord))

    // should mean all green
    if (options.length === 1) {
      if (options[0].pattern !== allGreen) {
        throw new Error('only pattern option did not lead to solution 🤔')
      }
      return options[0].pattern
    }

    let highestGuesses: number = 0
    let patternChoice: number | undefined = undefined

    for (let i = 0; i < options.length; i++) {
      const { answerSet: subset, pattern } = options[i]
      if (pattern === allGreen) {
        continue
      }
      const numGuesses = guessesNeeded(subset)
      if (numGuesses > highestGuesses) {
        highestGuesses = numGuesses
        patternChoice = pattern
      }
    }

    if (patternChoice === undefined) {
      throw new Error(`no pattern was chosen 🤔`)
    }

    if (patternChoice === allGreen) {
      throw new Error(
        `solution was chosen when multiple options were available 🤔`
      )
    }

    return patternChoice
  }

  return {
    guessWords,
    guessIndex,
    answerWords,
    answerIndex,
    lookupPattern,
    partition,
    solvable,
    guessesNeeded,
    choosePattern,
  }
}
