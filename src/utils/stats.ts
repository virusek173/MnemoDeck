import { CardStats, StatsState } from '../types';

/**
 * Compute average time from an array of millisecond values.
 * Returns 0 if the array is empty.
 */
export function computeAvgTime(times: number[]): number {
  if (times.length === 0) return 0;
  const sum = times.reduce((acc, t) => acc + t, 0);
  return sum / times.length;
}

/**
 * Return cards sorted by worst (highest) avgTime descending.
 * Only cards that have at least one attempt are included.
 */
export function getWorstCards(stats: StatsState): CardStats[] {
  return Object.values(stats.cards)
    .filter((c) => c.totalAttempts > 0)
    .sort((a, b) => b.avgTime - a.avgTime);
}

/**
 * Return cards where dontKnowCount > 0, sorted by dontKnowCount descending.
 */
export function getDontKnowCards(stats: StatsState): CardStats[] {
  return Object.values(stats.cards)
    .filter((c) => c.dontKnowCount > 0)
    .sort((a, b) => b.dontKnowCount - a.dontKnowCount);
}
