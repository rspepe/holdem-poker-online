import Card from './Card';
import { PLAYER_STATUS } from '../../utils/constants';

export default function Player({ player, isActive, isDealer, showCards }) {
  const isFolded = player.status === PLAYER_STATUS.FOLDED;
  const isAllIn = player.status === PLAYER_STATUS.ALL_IN;
  const isOut = player.status === PLAYER_STATUS.OUT;

  return (
    <div className={`relative ${isOut ? 'opacity-30' : ''}`}>
      {/* Player info card */}
      <div
        className={`bg-gradient-to-br ${
          isFolded ? 'from-gray-600 to-gray-800' :
          isActive ? 'from-green-600 to-green-800' :
          'from-blue-600 to-blue-800'
        } rounded-lg p-3 shadow-lg border-2 ${
          isActive ? 'border-yellow-400 ring-2 ring-yellow-400' : 'border-gray-700'
        } min-w-[140px]`}
      >
        {/* Dealer button */}
        {isDealer && (
          <div className="absolute -top-2 -right-2 bg-white text-black rounded-full w-8 h-8 flex items-center justify-center font-bold text-xs border-2 border-yellow-400">
            D
          </div>
        )}

        {/* Player name and chips */}
        <div className="text-white text-center mb-2">
          <div className="font-bold text-lg">{player.name}</div>
          <div className="text-sm opacity-90">{player.chips} chips</div>
        </div>

        {/* Status badges */}
        <div className="flex gap-1 justify-center mb-2">
          {isFolded && (
            <span className="text-xs bg-red-500 text-white px-2 py-1 rounded">
              FOLDED
            </span>
          )}
          {isAllIn && (
            <span className="text-xs bg-yellow-500 text-black px-2 py-1 rounded font-bold">
              ALL-IN
            </span>
          )}
          {isOut && (
            <span className="text-xs bg-gray-500 text-white px-2 py-1 rounded">
              OUT
            </span>
          )}
        </div>

        {/* Hole cards */}
        <div className="flex gap-1 justify-center">
          {player.holeCards.length > 0 && (
            <>
              <Card
                card={showCards ? player.holeCards[0] : null}
                faceDown={!showCards}
                className="scale-75"
              />
              <Card
                card={showCards ? player.holeCards[1] : null}
                faceDown={!showCards}
                className="scale-75"
              />
            </>
          )}
        </div>

        {/* Current bet */}
        {player.bet > 0 && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-red-600 text-white px-3 py-1 rounded-full text-sm font-bold shadow-lg">
            Bet: {player.bet}
          </div>
        )}
      </div>
    </div>
  );
}
