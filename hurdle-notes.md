
# nodes:

(GP)^D
= 6e32 (600 nonillion)

# constants

G - 15_000

A - 2000

P - 243 possible patterns

D - 5 max guesses solved elsewhere

G*A = 34M guess-answer colorings

# log

## 1

- worked out naive algo.
- Most time will likely be spent in partition function.
- benchmarked partition @ 1.8ms / guess for all answers
- nodes to visit: (PG)^D = 6e32
- total time: 36 sextillion years (yes really)

algorithm:

```
partition(answerSet, guess) : {pattern, set} {
  foreach answer of answerSet, find pattern for answer/guess.
  group by pattern
}

guessSolves(guess, answerSet, numGuesses){
  partition answerSet -> nextAnswerSets
  solves = nextAnswerSets.every(set => solvable(set, numGuesses - 1))
}

solvable(answerSet, numGuesses){
  numGuesses = 0 ? false
  |answerSet| = 1 ? true

  solvable = guesses.any(guessSolves)
}

guessesNeeded(set){
  numGuesses = 1
  while(!solvable(set, numGuesses)){
    numGuesses++
  }
}

choosePattern(answerSet, guess) : Pattern {
  partition answerSet by pattern for guess -> outcomes
  foreach {pattern, set} of outcomes {
    guessesNeeded(set)
  } return pattern w/max guesses
}
```
