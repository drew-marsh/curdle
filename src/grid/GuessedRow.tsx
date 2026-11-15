import { Guessed } from '../logic'
import { letterToCardColorMap } from '../ui/colors'
import { LetterCard } from '../ui/LetterCard'

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
