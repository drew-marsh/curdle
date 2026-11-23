import { patternTablePath, savePatternTable } from '../minimax/pattern-io'

const start = performance.now()
const patternTable = savePatternTable()
const seconds = ((performance.now() - start) / 1000).toFixed(1)
console.log(
  `wrote ${patternTable.byteLength} bytes to ${patternTablePath.pathname} in ${seconds}s`
)
