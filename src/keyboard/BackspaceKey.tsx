import { BackspaceOutlined } from '../icons'
import { KeyboardButton } from './KeyboardButton'

export function BackspaceKey(props: React.ComponentProps<'button'>) {
  return (
    <KeyboardButton {...props} color="lightgrey">
      <BackspaceOutlined width={20} height={20} />
    </KeyboardButton>
  )
}
