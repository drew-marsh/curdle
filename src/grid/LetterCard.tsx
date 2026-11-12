import { CardColor, cardColors } from '../data/types';

export function LetterCard(props: {
  letter?: string;
  color: CardColor;
  fontSize?: string;
}) {
  const colors = cardColors[props.color];
  const fontSize = props.fontSize ?? 'text-3xl';
  return (
    <div
      className={`flex items-center justify-center ${colors.bg} rounded-md border ${fontSize} h-[1.5em] w-[1.5em] ${colors.text} `}
    >
      {props.letter}
    </div>
  );
}
