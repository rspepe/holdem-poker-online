import { useEffect, useRef } from 'react';
import { useGame, ACTIONS_TYPES } from '../../context/GameContext';
import Player from './Player';
import CommunityCards from './CommunityCards';
import Pot from './Pot';
import ActionButtons from './ActionButtons';
import MessageLog from './MessageLog';
import { GAME_PHASES, PLAYER_STATUS } from '../../utils/constants';
import { decideCPUAction } from '../../ai/cpuStrategy';

export default function Table() {
  const { state, dispatch } = useGame();

  // Handle CPU turns
  useEffect(() => {
    if (!state || state.handNumber === 0) return;
    if (state.phase === GAME_PHASES.SHOWDOWN) return;
    if (state.showWinnerModal) return;

    const currentPlayerObj = state.players[state.currentPlayer];

    // Check if it's a CPU's turn
    if (currentPlayerObj && !currentPlayerObj.isHuman &&
        currentPlayerObj.status === PLAYER_STATUS.ACTIVE) {

      // Add delay to simulate thinking
      const thinkingTime = 800 + Math.random() * 700; // 800-1500ms

      const timer = setTimeout(() => {
        const decision = decideCPUAction(currentPlayerObj, state);

        // Execute CPU action
        dispatch({
          type: ACTIONS_TYPES.PLAYER_ACTION,
          payload: {
            playerId: currentPlayerObj.id,
            actionType: decision.action,
            amount: decision.amount
          }
        });

        // Advance to next player
        setTimeout(() => {
          dispatch({ type: ACTIONS_TYPES.ADVANCE_TO_NEXT_PLAYER });
        }, 300);
      }, thinkingTime);

      return () => clearTimeout(timer);
    }
  }, [state?.currentPlayer, state?.phase, state?.handNumber, state?.showWinnerModal, dispatch, state]);

  if (!state) {
    return <div className="text-white">Loading...</div>;
  }

  const { players, communityCards, pot, currentPlayer, phase, message, winners, messages } = state;

  const humanPlayer = players[0];
  const currentBets = players.reduce((sum, p) => sum + p.bet, 0);
  const isGameOver = humanPlayer.chips === 0 && humanPlayer.status === PLAYER_STATUS.OUT;

  const isHumanTurn = currentPlayer === 0 && phase !== GAME_PHASES.SHOWDOWN;
  const isShowdown = phase === GAME_PHASES.SHOWDOWN && winners;

  const handleNextHand = () => {
    dispatch({ type: ACTIONS_TYPES.END_HAND });
    setTimeout(() => {
      dispatch({ type: ACTIONS_TYPES.START_NEW_HAND });
    }, 100);
  };

  return (
    <div className="flex gap-8 w-full max-w-[1600px] mx-auto">
      {/* Left Pane - Game Area */}
      <div className="flex flex-col gap-4 flex-shrink-0">
        {/* Poker Table */}
        <div className="bg-gradient-to-br from-poker-green to-poker-green-dark rounded-[200px] border-8 border-amber-900 shadow-2xl p-8 w-[900px] h-[600px] relative">
        {/* Table felt pattern */}
        <div className="absolute inset-0 rounded-[192px] opacity-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white to-transparent" />

        {/* Players positioned around table */}
        {/* Bottom - Human Player (South) */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
          <Player
            player={players[0]}
            isActive={currentPlayer === 0}
            isDealer={state.dealerButton === 0}
            showCards={true}
          />
        </div>

        {/* Left - CPU Player 1 (West) */}
        <div className="absolute left-8 top-1/2 transform -translate-y-1/2">
          <Player
            player={players[1]}
            isActive={currentPlayer === 1}
            isDealer={state.dealerButton === 1}
            showCards={phase === GAME_PHASES.SHOWDOWN}
          />
        </div>

        {/* Top - CPU Player 2 (North) */}
        <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
          <Player
            player={players[2]}
            isActive={currentPlayer === 2}
            isDealer={state.dealerButton === 2}
            showCards={phase === GAME_PHASES.SHOWDOWN}
          />
        </div>

        {/* Right - CPU Player 3 (East) */}
        <div className="absolute right-8 top-1/2 transform -translate-y-1/2">
          <Player
            player={players[3]}
            isActive={currentPlayer === 3}
            isDealer={state.dealerButton === 3}
            showCards={phase === GAME_PHASES.SHOWDOWN}
          />
        </div>

        {/* Center - Community Cards and Pot */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-4">
          <CommunityCards cards={communityCards} />
          <Pot amount={pot} currentBets={currentBets} />
        </div>

        {/* Game message */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-black bg-opacity-70 text-white px-6 py-2 rounded-full text-sm font-semibold">
          {message}
        </div>

        {/* Phase indicator */}
        <div className="absolute top-4 left-4 bg-blue-900 bg-opacity-70 text-white px-4 py-2 rounded-lg text-xs font-semibold">
          {phase.toUpperCase()}
        </div>

        {/* Hand number */}
        <div className="absolute top-4 right-4 bg-blue-900 bg-opacity-70 text-white px-4 py-2 rounded-lg text-xs font-semibold">
          Hand #{state.handNumber}
        </div>

        {/* Start button for first game */}
        {state.handNumber === 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-[192px]">
            <button
              onClick={() => dispatch({ type: ACTIONS_TYPES.START_GAME })}
              className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl py-4 px-8 rounded-lg shadow-xl transition-colors"
            >
              Start Game
            </button>
          </div>
        )}

        {/* Game Over - Restart button */}
        {isGameOver && state.handNumber > 0 && (
          <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-75 rounded-[192px]">
            <div className="text-center">
              <div className="text-white text-3xl font-bold mb-6">Game Over!</div>
              <div className="text-gray-300 text-xl mb-8">You ran out of chips</div>
              <button
                onClick={() => dispatch({ type: ACTIONS_TYPES.RESTART_GAME })}
                className="bg-green-600 hover:bg-green-700 text-white font-bold text-2xl py-4 px-8 rounded-lg shadow-xl transition-colors"
              >
                Restart Game
              </button>
            </div>
          </div>
        )}
        </div>

        {/* Action buttons - below table, always visible */}
        <ActionButtons player={humanPlayer} isActive={isHumanTurn} />

        {/* Next Hand button - shown after showdown */}
        {isShowdown && !isGameOver && (
          <div className="flex justify-center">
            <button
              onClick={handleNextHand}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold text-xl py-3 px-8 rounded-lg shadow-xl transition-colors"
            >
              Next Hand →
            </button>
          </div>
        )}
      </div>

      {/* Right Pane - Log Area */}
      <div className="flex-1 min-w-[400px] max-w-[600px]">
        <MessageLog messages={messages || []} />
      </div>
    </div>
  );
}
