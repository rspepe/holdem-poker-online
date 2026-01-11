import { createContext, useContext, useReducer, useEffect } from 'react';
import { initializeGame, startNewHand, getNextActivePlayer, isBettingRoundComplete, countActivePlayers } from '../game-logic/gameState';
import { processAction, collectBets } from '../game-logic/betting';
import { evaluateHand, findWinners } from '../game-logic/handEvaluator';
import { dealCards } from '../game-logic/deck';
import { GAME_PHASES, PLAYER_STATUS } from '../utils/constants';

const GameContext = createContext();

// Action types
const ACTIONS_TYPES = {
  START_GAME: 'START_GAME',
  START_NEW_HAND: 'START_NEW_HAND',
  PLAYER_ACTION: 'PLAYER_ACTION',
  ADVANCE_TO_NEXT_PLAYER: 'ADVANCE_TO_NEXT_PLAYER',
  DEAL_FLOP: 'DEAL_FLOP',
  DEAL_TURN: 'DEAL_TURN',
  DEAL_RIVER: 'DEAL_RIVER',
  SHOWDOWN: 'SHOWDOWN',
  END_HAND: 'END_HAND',
  SET_MESSAGE: 'SET_MESSAGE'
};

// Helper function to add message to log
function addMessage(state, message) {
  return {
    ...state,
    message,
    messages: [...(state.messages || []), { handNumber: state.handNumber, text: message }]
  };
}

