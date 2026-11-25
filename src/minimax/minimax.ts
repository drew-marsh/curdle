import {
  ALL_GREEN,
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

  // guess nodes are guessSolves calls, set nodes are solvable calls
  const nodeVisits = { guess: 0, set: 0 }

  const groupByPattern: (Partition | undefined)[] = new Array(ALL_GREEN + 1)

  function partition(answerSet: number[], guess: number): Partition[] {
    const groups: Partition[] = []
    for (const answer of answerSet) {
      const pattern = lookupPattern(guess, answer)
      const group = groupByPattern[pattern]
      if (group) group.answerSet.push(answer)
      else {
        const created = { pattern, answerSet: [answer] }
        groupByPattern[pattern] = created
        groups.push(created)
      }
    }
    for (const { pattern } of groups) groupByPattern[pattern] = undefined
    return groups
  }

  function guessSolves(
    guess: number,
    answerSet: number[],
    numGuesses: number
  ): boolean {
    nodeVisits.guess++
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

  let generation = 0
  const stamps = Array.from({ length: ALL_GREEN + 1 }).fill(0)

  // is there a guess that splits the answer set into subsets of 1?
  // if so it's solvable in 2
  function separable(answerSet: number[]): boolean {
    for (let g = 0; g < guessWords.length; g++) {
      let collided = false
      generation++
      for (let a = 0; a < answerSet.length; a++) {
        const pattern = lookupPattern(g, answerSet[a])
        if (stamps[pattern] === generation) {
          collided = true
          break
        }
        stamps[pattern] = generation
      }
      if (!collided) {
        return true
      }
    }
    return false
  }

  function solvable(answerSet: number[], numGuesses: number): boolean {
    nodeVisits.set++
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

    if (numGuesses === 2 && answerSet.length === 2) {
      return true
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
      if (options[0].pattern !== ALL_GREEN) {
        throw new Error('only pattern option did not lead to solution 🤔')
      }
      return options[0].pattern
    }

    let highestGuesses: number = 0
    let patternChoice: number | undefined = undefined

    for (let i = 0; i < options.length; i++) {
      const { answerSet: subset, pattern } = options[i]
      if (pattern === ALL_GREEN) {
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

    if (patternChoice === ALL_GREEN) {
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
    nodeVisits,
    partition,
    separable,
    solvable,
    guessesNeeded,
    choosePattern,
  }
}
