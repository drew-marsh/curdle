import { Color } from '../logic'

export type KeyColor = Color | 'unused'
export type CardColor = KeyColor | 'blank' | 'invalid' | 'black' | 'red'

export const cardColors = {
  green: { bg: 'bg-green-700', text: 'text-white' },
  grey: { bg: 'bg-neutral-500', text: 'text-white' },
  yellow: { bg: 'bg-[#daa520]', text: 'text-white' },
  blank: { bg: 'bg-white', text: 'text-black' },
  unused: { bg: 'bg-neutral-300', text: 'text-black' },
  black: { bg: 'bg-black', text: 'text-white' },
  red: { bg: 'bg-red-900', text: 'text-white' },
  invalid: { bg: 'bg-white', text: 'text-red-600' },
} satisfies Record<CardColor, { bg: string; text: string }>
