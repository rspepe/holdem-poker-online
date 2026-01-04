import { HAND_RANKINGS, HAND_NAMES, RANK_VALUES, RANK_NAMES } from '../utils/constants';

/**
 * Gets rank counts from cards
 * @param {Array} cards - Array of card objects
 * @returns {Object} Object with ranks as keys and counts as values
 */
function getRankCounts(cards) {
  const counts = {};
  cards.forEach(card => {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  });
  return counts;
}

/**
 * Gets suit counts from cards
 * @param {Array} cards - Array of card objects
 * @returns {Object} Object with suits as keys and counts as values
 */
function getSuitCounts(cards) {
  const counts = {};
  cards.forEach(card => {
    counts[card.suit] = (counts[card.suit] || 0) + 1;
  });
  return counts;
}

/**
 * Checks if cards form a flush
 * @param {Array} cards - Array of 5 card objects
 * @returns {boolean}
 */
function isFlush(cards) {
  const suit = cards[0].suit;
  return cards.every(card => card.suit === suit);
}

/**
 * Checks if cards form a straight
 * @param {Array} cards - Array of 5 card objects (must be sorted by value descending)
 * @returns {boolean|number} Returns high card value if straight, false otherwise
 */
function isStraight(cards) {
  // Sort cards by value descending
  const sorted = [...cards].sort((a, b) => b.value - a.value);

  // Check for regular straight
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].value - sorted[i + 1].value !== 1) {
      // Check for wheel (A-2-3-4-5)
      if (i === 0 && sorted[0].value === 14 && sorted[1].value === 5 &&
          sorted[2].value === 4 && sorted[3].value === 3 && sorted[4].value === 2) {
        return 5; // In a wheel, the high card is 5
      }
      return false;
    }
  }

  return sorted[0].value; // Return high card value
}

/**
 * Evaluates a 5-card hand
 * @param {Array} cards - Array of exactly 5 card objects
 * @returns {Object} { ranking, score, name, description }
 */
function evaluateFiveCards(cards) {
  if (cards.length !== 5) {
    throw new Error('Hand must contain exactly 5 cards');
  }

  const rankCounts = getRankCounts(cards);
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const ranks = Object.keys(rankCounts).sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);

  const flush = isFlush(cards);
  const straight = isStraight(cards);

  // Royal Flush
  if (flush && straight === 14) {
    return {
      ranking: HAND_RANKINGS.ROYAL_FLUSH,
      score: 10000000,
      name: HAND_NAMES[HAND_RANKINGS.ROYAL_FLUSH],
      description: 'Royal Flush',
      cards: cards
    };
  }

  // Straight Flush
  if (flush && straight) {
    return {
      ranking: HAND_RANKINGS.STRAIGHT_FLUSH,
      score: 9000000 + straight,
      name: HAND_NAMES[HAND_RANKINGS.STRAIGHT_FLUSH],
      description: `Straight Flush, ${RANK_NAMES[cards.find(c => c.value === straight).rank]} high`,
      cards: cards
    };
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const quadRank = ranks.find(r => rankCounts[r] === 4);
    const kicker = ranks.find(r => rankCounts[r] === 1);
    return {
      ranking: HAND_RANKINGS.FOUR_OF_A_KIND,
      score: 8000000 + RANK_VALUES[quadRank] * 100 + RANK_VALUES[kicker],
      name: HAND_NAMES[HAND_RANKINGS.FOUR_OF_A_KIND],
      description: `Four of a Kind, ${RANK_NAMES[quadRank]}s`,
      cards: cards
    };
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = ranks.find(r => rankCounts[r] === 3);
    const pairRank = ranks.find(r => rankCounts[r] === 2);
    return {
      ranking: HAND_RANKINGS.FULL_HOUSE,
      score: 7000000 + RANK_VALUES[tripRank] * 100 + RANK_VALUES[pairRank],
      name: HAND_NAMES[HAND_RANKINGS.FULL_HOUSE],
      description: `Full House, ${RANK_NAMES[tripRank]}s over ${RANK_NAMES[pairRank]}s`,
      cards: cards
    };
  }

  // Flush
  if (flush) {
    const score = 6000000 + ranks.reduce((sum, rank, i) => sum + RANK_VALUES[rank] * Math.pow(100, 4 - i), 0);
    return {
      ranking: HAND_RANKINGS.FLUSH,
      score,
      name: HAND_NAMES[HAND_RANKINGS.FLUSH],
      description: `Flush, ${RANK_NAMES[ranks[0]]} high`,
      cards: cards
    };
  }

  // Straight
  if (straight) {
    return {
      ranking: HAND_RANKINGS.STRAIGHT,
      score: 5000000 + straight,
      name: HAND_NAMES[HAND_RANKINGS.STRAIGHT],
      description: `Straight, ${RANK_NAMES[cards.find(c => c.value === straight).rank]} high`,
      cards: cards
    };
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const tripRank = ranks.find(r => rankCounts[r] === 3);
    const kickers = ranks.filter(r => rankCounts[r] === 1).slice(0, 2);
    const score = 4000000 + RANK_VALUES[tripRank] * 10000 +
                  RANK_VALUES[kickers[0]] * 100 + RANK_VALUES[kickers[1]];
    return {
      ranking: HAND_RANKINGS.THREE_OF_A_KIND,
      score,
      name: HAND_NAMES[HAND_RANKINGS.THREE_OF_A_KIND],
      description: `Three of a Kind, ${RANK_NAMES[tripRank]}s`,
      cards: cards
    };
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = ranks.filter(r => rankCounts[r] === 2).sort((a, b) => RANK_VALUES[b] - RANK_VALUES[a]);
    const kicker = ranks.find(r => rankCounts[r] === 1);
    const score = 3000000 + RANK_VALUES[pairs[0]] * 10000 +
                  RANK_VALUES[pairs[1]] * 100 + RANK_VALUES[kicker];
    return {
      ranking: HAND_RANKINGS.TWO_PAIR,
      score,
      name: HAND_NAMES[HAND_RANKINGS.TWO_PAIR],
      description: `Two Pair, ${RANK_NAMES[pairs[0]]}s and ${RANK_NAMES[pairs[1]]}s`,
      cards: cards
    };
  }

  // One Pair
  if (counts[0] === 2) {
    const pairRank = ranks.find(r => rankCounts[r] === 2);
    const kickers = ranks.filter(r => rankCounts[r] === 1).slice(0, 3);
    const score = 2000000 + RANK_VALUES[pairRank] * 1000000 +
                  RANK_VALUES[kickers[0]] * 10000 +
                  RANK_VALUES[kickers[1]] * 100 +
                  RANK_VALUES[kickers[2]];
    return {
      ranking: HAND_RANKINGS.ONE_PAIR,
      score,
      name: HAND_NAMES[HAND_RANKINGS.ONE_PAIR],
      description: `Pair of ${RANK_NAMES[pairRank]}s`,
      cards: cards
    };
  }

  // High Card
  const score = 1000000 + ranks.reduce((sum, rank, i) => sum + RANK_VALUES[rank] * Math.pow(100, 4 - i), 0);
  return {
    ranking: HAND_RANKINGS.HIGH_CARD,
    score,
    name: HAND_NAMES[HAND_RANKINGS.HIGH_CARD],
    description: `High Card, ${RANK_NAMES[ranks[0]]}`,
    cards: cards
  };
}

