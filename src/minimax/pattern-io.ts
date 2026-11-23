import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { answerWords, guessWords } from '../words'
import { buildPatternTable } from './pattern'

export const patternTablePath = new URL(
  '../../data/pattern-table.bin',
  import.meta.url
)

// builds the table for the full guess and answer lists and writes it to path
export function savePatternTable(path: URL = patternTablePath): Uint8Array {
  const patternTable = buildPatternTable(guessWords, answerWords)
  mkdirSync(new URL('.', path), { recursive: true })
  writeFileSync(path, patternTable)
  return patternTable
}

// the saved table covers the full guess and answer lists
export function loadPatternTable(
  path: URL | string = patternTablePath
): Uint8Array {
  const buffer = readFileSync(path)
  const expected = guessWords.length * answerWords.length
  if (buffer.byteLength !== expected) {
    throw new Error(
      `pattern table at ${path} has ${buffer.byteLength} bytes, expected ${expected}; rerun save-pattern-table`
    )
  }
  return new Uint8Array(buffer.buffer, buffer.byteOffset, buffer.byteLength)
}
