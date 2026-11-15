const allGreen = '["green","green","green","green","green"]';

export function chooseFromColorings(colorings: string[]) {
  const counts = new Map<string, number>();
  for (const coloring of colorings) {
    counts.set(coloring, (counts.get(coloring) ?? 0) + 1);
  }

  // two commonest colorings, least common first (stable sort keeps ties in
  // first-seen order)
  const bestTwo = [...counts]
    .sort((a, b) => a[1] - b[1])
    .slice(-2)
    .map(([coloring]) => coloring);

  if (bestTwo.length === 1) {
    return bestTwo[0];
  }
  // if tied with winning coloring, remove winning coloring
  return bestTwo.filter(coloring => coloring !== allGreen).at(-1);
}
