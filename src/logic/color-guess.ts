import { Letter } from '../data/letters'
import { Guessed, LetterColor } from '../data/types'
import { chooseFromColorings } from './choose-from-colorings'
import { colorPotentialAnswers } from './color-potential-answers'
import { getPotentialAnswers } from './get-potential-answers'

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
