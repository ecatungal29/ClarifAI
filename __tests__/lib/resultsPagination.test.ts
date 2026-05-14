import {
  RESULTS_PAGE_SIZE,
  getResultsPageSlice,
} from '@/lib/resultsPagination'

describe('getResultsPageSlice', () => {
  it('returns first page up to RESULTS_PAGE_SIZE items', () => {
    const items = Array.from({ length: RESULTS_PAGE_SIZE }, (_, i) => i)
    const { rows, totalPages, safePage, startIndex } = getResultsPageSlice(items, 1)
    expect(rows).toHaveLength(RESULTS_PAGE_SIZE)
    expect(totalPages).toBe(1)
    expect(safePage).toBe(1)
    expect(startIndex).toBe(0)
  })

  it('uses two pages when length is page size + 1', () => {
    const items = Array.from({ length: RESULTS_PAGE_SIZE + 1 }, (_, i) => i)
    const p1 = getResultsPageSlice(items, 1)
    expect(p1.totalPages).toBe(2)
    expect(p1.rows).toHaveLength(RESULTS_PAGE_SIZE)

    const p2 = getResultsPageSlice(items, 2)
    expect(p2.safePage).toBe(2)
    expect(p2.rows).toHaveLength(1)
    expect(p2.startIndex).toBe(RESULTS_PAGE_SIZE)
  })

  it('clamps page above totalPages', () => {
    const items = [1, 2, 3]
    const { rows, safePage, totalPages } = getResultsPageSlice(items, 99)
    expect(totalPages).toBe(1)
    expect(safePage).toBe(1)
    expect(rows).toEqual([1, 2, 3])
  })

  it('clamps non-finite page to 1', () => {
    const items = [1, 2]
    const { safePage } = getResultsPageSlice(items, NaN)
    expect(safePage).toBe(1)
  })
})
