export interface CardData {
  number: number;
  word: string;
}

export type RoundType = 'A' | 'B'; // A: number→word, B: word→number

export interface CardStats {
  cardNumber: number;
  avgTime: number; // average ms to click "Odkryj"
  dontKnowCount: number;
  totalAttempts: number;
  times: number[]; // all recorded times
}

export interface StatsState {
  cards: Record<number, CardStats>;
}
