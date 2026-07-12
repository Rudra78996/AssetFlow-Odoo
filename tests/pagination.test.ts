import { describe, it, expect } from 'vitest';
import { resolvePagination, buildMeta, skipTake } from '../src/lib/pagination';

describe('Pagination Utility (Safe Unit Test)', () => {
  it('should resolve default pagination parameters correctly', () => {
    const params = resolvePagination({});
    expect(params.page).toBe(1);
    expect(params.limit).toBe(20);
    expect(params.sortOrder).toBe('desc');
  });

  it('should cap the maximum limit to 100 to prevent DB overload', () => {
    const params = resolvePagination({ limit: '500' });
    expect(params.limit).toBe(100);
  });

  it('should correctly calculate skip and take for Prisma queries', () => {
    const params = resolvePagination({ page: '3', limit: '15' });
    const { skip, take } = skipTake(params);
    expect(skip).toBe(30); // (3 - 1) * 15
    expect(take).toBe(15);
  });

  it('should build proper response metadata', () => {
    const params = resolvePagination({ page: '2', limit: '10' });
    const meta = buildMeta(45, params);
    expect(meta.total).toBe(45);
    expect(meta.totalPages).toBe(5); // 45 / 10 = 4.5 -> ceil(5)
  });
});
