import { SUITS, RANKS, RANK_VALUES } from '../utils/constants';

/**
 * Creates a standard 52-card deck
 * @returns {Array} Array of card objects
 */
export function createDeck() {
  const deck = [];

  Object.values(SUITS).forEach(suit => {
    RANKS.forEach(rank => {
      deck.push({
        rank,
        suit,
        value: RANK_VALUES[rank]
      });
    });
  });

  return deck;
}

/**
 * Shuffles a deck using Fisher-Yates algorithm
 * @param {Array} deck - The deck to shuffle
 * @returns {Array} Shuffled deck
 */
export function shuffleDeck(deck) {
  const shuffled = [...deck];

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  return shuffled;
}

/**
 * Deals a card from the deck (removes and returns the top card)
 * @param {Array} deck - The deck to deal from
 * @returns {Object} { card, remainingDeck }
 */
export function dealCard(deck) {
  if (deck.length === 0) {
    throw new Error('Cannot deal from empty deck');
  }

  const newDeck = [...deck];
  const card = newDeck.pop();

  return {
    card,
    remainingDeck: newDeck
  };
}

/**
 * Deals multiple cards from the deck
 * @param {Array} deck - The deck to deal from
 * @param {number} count - Number of cards to deal
 * @returns {Object} { cards, remainingDeck }
 */
export function dealCards(deck, count) {
  if (deck.length < count) {
    throw new Error(`Cannot deal ${count} cards from deck with ${deck.length} cards`);
  }

  const newDeck = [...deck];
  const cards = [];

  for (let i = 0; i < count; i++) {
    cards.push(newDeck.pop());
  }

  return {
    cards,
    remainingDeck: newDeck
  };
}

/**
 * Creates and shuffles a new deck
 * @returns {Array} Shuffled deck
 */
export function createShuffledDeck() {
  return shuffleDeck(createDeck());
}
