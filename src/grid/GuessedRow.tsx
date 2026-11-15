import { Guessed, letterToCardColorMap } from '../data/types'
import { LetterCard } from './LetterCard'

export function GuessedRow(props: { guessed: Guessed }) {
  return (
    <div className="flex content-center space-x-1">
      {props.guessed.map((guessedLetter, index) => {
        return (
          <LetterCard
            letter={guessedLetter.letter}
            color={
              // "black"
              letterToCardColorMap[guessedLetter.color]
            }
            key={index}
          />
        )
      })}
    </div>
  )
}
