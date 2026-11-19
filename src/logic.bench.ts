import { test } from 'vitest';
import { _wordleColoring } from './logic';
import { answerWords } from './words';

const color = _wordleColoring;
const someAnswers = answerWords.slice(0,1000);

test('_wordleColoring CRANE', async ({ bench }) => {
  await bench(
    `_wordleColoring ('CRANE' × ${someAnswers.length} answers)`,
    () => {
        for (const answer of someAnswers) {
          color('CRANE', answer)
        }
    }
  ).run({ iterations: 10, warmupIterations: 2 })
})

test('_wordleColoring QAJAQ', async ({ bench }) => {
  await bench(
    `_wordleColoring ('QAJAQ' × ${someAnswers.length} answers)`,
    () => {
        for (const answer of someAnswers) {
          color('QAJAQ', answer)
        }
    }
  ).run({ iterations: 10, warmupIterations: 2 })
})
