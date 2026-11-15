import { Letter } from '../logic'
import { CardColor } from '../ui/colors'
import { KeyboardButton } from './KeyboardButton'

export function LetterKey(
  props: React.ComponentProps<'button'> & { letter: Letter; color: CardColor }
) {
  const { letter, color, ...buttonProps } = props
  return (
    <KeyboardButton {...buttonProps} color={color}>
      {letter}
    </KeyboardButton>
  )
}
