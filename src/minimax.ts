import { _wordleColoring, type Color } from './logic'

export type Partition = { pattern: Color[]; answerSet: string[] }

// group the answers by the pattern the guess gets against each. groups are in
// order of their first answer, and keep the answers' original order
export function partition(answerSet: string[], guess: string): Partition[] {
  const byPattern = new Map<string, Partition>()
  for (const answer of answerSet) {
    const pattern = _wordleColoring(guess, answer)
    const key = pattern.join()
    const group = byPattern.get(key)
    if (group) group.answerSet.push(answer)
    else byPattern.set(key, { pattern, answerSet: [answer] })
  }
  return [...byPattern.values()]
}
