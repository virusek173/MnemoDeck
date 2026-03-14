export interface CardData {
  number: number;
  word: string;
}

export type RoundType = 'A' | 'B'; // A: number→word, B: word→number

export interface CardStats {
  cardNumber: number;
  avgTimeA: number; // average time: number → word
  avgTimeB: number; // average time: word → number
  dontKnowCount: number;
  totalAttempts: number;
  timesA: number[];
  timesB: number[];
}

export interface StatsState {
  cards: Record<number, CardStats>;
}
