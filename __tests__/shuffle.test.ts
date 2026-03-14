import { shuffle } from '../src/utils/shuffle';

describe('shuffle', () => {
  it('returns an array of the same length', () => {
    const input = [1, 2, 3, 4, 5];
    const result = shuffle(input);
    expect(result).toHaveLength(input.length);
  });

  it('contains all original elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const result = shuffle(input);
    expect(result.sort((a, b) => a - b)).toEqual(input.sort((a, b) => a - b));
  });

  it('does not mutate the original array', () => {
    const input = [1, 2, 3, 4, 5];
    const original = [...input];
    shuffle(input);
    expect(input).toEqual(original);
  });

  it('returns a new array reference', () => {
    const input = [1, 2, 3];
    const result = shuffle(input);
    expect(result).not.toBe(input);
  });

  it('handles empty arrays', () => {
    expect(shuffle([])).toEqual([]);
  });

  it('handles single-element arrays', () => {
    expect(shuffle([42])).toEqual([42]);
  });

  it('produces different orderings over multiple runs (statistical)', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const results = new Set<string>();
    for (let i = 0; i < 20; i++) {
      results.add(shuffle(input).join(','));
    }
    // With 10 elements, extremely unlikely to get same order twice in 20 tries
    expect(results.size).toBeGreaterThan(1);
  });

  it('works with string arrays', () => {
    const input = ['a', 'b', 'c', 'd'];
    const result = shuffle(input);
    expect(result).toHaveLength(4);
    expect(result.sort()).toEqual(['a', 'b', 'c', 'd']);
  });
});
