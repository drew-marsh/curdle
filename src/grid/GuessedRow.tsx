import { Guess } from '../logic'
import { LetterCard } from '../ui/LetterCard'

export function GuessedRow(props: { guess: Guess }) {
  const { word, colors } = props.guess
  return (
    <div className="flex content-center space-x-1">
      {colors.map((color, index) => (
        <LetterCard letter={word[index]} color={color} key={index} />
      ))}
    </div>
  )
}
