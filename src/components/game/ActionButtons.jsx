import { useState } from 'react';
import { getValidActions } from '../../game-logic/betting';
import { ACTIONS } from '../../utils/constants';
import { useGame, ACTIONS_TYPES } from '../../context/GameContext';

export default function ActionButtons({ player, isActive }) {
  const { state, dispatch } = useGame();
  const [raiseAmount, setRaiseAmount] = useState(state.bigBlind);
  const validActions = getValidActions(player, state);

  const callAmount = state.roundBetting.currentBet - player.bet;
  const minRaise = state.roundBetting.minRaise || state.bigBlind;
  const maxRaise = player.chips - callAmount;

  const handleAction = (action, amount = 0) => {
    if (!isActive) return;

    dispatch({
      type: ACTIONS_TYPES.PLAYER_ACTION,
      payload: { playerId: player.id, actionType: action, amount }
    });

    // Advance to next player
    setTimeout(() => {
      dispatch({ type: ACTIONS_TYPES.ADVANCE_TO_NEXT_PLAYER });
    }, 300);
  };

  const baseButtonClass = "font-bold py-2 px-6 rounded-lg transition-colors";
  const activeClass = "text-white cursor-pointer";
  const disabledClass = "text-gray-500 cursor-not-allowed opacity-50";

  return (
    <div className="bg-gray-800 rounded-lg p-4 shadow-xl border-2 border-gray-700 min-h-[120px]">
      <div className={`text-center mb-3 font-bold ${isActive ? 'text-white' : 'text-gray-500'}`}>
        {isActive ? 'Your Turn' : 'Waiting...'}
      </div>

      <div className="flex flex-wrap gap-2 justify-center">
        <button
          onClick={() => handleAction(ACTIONS.FOLD)}
          disabled={!isActive || !validActions.includes(ACTIONS.FOLD)}
          className={`${baseButtonClass} bg-red-600 ${
            isActive && validActions.includes(ACTIONS.FOLD)
              ? `${activeClass} hover:bg-red-700`
              : disabledClass
          }`}
        >
          Fold
        </button>

        <button
          onClick={() => handleAction(ACTIONS.CHECK)}
          disabled={!isActive || !validActions.includes(ACTIONS.CHECK)}
          className={`${baseButtonClass} bg-blue-600 ${
            isActive && validActions.includes(ACTIONS.CHECK)
              ? `${activeClass} hover:bg-blue-700`
              : disabledClass
          }`}
        >
          Check
        </button>

        <button
          onClick={() => handleAction(ACTIONS.CALL)}
          disabled={!isActive || !validActions.includes(ACTIONS.CALL)}
          className={`${baseButtonClass} bg-green-600 ${
            isActive && validActions.includes(ACTIONS.CALL)
              ? `${activeClass} hover:bg-green-700`
              : disabledClass
          }`}
        >
          Call {callAmount > 0 ? callAmount : ''}
        </button>

        {(validActions.includes(ACTIONS.BET) || validActions.includes(ACTIONS.RAISE)) && (
          <div className="flex flex-col gap-2">
            <button
              onClick={() => {
                if (validActions.includes(ACTIONS.BET)) {
                  handleAction(ACTIONS.BET, raiseAmount);
                } else if (validActions.includes(ACTIONS.RAISE)) {
                  handleAction(ACTIONS.RAISE, raiseAmount);
                }
              }}
              disabled={!isActive}
              className={`${baseButtonClass} ${
                validActions.includes(ACTIONS.BET) ? 'bg-yellow-600' : 'bg-orange-600'
              } ${
                isActive
                  ? `${activeClass} ${validActions.includes(ACTIONS.BET) ? 'hover:bg-yellow-700' : 'hover:bg-orange-700'}`
                  : disabledClass
              }`}
            >
              {validActions.includes(ACTIONS.BET) ? 'Bet' : 'Raise'} {raiseAmount}
            </button>
            <input
              type="range"
              min={minRaise}
              max={validActions.includes(ACTIONS.BET) ? player.chips : maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              disabled={!isActive}
              className="w-full"
            />
            <div className={`text-xs text-center ${isActive ? 'text-white' : 'text-gray-500'}`}>
              {minRaise} - {validActions.includes(ACTIONS.BET) ? player.chips : maxRaise}
            </div>
          </div>
        )}

        <button
          onClick={() => handleAction(ACTIONS.ALL_IN)}
          disabled={!isActive || !validActions.includes(ACTIONS.ALL_IN) || player.chips === 0}
          className={`${baseButtonClass} bg-purple-600 ${
            isActive && validActions.includes(ACTIONS.ALL_IN) && player.chips > 0
              ? `${activeClass} hover:bg-purple-700`
              : disabledClass
          }`}
        >
          All-In {player.chips > 0 ? `(${player.chips})` : ''}
        </button>
      </div>
    </div>
  );
}
