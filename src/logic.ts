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
  const answers = getPotentialAnswers(guesses, answerList)
  const colors = chooseColoring(word, answers)

  if (!colors) {
    throw new Error('No coloring could be determined 🤔')
  }

  return { word, colors }
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

// narrow the full answer list, guess by guess, to the answers that would have
// produced each guess's colors
function getPotentialAnswers(guesses: Guess[], answerList: string[]) {
  return guesses.reduce(
    (answers, { word, colors }) => {
      const pattern = colors.join()
      return answers.filter(
        answer => _wordleColoring(word, answer).join() === pattern
      )
    },
    answerList
  )
}

const allGreen = 'green,green,green,green,green'

function chooseColoring(word: string, answers: string[]) {
  const groupSizes = new Map<string, number>()
  for (const answer of answers) {
    const coloring = _wordleColoring(word, answer).join()
    groupSizes.set(coloring, (groupSizes.get(coloring) ?? 0) + 1)
  }
  if (groupSizes.size > 1) {
    groupSizes.delete(allGreen)
  }

  let best: string | undefined
  let bestSize = 0
  for (const [coloring, size] of groupSizes) {
    if (size > bestSize) {
      best = coloring
      bestSize = size
    }
  }
  return best?.split(',') as Color[] | undefined
}
