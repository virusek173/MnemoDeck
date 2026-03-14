import { CardStats, StatsState } from '../types';

export function computeAvgTime(times: number[]): number {
  if (times.length === 0) return 0;
  const sum = times.reduce((acc, t) => acc + t, 0);
  return sum / times.length;
}

/**
 * Return cards sorted by worst (highest) max(avgTimeA, avgTimeB) descending.
 * Only cards that have at least one attempt are included.
 */
export function getWorstCards(stats: StatsState): CardStats[] {
  return Object.values(stats.cards)
    .filter((c) => c.totalAttempts > 0)
    .sort((a, b) => Math.max(b.avgTimeA, b.avgTimeB) - Math.max(a.avgTimeA, a.avgTimeB));
}

/**
 * Return cards where dontKnowCount > 0, sorted by dontKnowCount descending.
 */
export function getDontKnowCards(stats: StatsState): CardStats[] {
  return Object.values(stats.cards)
    .filter((c) => c.dontKnowCount > 0)
    .sort((a, b) => b.dontKnowCount - a.dontKnowCount);
}
