import { Letter } from '../data/letters';
import { LetterColor } from '../data/types';
import { letterCountsByGuess } from './count-letters';

export function colorPotentialAnswers(answers: string[], guess: Letter[]) {
  return answers.map(answer =>
    JSON.stringify(coloringForAnswer(guess, answer.split('') as Letter[]))
  );
}

function coloringForAnswer(guess: Letter[], answer: Letter[]): LetterColor[] {
  const guessLetterCounts = {} as Partial<Record<Letter, number>>;

  const coloringGreenOnly: ('green' | undefined)[] = answer.map(
    (answerLetter, index) => {
      const guessLetter = guess[index];
      if (guessLetter !== answerLetter) {
        return;
      }

      guessLetterCounts[guessLetter] =
        (guessLetterCounts[guessLetter] ?? 0) + 1;

      return 'green';
    }
  );

  const coloring = coloringGreenOnly.map((color, index) => {
    if (color) {
      return color;
    }

    const guessLetter = guess[index];

    const guessLetterCount = (guessLetterCounts[guessLetter] ?? 0) + 1;
    guessLetterCounts[guessLetter] = guessLetterCount;

    if (guessLetterCount <= letterCountsByGuess[answer.join('')][guessLetter]) {
      return 'yellow';
    }
    return 'grey';
  });

  return coloring;
}
