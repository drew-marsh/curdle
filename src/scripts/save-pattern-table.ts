import { mkdirSync, writeFileSync } from 'node:fs'
import { buildPatternTable, patternTablePath } from '../minimax/patterns'
import { answerWords, guessWords } from '../words'

const start = performance.now()
const patternTable = buildPatternTable(guessWords, answerWords)
mkdirSync(new URL('.', patternTablePath), { recursive: true })
writeFileSync(patternTablePath, patternTable)
const seconds = ((performance.now() - start) / 1000).toFixed(1)
console.log(
  `wrote ${patternTable.byteLength} bytes to ${patternTablePath.pathname} in ${seconds}s`
)
