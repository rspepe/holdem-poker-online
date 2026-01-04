import { RANK_VALUES, SUITS } from '../utils/constants';

/**
 * Evaluates pre-flop hand strength
 * @param {Array} holeCards - Player's two hole cards
 * @returns {number} Hand strength score 0-100
 */
export function evaluatePreFlopStrength(holeCards) {
  if (!holeCards || holeCards.length !== 2) return 0;

  const [card1, card2] = holeCards;
  const val1 = RANK_VALUES[card1.rank];
  const val2 = RANK_VALUES[card2.rank];
  const suited = card1.suit === card2.suit;
  const highCard = Math.max(val1, val2);
  const lowCard = Math.min(val1, val2);
  const gap = highCard - lowCard;

  let score = 0;

  // Pocket pairs
  if (val1 === val2) {
    score = 50 + (val1 * 3); // 53-92
    return Math.min(score, 100);
  }

  // High cards (face cards and aces)
  if (highCard >= 11) { // J or better
    score += (highCard - 10) * 10; // 10-40
  }

  // Suited bonus
  if (suited) {
    score += 15;
  }

  // Connected cards bonus
  if (gap === 1) {
    score += 10;
  } else if (gap === 2) {
    score += 5;
  }

  // Ace bonus
  if (highCard === 14) {
    score += 15;
    if (lowCard >= 10) { // AT or better
      score += 10;
    }
  }

  // King bonus
  if (highCard === 13 && lowCard >= 11) { // KQ, KJ
    score += 10;
  }

  return Math.min(score, 95); // Cap at 95 (save 100 for premium pairs)
}

/**
 * Evaluates post-flop hand strength (simplified)
 * @param {Array} holeCards - Player's hole cards
 * @param {Array} communityCards - Community cards
 * @returns {number} Hand strength score 0-100
 */
export function evaluatePostFlopStrength(holeCards, communityCards) {
  if (!holeCards || holeCards.length !== 2) return 0;
  if (!communityCards || communityCards.length === 0) return evaluatePreFlopStrength(holeCards);

  // Combine cards
  const allCards = [...holeCards, ...communityCards];

  // Check for made hands
  const hasPair = checkForPair(allCards);
  const hasTwoPair = checkForTwoPair(allCards);
  const hasTrips = checkForThreeOfAKind(allCards);
  const hasStraightDraw = checkForStraightDraw(allCards);
  const hasFlushDraw = checkForFlushDraw(allCards);
  const hasStraight = checkForStraight(allCards);
  const hasFlush = checkForFlush(allCards);
  const hasFullHouse = checkForFullHouse(allCards);
  const hasQuads = checkForQuads(allCards);

  if (hasQuads) return 100;
  if (hasFullHouse) return 95;
  if (hasFlush) return 90;
  if (hasStraight) return 85;
  if (hasTrips) return 70;
  if (hasTwoPair) return 60;
  if (hasPair) {
    const pairRank = getPairRank(allCards);
    return 35 + (pairRank * 2); // 35-63
  }
  if (hasFlushDraw) return 45;
  if (hasStraightDraw) return 40;

  // High card
  const highCard = Math.max(...allCards.map(c => RANK_VALUES[c.rank]));
  return 10 + highCard; // 12-24
}

// Helper functions
function checkForPair(cards) {
  const ranks = cards.map(c => c.rank);
  return ranks.some((rank, i) => ranks.indexOf(rank) !== i);
}

function getPairRank(cards) {
  const rankCounts = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
  });
  const pairRanks = Object.keys(rankCounts).filter(r => rankCounts[r] >= 2);
  if (pairRanks.length === 0) return 0;
  return Math.max(...pairRanks.map(r => RANK_VALUES[r]));
}

function checkForTwoPair(cards) {
  const rankCounts = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
  });
  const pairs = Object.values(rankCounts).filter(count => count >= 2);
  return pairs.length >= 2;
}

function checkForThreeOfAKind(cards) {
  const rankCounts = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
  });
  return Object.values(rankCounts).some(count => count >= 3);
}

function checkForQuads(cards) {
  const rankCounts = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
  });
  return Object.values(rankCounts).some(count => count >= 4);
}

function checkForFullHouse(cards) {
  const rankCounts = {};
  cards.forEach(c => {
    rankCounts[c.rank] = (rankCounts[c.rank] || 0) + 1;
  });
  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  return counts[0] >= 3 && counts[1] >= 2;
}

function checkForFlush(cards) {
  const suitCounts = {};
  cards.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });
  return Object.values(suitCounts).some(count => count >= 5);
}

function checkForFlushDraw(cards) {
  const suitCounts = {};
  cards.forEach(c => {
    suitCounts[c.suit] = (suitCounts[c.suit] || 0) + 1;
  });
  return Object.values(suitCounts).some(count => count === 4);
}

function checkForStraight(cards) {
  const values = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);

  // Check for regular straight
  for (let i = 0; i <= values.length - 5; i++) {
    let consecutive = true;
    for (let j = 0; j < 4; j++) {
      if (values[i + j] - values[i + j + 1] !== 1) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) return true;
  }

  // Check for wheel (A-2-3-4-5)
  if (values.includes(14) && values.includes(2) && values.includes(3) &&
      values.includes(4) && values.includes(5)) {
    return true;
  }

  return false;
}

function checkForStraightDraw(cards) {
  const values = [...new Set(cards.map(c => c.value))].sort((a, b) => b - a);

  // Open-ended straight draw (4 consecutive cards)
  for (let i = 0; i <= values.length - 4; i++) {
    let consecutive = true;
    for (let j = 0; j < 3; j++) {
      if (values[i + j] - values[i + j + 1] !== 1) {
        consecutive = false;
        break;
      }
    }
    if (consecutive) return true;
  }

  return false;
}
