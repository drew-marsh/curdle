import { BackspaceOutlined } from '../ui/icons'
import { KeyboardButton } from './KeyboardButton'

export function BackspaceKey(props: React.ComponentProps<'button'>) {
  return (
    <KeyboardButton {...props} color="unused">
      <BackspaceOutlined width={20} height={20} />
    </KeyboardButton>
  )
}
