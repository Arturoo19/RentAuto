import { revenuePercentChange } from './revenue-percent-change';

describe('revenuePercentChange', () => {
  it('returns 0 when both periods are zero', () => {
    expect(revenuePercentChange(0, 0)).toBe(0);
  });

  it('returns null when previous is zero but current is not', () => {
    expect(revenuePercentChange(189.25, 0)).toBeNull();
  });

  it('calculates rounded percent change', () => {
    expect(revenuePercentChange(994.6, 189.25)).toBe(426);
    expect(revenuePercentChange(189.25, 94.625)).toBe(100);
  });

  it('returns negative change when revenue drops', () => {
    expect(revenuePercentChange(50, 100)).toBe(-50);
  });
});
