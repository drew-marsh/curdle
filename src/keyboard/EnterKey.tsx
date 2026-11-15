import { KeyboardButton } from './KeyboardButton'

export function EnterKey(props: React.ComponentProps<'button'>) {
  return (
    <KeyboardButton
      {...props}
      color="unused"
      className="min-w-14 flex-[1.5] text-sm"
    >
      <p className="text-sm">ENTER</p>
    </KeyboardButton>
  )
}
