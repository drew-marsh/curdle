import { LetterCard } from '../grid/LetterCard';
import { Game } from './use-game';

export function Win(props: { game: Game }) {
  const { game } = props;
  const numGuesses = game.guesseds.length;
  const guessesColor = getWinTileColor(numGuesses, game.hardMode);
  return (
    <div className={`flex flex-col items-center space-y-1`}>
      <div className="flex items-center space-x-1">
        <p className="text-center text-2xl">You won in</p>
        <LetterCard
          color={guessesColor}
          letter={`${numGuesses}`}
          fontSize="text-base"
        />
        <p className="text-center text-2xl">guesses!</p>
      </div>
      <button onClick={game.reset}>
        <div className="rounded-md bg-green-700">
          <p className="m-1 text-center text-white">Play Again</p>
        </div>
      </button>
    </div>
  );
}

function getWinTileColor(numGuesses: number, hardMode: boolean) {
  if (hardMode) {
    if (numGuesses === 5) {
      return 'green';
    }
    if (numGuesses === 6) {
      return 'yellow';
    }
    return 'grey';
  }
  if (numGuesses === 4) {
    return 'green';
  }
  if (numGuesses === 5) {
    return 'yellow';
  }
  return 'grey';
}
