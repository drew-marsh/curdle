import { Letter } from '../logic'
import { CardColor } from '../ui/colors'
import { LetterCard } from '../ui/LetterCard'
import { guessWords } from '../words'

export function EntryRow(props: { entry: Letter[] }) {
  return (
    <div className="flex content-center space-x-1">
      {Array(5)
        .fill(undefined)
        .map((_, index) => (
          <LetterCard
            letter={props.entry[index]}
            color={getColor(props.entry)}
            key={index}
          />
        ))}
    </div>
  )
}

function getColor(entry: Letter[]): CardColor {
  return guessWords.find(word => word.startsWith(entry.join('')))
    ? 'white'
    : 'white-red'
}
