import { evaluatePreFlopStrength, evaluatePostFlopStrength } from './handStrength';
import { getValidActions } from '../game-logic/betting';
import { ACTIONS, GAME_PHASES } from '../utils/constants';

/**
 * Determines position type (early, middle, late)
 * @param {Object} player - Player object
 * @param {Object} state - Game state
 * @returns {string} 'early' | 'middle' | 'late'
 */
function getPosition(player, state) {
  const dealerButton = state.dealerButton;
  const playerPos = player.position;
  const numPlayers = 4;

  // Calculate positions relative to dealer button
  const relativePos = (playerPos - dealerButton + numPlayers) % numPlayers;

  // In 4-player game:
  // 0 = dealer (late)
  // 1 = small blind (early)
  // 2 = big blind (middle)
  // 3 = button+1 (late)

  if (relativePos === 1) return 'early';
  if (relativePos === 2) return 'middle';
  return 'late';
}

/**
 * Calculates pot odds
 * @param {Object} state - Game state
 * @param {Object} player - Player object
 * @returns {number} Pot odds ratio
 */
function getPotOdds(state, player) {
  const callAmount = state.roundBetting.currentBet - player.bet;
  if (callAmount <= 0) return 0;

  const potSize = state.pot + state.players.reduce((sum, p) => sum + p.bet, 0);
  return callAmount / (potSize + callAmount);
}

/**
 * Decides CPU action based on strategy
 * @param {Object} player - Player object
 * @param {Object} state - Game state
 * @returns {Object} { action, amount }
 */
export function decideCPUAction(player, state) {
  const validActions = getValidActions(player, state);

  if (validActions.length === 0) {
    return { action: ACTIONS.FOLD, amount: 0 };
  }

  // Evaluate hand strength
  const handStrength = state.phase === GAME_PHASES.PREFLOP
    ? evaluatePreFlopStrength(player.holeCards)
    : evaluatePostFlopStrength(player.holeCards, state.communityCards);

  const position = getPosition(player, state);
  const potOdds = getPotOdds(state, player);
  const callAmount = state.roundBetting.currentBet - player.bet;

  // Add some randomness to make CPU less predictable
  const randomFactor = Math.random() * 20 - 10; // -10 to +10
  const adjustedStrength = Math.max(0, Math.min(100, handStrength + randomFactor));

  // Calculate aggression based on hand strength and position
  let aggression = adjustedStrength;

  // Position modifier
  if (position === 'late') {
    aggression += 10;
  } else if (position === 'early') {
    aggression -= 10;
  }

  // Pot odds consideration
  if (potOdds > 0 && adjustedStrength > 30) {
    const oddsBonus = (1 - potOdds) * 20;
    aggression += oddsBonus;
  }

  // Occasional bluff (10% chance when in late position)
  if (position === 'late' && Math.random() < 0.1) {
    aggression += 30;
  }

  // Occasional trap (5% chance with very strong hand)
  if (adjustedStrength > 80 && Math.random() < 0.05) {
    aggression -= 40; // Play passive with strong hand
  }

  // Determine action based on aggression
  const canCheck = validActions.includes(ACTIONS.CHECK);
  const canCall = validActions.includes(ACTIONS.CALL);
  const canBet = validActions.includes(ACTIONS.BET);
  const canRaise = validActions.includes(ACTIONS.RAISE);
  const canAllIn = validActions.includes(ACTIONS.ALL_IN);

  // Very weak hand - fold or check
  if (aggression < 20) {
    if (canCheck) {
      return { action: ACTIONS.CHECK, amount: 0 };
    }
    return { action: ACTIONS.FOLD, amount: 0 };
  }

  // Weak hand - check or call small bets
  if (aggression < 40) {
    if (canCheck) {
      return { action: ACTIONS.CHECK, amount: 0 };
    }
    if (canCall && callAmount < player.chips * 0.1) {
      return { action: ACTIONS.CALL, amount: 0 };
    }
    return { action: ACTIONS.FOLD, amount: 0 };
  }

  // Medium hand - call or small bet
  if (aggression < 60) {
    if (canCall) {
      return { action: ACTIONS.CALL, amount: 0 };
    }
    if (canBet) {
      const betAmount = Math.min(state.bigBlind * 2, player.chips);
      return { action: ACTIONS.BET, amount: betAmount };
    }
    if (canCheck) {
      return { action: ACTIONS.CHECK, amount: 0 };
    }
    return { action: ACTIONS.FOLD, amount: 0 };
  }

  // Strong hand - raise or bet
  if (aggression < 80) {
    if (canRaise) {
      const raiseAmount = Math.min(
        state.roundBetting.minRaise * 2,
        player.chips - callAmount
      );
      return { action: ACTIONS.RAISE, amount: raiseAmount };
    }
    if (canBet) {
      const betAmount = Math.min(state.bigBlind * 3, player.chips);
      return { action: ACTIONS.BET, amount: betAmount };
    }
    if (canCall) {
      return { action: ACTIONS.CALL, amount: 0 };
    }
    if (canCheck) {
      return { action: ACTIONS.CHECK, amount: 0 };
    }
  }

  // Very strong hand - big raise or all-in
  if (aggression >= 80) {
    // Sometimes go all-in with monster hands
    if (canAllIn && adjustedStrength > 90 && Math.random() < 0.3) {
      return { action: ACTIONS.ALL_IN, amount: 0 };
    }

    if (canRaise) {
      const raiseAmount = Math.min(
        state.roundBetting.minRaise * 3,
        player.chips - callAmount
      );
      return { action: ACTIONS.RAISE, amount: raiseAmount };
    }
    if (canBet) {
      const betAmount = Math.min(state.bigBlind * 4, player.chips);
      return { action: ACTIONS.BET, amount: betAmount };
    }
    if (canCall) {
      return { action: ACTIONS.CALL, amount: 0 };
    }
  }

  // Fallback - check or fold
  if (canCheck) {
    return { action: ACTIONS.CHECK, amount: 0 };
  }
  return { action: ACTIONS.FOLD, amount: 0 };
}
