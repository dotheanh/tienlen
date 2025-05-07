export interface Card {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number; // 3-2 (15 for 2)
}

export interface Player {
  id: string;
  name: string;
  cards: Card[];
  isHost: boolean;
}

export interface GameState {
  players: Player[];
  currentTurn: string;
  status: 'waiting' | 'playing' | 'finished';
  lastPlayedCards?: Card[];
  lastPlayedBy?: string;
} 