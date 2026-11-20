import { PatternLookup } from './patterns'

export type Partition = { pattern: number; answerSet: number[] }

export function partition(
  answerSet: number[],
  guess: number,
  patternLookup: PatternLookup
): Partition[] {
  const byPattern = new Map<number, Partition>()
  for (const answer of answerSet) {
    const pattern = patternLookup(guess, answer)
    const key = pattern
    const group = byPattern.get(key)
    if (group) group.answerSet.push(answer)
    else byPattern.set(key, { pattern, answerSet: [answer] })
  }
  return [...byPattern.values()]
}
