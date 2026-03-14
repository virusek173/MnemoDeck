export interface CardData {
  number: number;
  word: string;
}

export type RoundType = 'A' | 'B'; // A: number→word, B: word→number

export interface CardStats {
  cardNumber: number;
  avgTimeA: number; // średni czas: liczba → słowo
  avgTimeB: number; // średni czas: słowo → liczba
  dontKnowCount: number;
  totalAttempts: number;
  timesA: number[];
  timesB: number[];
}

export interface StatsState {
  cards: Record<number, CardStats>;
}