/**
 * Gets all 5-card combinations from 7 cards
 * @param {Array} cards - Array of 7 card objects
 * @returns {Array} Array of all 5-card combinations
 */
function getCombinations(cards) {
  if (cards.length !== 7) {
    throw new Error('Must provide exactly 7 cards');
  }

  const combinations = [];

  // Generate all C(7,5) = 21 combinations
  for (let i = 0; i < 7; i++) {
    for (let j = i + 1; j < 7; j++) {
      for (let k = j + 1; k < 7; k++) {
        for (let l = k + 1; l < 7; l++) {
          for (let m = l + 1; m < 7; m++) {
            combinations.push([cards[i], cards[j], cards[k], cards[l], cards[m]]);
          }
        }
      }
    }
  }

  return combinations;
}

/**
 * Evaluates the best 5-card hand from 7 cards
 * @param {Array} cards - Array of 7 card objects (2 hole + 5 community)
 * @returns {Object} Best hand evaluation
 */
export function evaluateHand(cards) {
  if (cards.length < 5) {
    throw new Error('Need at least 5 cards to evaluate a hand');
  }

  if (cards.length === 5) {
    return evaluateFiveCards(cards);
  }

  if (cards.length === 7) {
    const combinations = getCombinations(cards);
    let bestHand = null;

    combinations.forEach(combo => {
      const evaluation = evaluateFiveCards(combo);
      if (!bestHand || evaluation.score > bestHand.score) {
        bestHand = evaluation;
      }
    });

    return bestHand;
  }

  throw new Error(`Invalid number of cards: ${cards.length}. Expected 5 or 7.`);
}

/**
 * Compares two hands and determines the winner
 * @param {Object} hand1 - First hand evaluation
 * @param {Object} hand2 - Second hand evaluation
 * @returns {number} 1 if hand1 wins, -1 if hand2 wins, 0 if tie
 */
export function compareHands(hand1, hand2) {
  if (hand1.score > hand2.score) return 1;
  if (hand1.score < hand2.score) return -1;
  return 0;
}

/**
 * Finds the winner(s) from an array of player hands
 * @param {Array} players - Array of player objects with hand evaluations
 * @returns {Array} Array of winning player IDs
 */
export function findWinners(players) {
  const activePlayers = players.filter(p => p.hand && !p.folded);

  if (activePlayers.length === 0) return [];
  if (activePlayers.length === 1) return [activePlayers[0].id];

  let bestScore = -1;
  const winners = [];

  activePlayers.forEach(player => {
    if (player.hand.score > bestScore) {
      bestScore = player.hand.score;
      winners.length = 0;
      winners.push(player.id);
    } else if (player.hand.score === bestScore) {
      winners.push(player.id);
    }
  });

  return winners;
}
