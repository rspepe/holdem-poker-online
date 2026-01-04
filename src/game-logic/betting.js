import { ACTIONS, PLAYER_STATUS } from '../utils/constants';

/**
 * Gets valid actions for a player
 * @param {Object} player - Player object
 * @param {Object} state - Game state
 * @returns {Array} Array of valid action strings
 */
export function getValidActions(player, state) {
  if (player.status !== PLAYER_STATUS.ACTIVE) {
    return [];
  }

  const actions = [ACTIONS.FOLD];
  const callAmount = state.roundBetting.currentBet - player.bet;

  // Can always check if no bet to call
  if (callAmount === 0) {
    actions.push(ACTIONS.CHECK);
  }

  // Can call if there's a bet and player has chips
  if (callAmount > 0 && player.chips >= callAmount) {
    actions.push(ACTIONS.CALL);
  }

  // Can bet if no current bet
  if (state.roundBetting.currentBet === 0 && player.chips > 0) {
    actions.push(ACTIONS.BET);
  }

  // Can raise if there's a current bet and player has enough chips
  if (state.roundBetting.currentBet > 0 && player.chips > callAmount) {
    actions.push(ACTIONS.RAISE);
  }

  // Can always go all-in if has chips
  if (player.chips > 0) {
    actions.push(ACTIONS.ALL_IN);
  }

  return actions;
}

/**
 * Processes a fold action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @returns {Object} Updated state
 */
export function processFold(state, playerId) {
  const players = state.players.map(p =>
    p.id === playerId
      ? { ...p, status: PLAYER_STATUS.FOLDED }
      : p
  );

  return {
    ...state,
    players,
    roundBetting: {
      ...state.roundBetting,
      playersActed: [...state.roundBetting.playersActed, playerId]
    },
    message: `${state.players[playerId].name} folds`
  };
}

/**
 * Processes a check action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @returns {Object} Updated state
 */
export function processCheck(state, playerId) {
  return {
    ...state,
    roundBetting: {
      ...state.roundBetting,
      playersActed: [...state.roundBetting.playersActed, playerId]
    },
    message: `${state.players[playerId].name} checks`
  };
}

/**
 * Processes a call action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @returns {Object} Updated state
 */
export function processCall(state, playerId) {
  const player = state.players[playerId];
  const callAmount = state.roundBetting.currentBet - player.bet;
  const actualCall = Math.min(callAmount, player.chips);

  const players = state.players.map(p => {
    if (p.id === playerId) {
      const newChips = p.chips - actualCall;
      return {
        ...p,
        chips: newChips,
        bet: p.bet + actualCall,
        status: newChips === 0 ? PLAYER_STATUS.ALL_IN : p.status
      };
    }
    return p;
  });

  return {
    ...state,
    players,
    roundBetting: {
      ...state.roundBetting,
      playersActed: [...state.roundBetting.playersActed, playerId]
    },
    message: `${player.name} calls ${actualCall}`
  };
}

/**
 * Processes a bet action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @param {number} amount - Bet amount
 * @returns {Object} Updated state
 */
export function processBet(state, playerId, amount) {
  const player = state.players[playerId];
  const actualBet = Math.min(amount, player.chips);

  const players = state.players.map(p => {
    if (p.id === playerId) {
      const newChips = p.chips - actualBet;
      return {
        ...p,
        chips: newChips,
        bet: p.bet + actualBet,
        status: newChips === 0 ? PLAYER_STATUS.ALL_IN : p.status
      };
    }
    return p;
  });

  return {
    ...state,
    players,
    roundBetting: {
      currentBet: player.bet + actualBet,
      minRaise: actualBet,
      lastRaiser: playerId,
      playersActed: [playerId]
    },
    message: `${player.name} bets ${actualBet}`
  };
}

/**
 * Processes a raise action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @param {number} raiseAmount - Amount to raise by (total bet will be currentBet + raiseAmount)
 * @returns {Object} Updated state
 */
export function processRaise(state, playerId, raiseAmount) {
  const player = state.players[playerId];
  const callAmount = state.roundBetting.currentBet - player.bet;
  const totalBetIncrease = callAmount + raiseAmount;
  const actualBetIncrease = Math.min(totalBetIncrease, player.chips);

  const players = state.players.map(p => {
    if (p.id === playerId) {
      const newChips = p.chips - actualBetIncrease;
      return {
        ...p,
        chips: newChips,
        bet: p.bet + actualBetIncrease,
        status: newChips === 0 ? PLAYER_STATUS.ALL_IN : p.status
      };
    }
    return p;
  });

  const newCurrentBet = player.bet + actualBetIncrease;

  return {
    ...state,
    players,
    roundBetting: {
      currentBet: newCurrentBet,
      minRaise: raiseAmount,
      lastRaiser: playerId,
      playersActed: [playerId]
    },
    message: `${player.name} raises to ${newCurrentBet}`
  };
}

/**
 * Processes an all-in action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @returns {Object} Updated state
 */
export function processAllIn(state, playerId) {
  const player = state.players[playerId];
  const allInAmount = player.chips;

  const players = state.players.map(p => {
    if (p.id === playerId) {
      return {
        ...p,
        chips: 0,
        bet: p.bet + allInAmount,
        status: PLAYER_STATUS.ALL_IN
      };
    }
    return p;
  });

  const newBet = player.bet + allInAmount;
  const isRaise = newBet > state.roundBetting.currentBet;

  return {
    ...state,
    players,
    roundBetting: isRaise ? {
      currentBet: newBet,
      minRaise: state.roundBetting.minRaise,
      lastRaiser: playerId,
      playersActed: [playerId]
    } : {
      ...state.roundBetting,
      playersActed: [...state.roundBetting.playersActed, playerId]
    },
    message: `${player.name} goes all-in with ${allInAmount}`
  };
}

/**
 * Collects all bets into the pot
 * @param {Object} state - Game state
 * @returns {Object} Updated state
 */
export function collectBets(state) {
  let totalBets = 0;
  const players = state.players.map(p => {
    totalBets += p.bet;
    return { ...p, bet: 0 };
  });

  return {
    ...state,
    players,
    pot: state.pot + totalBets,
    roundBetting: {
      currentBet: 0,
      minRaise: state.bigBlind,
      lastRaiser: null,
      playersActed: []
    }
  };
}

/**
 * Processes a player action
 * @param {Object} state - Game state
 * @param {number} playerId - Player ID
 * @param {string} action - Action type
 * @param {number} amount - Amount (for bet/raise)
 * @returns {Object} Updated state
 */
export function processAction(state, playerId, action, amount = 0) {
  switch (action) {
    case ACTIONS.FOLD:
      return processFold(state, playerId);
    case ACTIONS.CHECK:
      return processCheck(state, playerId);
    case ACTIONS.CALL:
      return processCall(state, playerId);
    case ACTIONS.BET:
      return processBet(state, playerId, amount);
    case ACTIONS.RAISE:
      return processRaise(state, playerId, amount);
    case ACTIONS.ALL_IN:
      return processAllIn(state, playerId);
    default:
      return state;
  }
}
