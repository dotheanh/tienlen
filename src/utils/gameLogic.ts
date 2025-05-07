import { GameState, Card } from '../types/game';

const SUITS: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
const VALUES = Array.from({ length: 13 }, (_, i) => i + 3); // 3 to 15 (2 is 15)

export function initializeGame(): GameState {
  return {
    players: [],
    currentTurn: '1',
    status: 'waiting'
  };
}

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const value of VALUES) {
      deck.push({ suit, value });
    }
  }
  return deck;
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function dealCards(gameState: GameState): GameState {
  const deck = shuffleDeck(createDeck());
  const players = gameState.players.map(player => ({
    ...player,
    cards: deck.splice(0, 13).sort((a, b) => a.value - b.value)
  }));

  return {
    ...gameState,
    players
  };
}

export function isValidPlay(cards: Card[], lastPlayedCards?: Card[]): boolean {
  if (!lastPlayedCards) return true;
  if (cards.length !== lastPlayedCards.length) return false;

  // Check if it's a valid combination (single, pair, three of a kind, etc.)
  // This is a simplified version - you'll need to add more complex rules
  const values = cards.map(card => card.value);
  const lastValues = lastPlayedCards.map(card => card.value);
  
  return Math.min(...values) > Math.min(...lastValues);
}

export const sortCards = (cards: Card[]): Card[] => {
  return [...cards].sort((a, b) => a.value - b.value);
}; 