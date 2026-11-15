import { KeyColor } from '../logic'

export type CardColor =
  | 'green'
  | 'grey'
  | 'yellow'
  | 'white'
  | 'lightgrey'
  | 'black'
  | 'red'
  | 'white-red'

export const letterToCardColorMap = {
  green: 'green',
  grey: 'grey',
  lightgrey: 'lightgrey',
  yellow: 'yellow',
} satisfies Record<KeyColor, CardColor>

export const cardColors = {
  green: { bg: 'bg-green-700', text: 'text-white' },
  grey: { bg: 'bg-neutral-500', text: 'text-white' },
  yellow: { bg: 'bg-[#daa520]', text: 'text-white' },
  white: { bg: 'bg-white', text: 'text-black' },
  lightgrey: { bg: 'bg-neutral-300', text: 'text-black' },
  black: { bg: 'bg-black', text: 'text-white' },
  red: { bg: 'bg-red-900', text: 'text-white' },
  'white-red': { bg: 'bg-white', text: 'text-red-600' },
} satisfies Record<CardColor, { bg: string; text: string }>
