import { useState } from 'react';
import { getValidActions } from '../../game-logic/betting';
import { ACTIONS } from '../../utils/constants';
import { useGame, ACTIONS_TYPES } from '../../context/GameContext';

export default function ActionButtons({ player }) {
  const { state, dispatch } = useGame();
  const [raiseAmount, setRaiseAmount] = useState(state.bigBlind);
  const validActions = getValidActions(player, state);

  if (validActions.length === 0) {
    return null;
  }

  const callAmount = state.roundBetting.currentBet - player.bet;
  const minRaise = state.roundBetting.minRaise || state.bigBlind;
  const maxRaise = player.chips - callAmount;

  const handleAction = (action, amount = 0) => {
    dispatch({
      type: ACTIONS_TYPES.PLAYER_ACTION,
      payload: { playerId: player.id, actionType: action, amount }
    });

    // Advance to next player
    setTimeout(() => {
      dispatch({ type: ACTIONS_TYPES.ADVANCE_TO_NEXT_PLAYER });
    }, 300);
  };

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border-2 border-gray-700">
      <div className="text-white text-center mb-3 font-bold">Your Turn</div>

      <div className="flex flex-wrap gap-2 justify-center">
        {validActions.includes(ACTIONS.FOLD) && (
          <button
            onClick={() => handleAction(ACTIONS.FOLD)}
            className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Fold
          </button>
        )}

        {validActions.includes(ACTIONS.CHECK) && (
          <button
            onClick={() => handleAction(ACTIONS.CHECK)}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Check
          </button>
        )}

        {validActions.includes(ACTIONS.CALL) && (
          <button
            onClick={() => handleAction(ACTIONS.CALL)}
            className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Call {callAmount}
          </button>
        )}

        {validActions.includes(ACTIONS.BET) && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleAction(ACTIONS.BET, raiseAmount)}
              className="bg-yellow-600 hover:bg-yellow-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Bet {raiseAmount}
            </button>
            <input
              type="range"
              min={minRaise}
              max={player.chips}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-white text-xs text-center">
              {minRaise} - {player.chips}
            </div>
          </div>
        )}

        {validActions.includes(ACTIONS.RAISE) && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => handleAction(ACTIONS.RAISE, raiseAmount)}
              className="bg-orange-600 hover:bg-orange-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
            >
              Raise {raiseAmount}
            </button>
            <input
              type="range"
              min={minRaise}
              max={maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-white text-xs text-center">
              {minRaise} - {maxRaise}
            </div>
          </div>
        )}

        {validActions.includes(ACTIONS.ALL_IN) && player.chips > 0 && (
          <button
            onClick={() => handleAction(ACTIONS.ALL_IN)}
            className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-6 rounded-lg transition-colors"
          >
            All-In ({player.chips})
          </button>
        )}
      </div>
    </div>
  );
}
