import { Letter, alphabet } from '../data/letters'
import { Guessed } from '../data/types'
import { letterCountsByGuess } from './count-letters'

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

export function getPotentialAnswers(guesseds: Guessed[], answerList: string[]) {
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
