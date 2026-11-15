import { CardColor } from '../ui/colors'
import { LetterCard } from '../ui/LetterCard'
import { guessWords } from '../words'

export function EntryRow(props: { entry: string }) {
  const color = getColor(props.entry)
  return (
    <div className="flex content-center space-x-1">
      {Array.from({ length: 5 }, (_, index) => (
        <LetterCard letter={props.entry[index]} color={color} key={index} />
      ))}
    </div>
  )
}

function getColor(entry: string): CardColor {
  return guessWords.some(word => word.startsWith(entry)) ? 'blank' : 'invalid'
}
