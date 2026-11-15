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

export type LetterColor = 'green' | 'yellow' | 'grey'
export type KeyColor = LetterColor | 'lightgrey'
type GuessedLetter = { letter: Letter; color: LetterColor }
export type Guessed = GuessedLetter[]

export function colorGuess(
  guess: Letter[],
  guesseds: Guessed[],
  answerList: string[]
): Guessed {
  const potentialAnswers = getPotentialAnswers(guesseds, answerList)
  const answerColorings = colorPotentialAnswers(potentialAnswers, guess)
  const coloringString = chooseFromColorings(answerColorings)

  if (!coloringString) {
    throw new Error('No coloring could be determined 🤔')
  }

  const coloring = JSON.parse(coloringString)

  return guess.map((letter, index) => ({
    letter: letter,
    color: coloring[index] as LetterColor,
  }))
}

export function makesValidWord(letters: Letter[]) {
  return guessWords.includes(letters.join(''))
}

type PositionConstraint = { yes: Letter | undefined; no: Set<Letter> }
type PositionConstraints = [
  PositionConstraint,
  PositionConstraint,
  PositionConstraint,
  PositionConstraint,
  PositionConstraint,
]
type CountConstraints = Record<Letter, { min: number; max: number }>
type Constraints = { count: CountConstraints; position: PositionConstraints }

function getPotentialAnswers(guesseds: Guessed[], answerList: string[]) {
  const constraints = initialConstraints()
  guesseds.forEach(guessed => narrowConstraints(constraints, guessed))

  return answerList.filter(word =>
    meetsConstraints(word.split('') as Letter[], constraints)
  )
}

function narrowConstraints(constraints: Constraints, guessed: Guessed) {
  const { count, position } = constraints

  new Set(guessed.map(gl => gl.letter)).forEach(letter => {
    const letterCountConstraint = count[letter]
    let greenish = 0
    let grey = 0
    guessed.forEach((gl, index) => {
      if (gl.letter !== letter) {
        return
      }
      if (gl.color === 'green') {
        greenish++
        position[index].yes = letter
        return
      }
      if (gl.color === 'yellow') {
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
    count[letter] = letterCountConstraint
  })
}

function initialConstraints(): Constraints {
  const count = Object.fromEntries(
    alphabet.map(letter => [letter, { min: 0, max: 5 }])
  ) as CountConstraints

  const placement = Array(5)
    .fill(undefined)
    .map(() => ({
      yes: undefined,
      no: new Set<Letter>(),
    })) as PositionConstraints

  return { count: count, position: placement }
}

function meetsConstraints(guess: Letter[], constraints: Constraints) {
  return (
    meetsPositionConstraints(guess, constraints.position) &&
    meetsCountConstraints(guess, constraints.count)
  )
}

function meetsPositionConstraints(
  guess: Letter[],
  constraints: PositionConstraints
) {
  return guess.every((letter, index) => {
    const constraint = constraints[index]
    if (constraint.yes && constraint.yes !== letter) {
      return false
    }
    if (constraint.no.has(letter)) {
      return false
    }
    return true
  })
}

function meetsCountConstraints(
  answer: Letter[],
  constraints: CountConstraints
) {
  const letterCounts = letterCountsByGuess[answer.join('')]
  return Object.entries(letterCounts).every(([letter, count]) => {
    const constraint = constraints[letter as Letter]
    if (count < constraint.min || count > constraint.max) {
      return false
    }
    return true
  })
}

function colorPotentialAnswers(answers: string[], guess: Letter[]) {
  return answers.map(answer =>
    JSON.stringify(coloringForAnswer(guess, answer.split('') as Letter[]))
  )
}

function coloringForAnswer(guess: Letter[], answer: Letter[]): LetterColor[] {
  const guessLetterCounts = {} as Partial<Record<Letter, number>>

  const coloringGreenOnly: ('green' | undefined)[] = answer.map(
    (answerLetter, index) => {
      const guessLetter = guess[index]
      if (guessLetter !== answerLetter) {
        return
      }

      guessLetterCounts[guessLetter] = (guessLetterCounts[guessLetter] ?? 0) + 1

      return 'green'
    }
  )

  const coloring = coloringGreenOnly.map((color, index) => {
    if (color) {
      return color
    }

    const guessLetter = guess[index]

    const guessLetterCount = (guessLetterCounts[guessLetter] ?? 0) + 1
    guessLetterCounts[guessLetter] = guessLetterCount

    if (guessLetterCount <= letterCountsByGuess[answer.join('')][guessLetter]) {
      return 'yellow'
    }
    return 'grey'
  })

  return coloring
}

const allGreen = '["green","green","green","green","green"]'

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

function countLetters(guess: Letter[]) {
  return Object.fromEntries(
    alphabet.map(letter => [letter, guess.filter(l => l === letter).length])
  ) as Record<Letter, number>
}

const letterCountsByGuess = Object.fromEntries(
  guessWords.map(word => [word, countLetters(word.split('') as Letter[])])
)
