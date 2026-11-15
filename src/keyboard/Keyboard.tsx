import { Letter, alphabet } from '../data/letters'
import {
  Guessed,
  KeyColor,
  LetterColor,
  letterToCardColorMap,
} from '../data/types'
import { BackspaceKey } from './BackspaceKey'
import { EnterKey } from './EnterKey'
import { LetterKey } from './LetterKey'

export function Keyboard(props: {
  guesseds: Guessed[]
  handleKey: (key: string) => void
}) {
  const coloring = keyboardColoring(props.guesseds)

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
  coloring: Record<Letter, KeyColor>,
  handleKey: (key: string) => void
) {
  return (letters.split('') as Letter[]).map(letter => (
    <LetterKey
      letter={letter}
      color={letterToCardColorMap[coloring[letter]]}
      key={letter}
      onClick={() => handleKey(letter)}
    />
  ))
}

function keyboardColoring(guesseds: Guessed[]) {
  const letterMap = Object.fromEntries(
    alphabet.map(letter => [letter, 'lightgrey'])
  )
  const guessedLetters = guesseds.flat()

  addColorToKeyboard(guessedLetters, letterMap, 'grey')
  addColorToKeyboard(guessedLetters, letterMap, 'yellow')
  addColorToKeyboard(guessedLetters, letterMap, 'green')

  return letterMap as Record<Letter, KeyColor>
}

function addColorToKeyboard(
  guessedLetters: Guessed,
  letterMap: { [k: string]: string },
  color: LetterColor
) {
  const lettersThatColor = new Set(
    guessedLetters.filter(l => l.color === color).map(gl => gl.letter)
  )
  lettersThatColor.forEach(letter => (letterMap[letter] = color))
}
