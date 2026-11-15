import { LetterColor } from './logic'

// standard wordle coloring, used as a reference to check colorGuess against
export function wordleColoring(guess: string, answer: string): LetterColor[] {
  const result: LetterColor[] = Array(5).fill('grey')
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
