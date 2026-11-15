import { guessWords } from '../data/guess-words'
import { Letter, alphabet } from '../data/letters'

export function countLetters(guess: Letter[]) {
  return Object.fromEntries(
    alphabet.map(letter => [letter, guess.filter(l => l === letter).length])
  ) as Record<Letter, number>
}

export const letterCountsByGuess = Object.fromEntries(
  guessWords.map(word => [word, countLetters(word.split('') as Letter[])])
)
