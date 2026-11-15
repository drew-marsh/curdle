import { Game } from '../hooks'
import { EntryRow } from './EntryRow'
import { GuessedRow } from './GuessedRow'

export function GameGrid(props: { game: Game }) {
  const { guesses, entry, win } = props.game
  const numSkeletons = 6 - guesses.length - (win ? 0 : 1)

  return (
    <div className="flex flex-col space-y-1 p-2">
      {guesses.map((guess, index) => (
        <GuessedRow guess={guess} key={index} />
      ))}
      {!win && <EntryRow entry={entry} />}
      {numSkeletons > 0 &&
        Array(numSkeletons)
          .fill(undefined)
          .map((_, index) => <EntryRow key={index} entry="" />)}
    </div>
  )
}
