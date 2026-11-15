import { alphabet, Guess, Letter } from '../logic'
import { KeyColor } from '../ui/colors'
import { BackspaceKey } from './BackspaceKey'
import { EnterKey } from './EnterKey'
import { LetterKey } from './LetterKey'

export function Keyboard(props: {
  guesses: Guess[]
  handleKey: (key: string) => void
}) {
  const coloring = keyboardColoring(props.guesses)

  return (
    <div className="flex w-full flex-col space-y-1 p-2 pb-4">
      <div className="flex w-full space-x-1">
        {keysFromLetters('QWERTYUIOP', coloring, props.handleKey)}
      </div>
      <div className="flex content-center space-x-1">
        <div className="flex-[0.5]" />
        {keysFromLetters('ASDFGHJKL', coloring, props.handleKey)}
        <div className="flex-[0.5]" />
      </div>
      <div className="flex content-center space-x-1">
        <EnterKey onClick={() => props.handleKey('Enter')} />
        {keysFromLetters('ZXCVBNM', coloring, props.handleKey)}
        <BackspaceKey onClick={() => props.handleKey('Backspace')} />
      </div>
    </div>
  )
}

function keysFromLetters(
  letters: string,
  coloring: Record<string, KeyColor>,
  handleKey: (key: string) => void
) {
  return (letters.split('') as Letter[]).map(letter => (
    <LetterKey
      letter={letter}
      color={coloring[letter]}
      key={letter}
      onClick={() => handleKey(letter)}
    />
  ))
}

const colorPriority: KeyColor[] = ['unused', 'grey', 'yellow', 'green']

// each key shows the best color its letter has received in any guess
function keyboardColoring(guesses: Guess[]) {
  const coloring: Record<string, KeyColor> = Object.fromEntries(
    alphabet.map(letter => [letter, 'unused'])
  )
  for (const { word, colors } of guesses) {
    colors.forEach((color, index) => {
      const letter = word[index]
      if (
        colorPriority.indexOf(color) > colorPriority.indexOf(coloring[letter])
      ) {
        coloring[letter] = color
      }
    })
  }
  return coloring
}
