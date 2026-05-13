'use client'

import { resultsToCSV } from '@/lib/csv'
import type { EnquiryResult } from '@/lib/types'

interface Props {
  results: EnquiryResult[]
}

export default function ExportButton({ results }: Props) {
  function handleExport() {
    const csv = resultsToCSV(results)
    const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'clarifai-results.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  if (results.length === 0) return null

  return (
    <button
      onClick={handleExport}
      className="flex items-center gap-2 border border-[#3730A3]/25 text-[#3730A3] px-4 py-2 rounded-lg text-sm font-medium hover:bg-[#EEF2FF] hover:border-[#3730A3]/50 active:scale-[0.98] transition-all"
    >
      <span className="text-base leading-none">↓</span>
      Export CSV
    </button>
  )
}
