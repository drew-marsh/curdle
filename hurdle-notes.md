# algorithm

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
  partition answerSet by pattern for guess
  foreach {pattern, set} {
    guessesNeeded(set)
  } return pattern w/max guesses
}
```

# nodes:

(GP)^D
= 6e32 (600 nonillion)

# constants

G - 15_000

A - 2000

P - 243 possible patterns

D - 5 max guesses solved elsewhere

G\*A = 34M guess-answer patterns

# log

## 1

- worked out naive algo.
- Most time will likely be spent in partition function.
- benchmarked partition @ 1.8ms / guess for all answers
- nodes to visit: (PG)^D = 6e32
- total time: 36 sextillion years (yes really)

## 2

- goal: precompute all patterns (obvious improvement)
- 34M patterns
- pattern is array - 5 strings up to 6 chars each = 30 bytes
- 850 MB
- size problem. solution: encode
- pattern can encode as 5-digit base 3, max 243 conveniently fits in 1 byte
- 34MB
- save pattern as #
- create pattern table indexed by answerIndex\*numGuessWords + guessIndex
- 10s for whole answer/guess list
- store as file for now
- new bench for partition: 1.8 -> .04 ms
- estimated time: 800 quintillion years (much faster)

## 3

- naive implementation
- ideas:
  - choosePattern:
    - sort options by heuristic (bucket size?) for likely early find & tie-breaker
    - fail fast on other options when solvable(maxGuesses)
  - solvable:
    - failfast: set 2, guesses 2
    - failfast: separable, guesses 2
    - sort guesses? not sure if there's a good heuristic
  - partition:
    - map seems expensive
  - count node visits

## 4

- optimize choosePattern a bit.
- count node visits & run some benchmarks:

| set                      | size | guesses |   time | guess nodes |   set nodes |
| ------------------------ | ---: | ------: | -----: | ----------: | ----------: |
| \_ATCH                   |    7 |       3 |  0.10s |     135,480 |      90,116 |
| \_IGHT                   |    9 |       3 |  1.03s |   2,254,212 |   2,656,156 |
| \_IGHT + \_OUND          |   17 |       3 | 18.91s |  49,121,167 |  58,407,756 |
| \_IGHT + \_OUND + \_ATCH |   24 |       4 | 87.94s | 224,240,990 | 269,853,396 |
