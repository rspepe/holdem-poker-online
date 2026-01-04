import {
  INITIAL_CHIPS,
  SMALL_BLIND,
  BIG_BLIND,
  NUM_PLAYERS,
  GAME_PHASES,
  PLAYER_STATUS
} from '../utils/constants';
import { createShuffledDeck, dealCards } from './deck';

/**
 * Creates initial player objects
 * @returns {Array} Array of player objects
 */
export function createPlayers() {
  return [
    {
      id: 0,
      name: 'You',
      chips: INITIAL_CHIPS,
      holeCards: [],
      bet: 0,
      status: PLAYER_STATUS.ACTIVE,
      isHuman: true,
      position: 0
    },
    {
      id: 1,
      name: 'CPU 1',
      chips: INITIAL_CHIPS,
      holeCards: [],
      bet: 0,
      status: PLAYER_STATUS.ACTIVE,
      isHuman: false,
      position: 1
    },
    {
      id: 2,
      name: 'CPU 2',
      chips: INITIAL_CHIPS,
      holeCards: [],
      bet: 0,
      status: PLAYER_STATUS.ACTIVE,
      isHuman: false,
      position: 2
    },
    {
      id: 3,
      name: 'CPU 3',
      chips: INITIAL_CHIPS,
      holeCards: [],
      bet: 0,
      status: PLAYER_STATUS.ACTIVE,
      isHuman: false,
      position: 3
    }
  ];
}

/**
 * Initializes a new game
 * @returns {Object} Initial game state
 */
export function initializeGame() {
  return {
    players: createPlayers(),
    communityCards: [],
    pot: 0,
    sidePots: [],
    deck: [],
    dealerButton: 0,
    currentPlayer: 0,
    phase: GAME_PHASES.PREFLOP,
    roundBetting: {
      currentBet: 0,
      minRaise: BIG_BLIND,
      lastRaiser: null,
      playersActed: []
    },
    smallBlind: SMALL_BLIND,
    bigBlind: BIG_BLIND,
    handNumber: 0,
    message: 'Welcome to Texas Hold\'em Poker!'
  };
}

/**
 * Starts a new hand
 * @param {Object} state - Current game state
 * @returns {Object} Updated game state
 */
export function startNewHand(state) {
  // Filter out players who are out of chips
  const activePlayers = state.players.filter(p => p.chips > 0);

  if (activePlayers.length < 2) {
    return {
      ...state,
      message: 'Game Over! Not enough players with chips.'
    };
  }

  // Rotate dealer button
  let newDealerButton = state.dealerButton;
  do {
    newDealerButton = (newDealerButton + 1) % NUM_PLAYERS;
  } while (state.players[newDealerButton].chips <= 0);

  // Reset players
  const players = state.players.map(player => ({
    ...player,
    holeCards: [],
    bet: 0,
    status: player.chips > 0 ? PLAYER_STATUS.ACTIVE : PLAYER_STATUS.OUT,
    hand: null
  }));

  // Create and shuffle deck
  const deck = createShuffledDeck();

  // Deal hole cards
  const playersWithCards = [];
  let remainingDeck = deck;

  players.forEach((player, index) => {
    if (player.status === PLAYER_STATUS.ACTIVE) {
      const { cards, remainingDeck: newDeck } = dealCards(remainingDeck, 2);
      playersWithCards.push({
        ...player,
        holeCards: cards
      });
      remainingDeck = newDeck;
    } else {
      playersWithCards.push(player);
    }
  });

  // Post blinds
  const smallBlindPos = (newDealerButton + 1) % NUM_PLAYERS;
  const bigBlindPos = (newDealerButton + 2) % NUM_PLAYERS;

  playersWithCards[smallBlindPos].bet = Math.min(state.smallBlind, playersWithCards[smallBlindPos].chips);
  playersWithCards[smallBlindPos].chips -= playersWithCards[smallBlindPos].bet;
  if (playersWithCards[smallBlindPos].chips === 0) {
    playersWithCards[smallBlindPos].status = PLAYER_STATUS.ALL_IN;
  }

  playersWithCards[bigBlindPos].bet = Math.min(state.bigBlind, playersWithCards[bigBlindPos].chips);
  playersWithCards[bigBlindPos].chips -= playersWithCards[bigBlindPos].bet;
  if (playersWithCards[bigBlindPos].chips === 0) {
    playersWithCards[bigBlindPos].status = PLAYER_STATUS.ALL_IN;
  }

  // Current player is UTG (under the gun) - after big blind
  const currentPlayer = (bigBlindPos + 1) % NUM_PLAYERS;

  return {
    ...state,
    players: playersWithCards,
    communityCards: [],
    pot: 0,
    sidePots: [],
    deck: remainingDeck,
    dealerButton: newDealerButton,
    currentPlayer,
    phase: GAME_PHASES.PREFLOP,
    roundBetting: {
      currentBet: state.bigBlind,
      minRaise: state.bigBlind,
      lastRaiser: bigBlindPos,
      playersActed: []
    },
    handNumber: state.handNumber + 1,
    message: `Hand #${state.handNumber + 1} - Blinds posted`
  };
}

/**
 * Gets the next active player
 * @param {Object} state - Current game state
 * @param {number} fromPosition - Starting position
 * @returns {number} Next active player position
 */
export function getNextActivePlayer(state, fromPosition) {
  let nextPlayer = (fromPosition + 1) % NUM_PLAYERS;
  let checked = 0;

  while (checked < NUM_PLAYERS) {
    const player = state.players[nextPlayer];
    if (player.status === PLAYER_STATUS.ACTIVE) {
      return nextPlayer;
    }
    nextPlayer = (nextPlayer + 1) % NUM_PLAYERS;
    checked++;
  }

  return -1; // No active players
}

/**
 * Checks if betting round is complete
 * @param {Object} state - Current game state
 * @returns {boolean}
 */
export function isBettingRoundComplete(state) {
  const activePlayers = state.players.filter(
    p => p.status === PLAYER_STATUS.ACTIVE
  );

  if (activePlayers.length === 0) return true;
  if (activePlayers.length === 1) return true;

  // All active players must have acted and matched the current bet
  const allActed = activePlayers.every(p =>
    state.roundBetting.playersActed.includes(p.id)
  );

  const allMatched = activePlayers.every(p =>
    p.bet === state.roundBetting.currentBet
  );

  return allActed && allMatched;
}

/**
 * Counts active players (not folded, not out)
 * @param {Object} state - Current game state
 * @returns {number}
 */
export function countActivePlayers(state) {
  return state.players.filter(
    p => p.status === PLAYER_STATUS.ACTIVE || p.status === PLAYER_STATUS.ALL_IN
  ).length;
}
