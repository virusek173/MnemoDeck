import { computeAvgTime, getWorstCards, getDontKnowCards } from '../src/utils/stats';
import { StatsState, CardStats } from '../src/types';

function makeCard(overrides: Partial<CardStats> & { cardNumber: number }): CardStats {
  return {
    avgTimeA: 0,
    avgTimeB: 0,
    dontKnowCount: 0,
    totalAttempts: 0,
    timesA: [],
    timesB: [],
    ...overrides,
  };
}

describe('computeAvgTime', () => {
  it('returns 0 for an empty array', () => {
    expect(computeAvgTime([])).toBe(0);
  });

  it('returns the value itself for a single element', () => {
    expect(computeAvgTime([1000])).toBe(1000);
  });

  it('computes the average correctly', () => {
    expect(computeAvgTime([1000, 2000, 3000])).toBe(2000);
  });

  it('handles decimal results', () => {
    expect(computeAvgTime([1000, 2000])).toBe(1500);
  });

  it('handles large arrays', () => {
    const times = Array.from({ length: 100 }, (_, i) => i * 100);
    const expected = times.reduce((a, b) => a + b, 0) / 100;
    expect(computeAvgTime(times)).toBeCloseTo(expected);
  });
});

describe('getWorstCards', () => {
  it('returns empty array when no cards', () => {
    const stats: StatsState = { cards: {} };
    expect(getWorstCards(stats)).toEqual([]);
  });

  it('excludes cards with no attempts', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, totalAttempts: 0, avgTimeA: 0 }),
      },
    };
    expect(getWorstCards(stats)).toEqual([]);
  });

  it('sorts cards by avgTime descending', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, totalAttempts: 3, avgTimeA: 1000 }),
        2: makeCard({ cardNumber: 2, totalAttempts: 2, avgTimeA: 3000 }),
        3: makeCard({ cardNumber: 3, totalAttempts: 1, avgTimeA: 2000 }),
      },
    };
    const result = getWorstCards(stats);
    expect(result.map((c) => c.cardNumber)).toEqual([2, 3, 1]);
  });

  it('returns only cards with at least one attempt', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, totalAttempts: 5, avgTimeA: 500 }),
        2: makeCard({ cardNumber: 2, totalAttempts: 0, avgTimeA: 9999 }),
      },
    };
    const result = getWorstCards(stats);
    expect(result).toHaveLength(1);
    expect(result[0].cardNumber).toBe(1);
  });
});

describe('getDontKnowCards', () => {
  it('returns empty array when no cards', () => {
    const stats: StatsState = { cards: {} };
    expect(getDontKnowCards(stats)).toEqual([]);
  });

  it('excludes cards with dontKnowCount === 0', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, totalAttempts: 3, dontKnowCount: 0 }),
      },
    };
    expect(getDontKnowCards(stats)).toEqual([]);
  });

  it('includes only cards with dontKnowCount > 0', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, totalAttempts: 5, dontKnowCount: 2 }),
        2: makeCard({ cardNumber: 2, totalAttempts: 3, dontKnowCount: 0 }),
        3: makeCard({ cardNumber: 3, totalAttempts: 4, dontKnowCount: 5 }),
      },
    };
    const result = getDontKnowCards(stats);
    expect(result).toHaveLength(2);
    expect(result.map((c) => c.cardNumber)).toContain(1);
    expect(result.map((c) => c.cardNumber)).toContain(3);
  });

  it('sorts by dontKnowCount descending', () => {
    const stats: StatsState = {
      cards: {
        1: makeCard({ cardNumber: 1, dontKnowCount: 1 }),
        2: makeCard({ cardNumber: 2, dontKnowCount: 5 }),
        3: makeCard({ cardNumber: 3, dontKnowCount: 3 }),
      },
    };
    const result = getDontKnowCards(stats);
    expect(result.map((c) => c.cardNumber)).toEqual([2, 3, 1]);
  });
});
