/** Rows shown per page in the results table. */
export const RESULTS_PAGE_SIZE = 5

export interface ResultsPageSlice<T> {
  rows: T[]
  totalPages: number
  /** 1-based page index, clamped to `totalPages`. */
  safePage: number
  /** 0-based index of first row on this page (in the full list). */
  startIndex: number
}

/**
 * Returns the slice of items for a 1-based page index, clamped to valid range.
 */
export function getResultsPageSlice<T>(items: readonly T[], page: number): ResultsPageSlice<T> {
  const total = items.length
  const totalPages = Math.max(1, Math.ceil(total / RESULTS_PAGE_SIZE))
  const safePage = Math.min(Math.max(1, Math.floor(Number.isFinite(page) ? page : 1)), totalPages)
  const startIndex = (safePage - 1) * RESULTS_PAGE_SIZE
  const rows = items.slice(startIndex, startIndex + RESULTS_PAGE_SIZE)
  return { rows, totalPages, safePage, startIndex }
}
