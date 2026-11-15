import { GameGrid } from './grid/GameGrid'
import { Keyboard } from './keyboard/Keyboard'
import { Header } from './header/Header'
import { Win } from './header/Win'
import { getKeyHandler, useGame, useKeyDownListener } from './hooks'

function App() {
  const game = useGame()

  useKeyDownListener(game)

  return (
    <div className="flex h-screen justify-center">
      <div className="flex h-dvh w-full max-w-[430px] flex-col sm:h-[90dvh]">
        <Header game={game} />
        <div className="flex h-full flex-col items-center justify-between">
          <GameGrid game={game} />
          {game.win && <Win game={game} />}
          <Keyboard guesseds={game.guesseds} handleKey={getKeyHandler(game)} />
        </div>
      </div>
    </div>
  )
}

export default App