function gameReducer(state, action) {
  switch (action.type) {
    case ACTIONS_TYPES.START_GAME: {
      const newState = initializeGame();
      return startNewHand(newState);
    }

    case ACTIONS_TYPES.START_NEW_HAND: {
      return startNewHand(state);
    }

    case ACTIONS_TYPES.PLAYER_ACTION: {
      const { playerId, actionType, amount } = action.payload;
      let newState = processAction(state, playerId, actionType, amount);

      // Check if only one player left (all others folded)
      const activePlayers = newState.players.filter(
        p => p.status === PLAYER_STATUS.ACTIVE || p.status === PLAYER_STATUS.ALL_IN
      );

      if (activePlayers.length === 1) {
        // Winner by default (everyone else folded)
        const winner = activePlayers[0];
        const winAmount = newState.pot + newState.players.reduce((sum, p) => sum + p.bet, 0);

        const players = newState.players.map(p => {
          if (p.id === winner.id) {
            return { ...p, chips: p.chips + winAmount, bet: 0 };
          } else {
            const newChips = p.chips;
            return {
              ...p,
              bet: 0,
              status: newChips === 0 ? PLAYER_STATUS.OUT : p.status
            };
          }
        });

        return addMessage({
          ...newState,
          players,
          pot: 0,
          phase: GAME_PHASES.SHOWDOWN,
          winners: [winner.id]
        }, `${winner.name} wins ${winAmount} chips!`);
      }

      return newState;
    }

    case ACTIONS_TYPES.ADVANCE_TO_NEXT_PLAYER: {
      const nextPlayer = getNextActivePlayer(state, state.currentPlayer);

      if (nextPlayer === -1 || isBettingRoundComplete(state)) {
        // Betting round complete, move to next phase
        const collectedState = collectBets(state);

        if (state.phase === GAME_PHASES.PREFLOP) {
          return { ...collectedState, phase: 'DEAL_FLOP' };
        } else if (state.phase === GAME_PHASES.FLOP) {
          return { ...collectedState, phase: 'DEAL_TURN' };
        } else if (state.phase === GAME_PHASES.TURN) {
          return { ...collectedState, phase: 'DEAL_RIVER' };
        } else if (state.phase === GAME_PHASES.RIVER) {
          return { ...collectedState, phase: 'SHOWDOWN' };
        }
      }

      return {
        ...state,
        currentPlayer: nextPlayer
      };
    }

    case ACTIONS_TYPES.DEAL_FLOP: {
      const { cards, remainingDeck } = dealCards(state.deck, 3);
      return addMessage({
        ...state,
        communityCards: cards,
        deck: remainingDeck,
        phase: GAME_PHASES.FLOP,
        currentPlayer: getNextActivePlayer(state, state.dealerButton)
      }, 'Flop dealt');
    }

    case ACTIONS_TYPES.DEAL_TURN: {
      const { cards, remainingDeck } = dealCards(state.deck, 1);
      return addMessage({
        ...state,
        communityCards: [...state.communityCards, ...cards],
        deck: remainingDeck,
        phase: GAME_PHASES.TURN,
        currentPlayer: getNextActivePlayer(state, state.dealerButton)
      }, 'Turn dealt');
    }

    case ACTIONS_TYPES.DEAL_RIVER: {
      const { cards, remainingDeck } = dealCards(state.deck, 1);
      return addMessage({
        ...state,
        communityCards: [...state.communityCards, ...cards],
        deck: remainingDeck,
        phase: GAME_PHASES.RIVER,
        currentPlayer: getNextActivePlayer(state, state.dealerButton)
      }, 'River dealt');
    }

    case ACTIONS_TYPES.SHOWDOWN: {
      // Evaluate all active player hands
      const playersWithHands = state.players.map(player => {
        if (player.status === PLAYER_STATUS.FOLDED || player.status === PLAYER_STATUS.OUT) {
          return { ...player, hand: null };
        }

        const allCards = [...player.holeCards, ...state.communityCards];
        const hand = evaluateHand(allCards);
        return { ...player, hand, folded: false };
      });

      // Find winners
      const winnerIds = findWinners(playersWithHands);
      const totalPot = state.pot + state.players.reduce((sum, p) => sum + p.bet, 0);
      const winAmount = Math.floor(totalPot / winnerIds.length);

      // Distribute winnings
      const players = playersWithHands.map(player => {
        const isWinner = winnerIds.includes(player.id);
        const newChips = isWinner ? player.chips + winAmount : player.chips;
        return {
          ...player,
          chips: newChips,
          bet: 0,
          status: newChips === 0 ? PLAYER_STATUS.OUT : player.status
        };
      });

      const winnerNames = winnerIds.map(id => players[id].name).join(', ');
      const winnerHand = players.find(p => winnerIds.includes(p.id)).hand;

      return addMessage({
        ...state,
        players,
        pot: 0,
        phase: GAME_PHASES.SHOWDOWN,
        winners: winnerIds
      }, `${winnerNames} wins with ${winnerHand.description}!`);
    }

    case ACTIONS_TYPES.END_HAND: {
      return {
        ...state,
        winners: null
      };
    }

    case ACTIONS_TYPES.SET_MESSAGE: {
      return {
        ...state,
        message: action.payload
      };
    }

    default:
      return state;
  }
}

export function GameProvider({ children }) {
  const [state, dispatch] = useReducer(gameReducer, null, initializeGame);

  // Auto-advance when betting round is complete
  useEffect(() => {
    if (!state) return;

    if (state.phase === 'DEAL_FLOP') {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS_TYPES.DEAL_FLOP });
      }, 500);
      return () => clearTimeout(timer);
    }

    if (state.phase === 'DEAL_TURN') {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS_TYPES.DEAL_TURN });
      }, 500);
      return () => clearTimeout(timer);
    }

    if (state.phase === 'DEAL_RIVER') {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS_TYPES.DEAL_RIVER });
      }, 500);
      return () => clearTimeout(timer);
    }

    if (state.phase === 'SHOWDOWN' && !state.showWinnerModal) {
      const timer = setTimeout(() => {
        dispatch({ type: ACTIONS_TYPES.SHOWDOWN });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state?.phase, state?.showWinnerModal]);

  const value = {
    state,
    dispatch,
    actions: ACTIONS_TYPES
  };

  return <GameContext.Provider value={value}>{children}</GameContext.Provider>;
}

export function useGame() {
  const context = useContext(GameContext);
  if (!context) {
    throw new Error('useGame must be used within GameProvider');
  }
  return context;
}

export { ACTIONS_TYPES };
