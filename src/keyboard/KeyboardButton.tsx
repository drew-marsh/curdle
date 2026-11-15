import { twMerge } from 'tailwind-merge'
import { CardColor, cardColors } from '../ui/colors'

export function KeyboardButton(
  props: React.ComponentProps<'button'> & {
    color: CardColor
    className?: string
  }
) {
  const { color, className, ...buttonProps } = props
  const { bg, text } = cardColors[color]
  return (
    <button
      {...buttonProps}
      className={twMerge(
        `flex min-h-5 min-w-5 flex-1 items-center justify-center p-1 ${text} text-lg ${bg} rounded-md border active:bg-neutral-700`,
        className
      )}
    >
      {props.children}
    </button>
  )
}
