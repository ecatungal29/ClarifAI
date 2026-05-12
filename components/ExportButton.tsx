'use client'

import { resultsToCSV } from '@/lib/csv'
import type { EnquiryResult } from '@/lib/types'

interface Props {
  results: EnquiryResult[]
}

export default function ExportButton({ results }: Props) {
  function handleExport() {
    const csv = resultsToCSV(results)
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clarifai-results.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (results.length === 0) return null

  return (
    <button
      onClick={handleExport}
      className="border border-gray-300 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50"
    >
      Export CSV
    </button>
  )
}
