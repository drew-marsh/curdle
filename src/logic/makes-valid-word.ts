import { guessWords } from '../data/guess-words'
import { Letter } from '../data/letters'

export function makesValidWord(letters: Letter[]) {
  return guessWords.includes(letters.join(''))
}
