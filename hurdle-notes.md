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

## 5

- add optimization: if 2 guesses, 2 answers, solvable
  - only makes .0001% difference in bench script node visits. expected more
- add separable function
  - to solve in 2, there must be a guess that separates the answer set into subsets of 1
  - could be a big win because it removes a layer of partitioning from the tree
  - hopefully this is more efficient than splitting
  - hopefully this saves more node visits than the last idea
  - iterate through answers, look up pattern, stop at first collision
  - use generation counter to avoid allocating
  - result: separable benchmarks at 20-30x faster than solvable in 2

| set                      | size | guesses | time  | guess nodes | set nodes |
| ------------------------ | ---- | ------- | ----- | ----------- | --------- |
| \_ATCH                   | 7    | 3       | 0.00s | 12          | 21        |
| \_IGHT                   | 9    | 3       | 0.04s | 171         | 224       |
| \_IGHT + \_OUND          | 17   | 3       | 0.78s | 3,302       | 4,854     |
| \_IGHT + \_OUND + \_ATCH | 24   | 4       | 3.45s | 15,047      | 22,790    |

WOW time for new benchmarks

| set              | size | guesses |  time | guess nodes | set nodes |
| ---------------- | ---: | ------: | ----: | ----------: | --------: |
| \_ATCH           |    7 |       3 | 0.01s |          12 |        21 |
| families of 6+   |   80 |       4 | 4.06s |      16,392 |    22,609 |
| every 5th answer |  462 |       4 | 6.39s |      15,036 |    30,777 |

- every 2nd answer comes in @ 250s
- good progress!

## 6

- a poor guess QAJAQ leaves an answer set over half the table - so we're looking at 10s of minutes for response time
- a good guess, CRANE has largest group around 263 answers
- will be less random than 'every 5th answer' but might still be reasonable to benchmark now

| choosePattern | answers | pattern | left |   time | guess nodes | set nodes |
| ------------- | ------: | ------: | ---: | -----: | ----------: | --------: |
| CRANE         |    2309 |       9 |  133 | 83.77s |     219,783 |   374,350 |

- added group-sorting optimization in choosePattern:

| choosePattern | answers | pattern | left |   time | guess nodes | set nodes |
| ------------- | ------: | ------: | ---: | -----: | ----------: | --------: |
| CRANE         |    2309 |       0 |  263 | 52.82s |     151,897 |   247,868 |

## 7

- order guesses
- reasoning:
  - splittable returns on first solvable guess
  - try likely guesses first
- strategy:
  - use curdle heuristic - minimize size of the largest partition
- naive implementation benchmarks @ 200ms
- it slows down response overall but drastically reduces number of nodes
- so, worth pursuing

| choosePattern | answers | pattern | left |    time | guess nodes | set nodes |
| ------------- | ------: | ------: | ---: | ------: | ----------: | --------: |
| CRANE         |    2309 |       0 |  263 | 114.54s |      15,410 |    26,389 |
