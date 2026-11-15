import { guessWords } from './words'

export const alphabet = [
  'A',
  'B',
  'C',
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'K',
  'L',
  'M',
  'N',
  'O',
  'P',
  'Q',
  'R',
  'S',
  'T',
  'U',
  'V',
  'W',
  'X',
  'Y',
  'Z',
] as const

export type Letter = (typeof alphabet)[number]

export function isLetter(value: string): value is Letter {
  return (alphabet as readonly string[]).includes(value)
}

export type Color = 'green' | 'yellow' | 'grey'
// word is 5 uppercase letters
export type Guess = { word: string; colors: Color[] }

export function colorGuess(
  word: string,
  guesses: Guess[],
  answerList: string[]
): Guess {
  const potentialAnswers = getPotentialAnswers(guesses, answerList)
  const colorings = potentialAnswers.map(answer =>
    _wordleColoring(word, answer).join()
  )
  const coloring = chooseFromColorings(colorings)

  if (!coloring) {
    throw new Error('No coloring could be determined 🤔')
  }

  return { word, colors: coloring.split(',') as Color[] }
}

export function makesValidWord(word: string) {
  return guessWords.includes(word)
}

// exported for testing
export function _wordleColoring(guess: string, answer: string): Color[] {
  const result: Color[] = Array(5).fill('grey')
  const unmatched: string[] = []
  for (let i = 0; i < 5; i++) {
    if (guess[i] === answer[i]) result[i] = 'green'
    else unmatched.push(answer[i])
  }
  for (let i = 0; i < 5; i++) {
    if (result[i] === 'green') continue
    const j = unmatched.indexOf(guess[i])
    if (j !== -1) {
      result[i] = 'yellow'
      unmatched.splice(j, 1)
    }
  }
  return result
}

type PositionConstraint = { yes: string | undefined; no: Set<string> }
type CountConstraints = Record<string, { min: number; max: number }>
type Constraints = { count: CountConstraints; position: PositionConstraint[] }

function getPotentialAnswers(guesses: Guess[], answerList: string[]) {
  const constraints = initialConstraints()
  guesses.forEach(guess => narrowConstraints(constraints, guess))

  return answerList.filter(word => meetsConstraints(word, constraints))
}

function narrowConstraints(constraints: Constraints, guess: Guess) {
  const { count, position } = constraints
  const { word, colors } = guess

  new Set(word).forEach(letter => {
    const letterCountConstraint = count[letter]
    let greenish = 0
    let grey = 0
    colors.forEach((color, index) => {
      if (word[index] !== letter) {
        return
      }
      if (color === 'green') {
        greenish++
        position[index].yes = letter
        return
      }
      if (color === 'yellow') {
        greenish++
        position[index].no.add(letter)
        return
      }
      grey++
      position[index].no.add(letter)
    })

    if (greenish > letterCountConstraint.min) {
      letterCountConstraint.min = greenish
    }
    if (grey) {
      letterCountConstraint.max = greenish
    }
  })
}

function initialConstraints(): Constraints {
  const count = Object.fromEntries(
    alphabet.map(letter => [letter, { min: 0, max: 5 }])
  )

  const position = Array.from({ length: 5 }, () => ({
    yes: undefined,
    no: new Set<string>(),
  }))

  return { count, position }
}

function meetsConstraints(word: string, constraints: Constraints) {
  return (
    meetsPositionConstraints(word, constraints.position) &&
    meetsCountConstraints(word, constraints.count)
  )
}

function meetsPositionConstraints(
  word: string,
  constraints: PositionConstraint[]
) {
  return constraints.every(({ yes, no }, index) => {
    const letter = word[index]
    return (!yes || yes === letter) && !no.has(letter)
  })
}

function meetsCountConstraints(word: string, constraints: CountConstraints) {
  const letterCounts = letterCountsByWord[word]
  return Object.entries(letterCounts).every(([letter, count]) => {
    const { min, max } = constraints[letter]
    return count >= min && count <= max
  })
}

const allGreen = 'green,green,green,green,green'

function chooseFromColorings(colorings: string[]) {
  const counts = new Map<string, number>()
  for (const coloring of colorings) {
    counts.set(coloring, (counts.get(coloring) ?? 0) + 1)
  }

  // two commonest colorings, least common first (stable sort keeps ties in
  // first-seen order)
  const bestTwo = [...counts]
    .sort((a, b) => a[1] - b[1])
    .slice(-2)
    .map(([coloring]) => coloring)

  if (bestTwo.length === 1) {
    return bestTwo[0]
  }
  // if tied with winning coloring, remove winning coloring
  return bestTwo.filter(coloring => coloring !== allGreen).at(-1)
}

function countLetters(word: string) {
  return Object.fromEntries(
    alphabet.map(letter => [letter, word.split(letter).length - 1])
  )
}

const letterCountsByWord = Object.fromEntries(
  guessWords.map(word => [word, countLetters(word)])
)
