'use client'

import { useState } from 'react'
import AnalyzeForm from '@/components/AnalyzeForm'
import ResultsTable from '@/components/ResultsTable'
import ExportButton from '@/components/ExportButton'
import type { EnquiryResult } from '@/lib/types'

export default function Home() {
  const [results, setResults] = useState<EnquiryResult[]>([])

  return (
    <main className="max-w-5xl mx-auto px-6 py-10 space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">ClarifAI</h1>
        <p className="text-gray-500 mt-1">
          Intelligent enquiry triage for consulting teams — classify, respond, export.
        </p>
      </div>

      <section>
        <AnalyzeForm onResults={setResults} />
      </section>

      {results.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-800">
              {results.length} result{results.length !== 1 ? 's' : ''}
            </h2>
            <ExportButton results={results} />
          </div>
          <ResultsTable results={results} />
        </section>
      )}
    </main>
  )
}
