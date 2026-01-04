import { GameProvider } from './context/GameContext'
import Table from './components/game/Table'

function App() {
  return (
    <GameProvider>
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <Table />
      </div>
    </GameProvider>
  )
}

export default App
