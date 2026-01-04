// Card suits
export const SUITS = {
  HEARTS: 'hearts',
  DIAMONDS: 'diamonds',
  CLUBS: 'clubs',
  SPADES: 'spades'
};

// Suit symbols (Unicode)
export const SUIT_SYMBOLS = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠'
};

// Suit colors
export const SUIT_COLORS = {
  hearts: 'red',
  diamonds: 'red',
  clubs: 'black',
  spades: 'black'
};

// Card ranks
export const RANKS = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];

// Rank values for comparison (2 is lowest, Ace is highest)
export const RANK_VALUES = {
  '2': 2,
  '3': 3,
  '4': 4,
  '5': 5,
  '6': 6,
  '7': 7,
  '8': 8,
  '9': 9,
  'T': 10,
  'J': 11,
  'Q': 12,
  'K': 13,
  'A': 14
};

// Display names for ranks
export const RANK_NAMES = {
  '2': '2',
  '3': '3',
  '4': '4',
  '5': '5',
  '6': '6',
  '7': '7',
  '8': '8',
  '9': '9',
  'T': '10',
  'J': 'J',
  'Q': 'Q',
  'K': 'K',
  'A': 'A'
};

// Hand rankings (higher is better)
export const HAND_RANKINGS = {
  HIGH_CARD: 1,
  ONE_PAIR: 2,
  TWO_PAIR: 3,
  THREE_OF_A_KIND: 4,
  STRAIGHT: 5,
  FLUSH: 6,
  FULL_HOUSE: 7,
  FOUR_OF_A_KIND: 8,
  STRAIGHT_FLUSH: 9,
  ROYAL_FLUSH: 10
};

// Hand ranking names
export const HAND_NAMES = {
  [HAND_RANKINGS.HIGH_CARD]: 'High Card',
  [HAND_RANKINGS.ONE_PAIR]: 'Pair',
  [HAND_RANKINGS.TWO_PAIR]: 'Two Pair',
  [HAND_RANKINGS.THREE_OF_A_KIND]: 'Three of a Kind',
  [HAND_RANKINGS.STRAIGHT]: 'Straight',
  [HAND_RANKINGS.FLUSH]: 'Flush',
  [HAND_RANKINGS.FULL_HOUSE]: 'Full House',
  [HAND_RANKINGS.FOUR_OF_A_KIND]: 'Four of a Kind',
  [HAND_RANKINGS.STRAIGHT_FLUSH]: 'Straight Flush',
  [HAND_RANKINGS.ROYAL_FLUSH]: 'Royal Flush'
};

// Game phases
export const GAME_PHASES = {
  PREFLOP: 'preflop',
  FLOP: 'flop',
  TURN: 'turn',
  RIVER: 'river',
  SHOWDOWN: 'showdown'
};

// Player status
export const PLAYER_STATUS = {
  ACTIVE: 'active',
  FOLDED: 'folded',
  ALL_IN: 'all-in',
  OUT: 'out'
};

// Player actions
export const ACTIONS = {
  FOLD: 'fold',
  CHECK: 'check',
  CALL: 'call',
  BET: 'bet',
  RAISE: 'raise',
  ALL_IN: 'all-in'
};

// Game constants
export const INITIAL_CHIPS = 1000;
export const SMALL_BLIND = 10;
export const BIG_BLIND = 20;
export const MIN_BET = BIG_BLIND;
export const NUM_PLAYERS = 4;

// Player positions
export const POSITIONS = {
  SOUTH: 0,  // Human player (bottom)
  WEST: 1,   // CPU player (left)
  NORTH: 2,  // CPU player (top)
  EAST: 3    // CPU player (right)
};

// AI aggression levels
export const AI_AGGRESSION = {
  PASSIVE: 0.3,
  NORMAL: 0.5,
  AGGRESSIVE: 0.7
};

// Pre-flop hand strength tiers
export const HAND_TIERS = {
  PREMIUM: ['AA', 'KK', 'QQ', 'AKs'],
  STRONG: ['JJ', 'TT', 'AQs', 'AKo', 'AJs', 'KQs'],
  MEDIUM: ['99', '88', '77', '66', '55', '44', '33', '22', 'AQ', 'AJ', 'AT', 'KQ', 'KJ', 'QJ', 'JT'],
  WEAK: [] // Everything else
};
