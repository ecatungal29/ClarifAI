'use client'

import { useState } from 'react'
import AnalyzeForm from '@/components/AnalyzeForm'
import ResultsTable from '@/components/ResultsTable'
import ExportButton from '@/components/ExportButton'
import type { EnquiryResult } from '@/lib/types'

const TYPE_LEGEND = [
  { label: 'New Client',       color: '#6B9E78' },
  { label: 'Support Request',  color: '#4F46E5' },
  { label: 'Complaint',        color: '#DC2626' },
  { label: 'General Question', color: '#9CA3AF' },
]

export default function Home() {
  const [results, setResults] = useState<EnquiryResult[]>([])

  return (
    <div className="flex h-screen overflow-hidden bg-[#FAFAF8]">

      {/* Sidebar */}
      <aside className="w-[220px] shrink-0 bg-[#1E1B4B] flex flex-col overflow-hidden">
        <div className="px-6 pt-8 pb-6 border-b border-white/[0.07]">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#4F46E5] flex items-center justify-center shrink-0">
              <span className="text-white text-xs font-bold">C</span>
            </div>
            <span className="text-[#E0E7FF] font-semibold text-sm tracking-wide">ClarifAI</span>
          </div>
          <p className="text-[#6366F1]/60 text-xs mt-3 leading-relaxed">
            Enquiry triage for consulting teams
          </p>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {[
            { label: 'Triage',  icon: '◈', active: true  },
            { label: 'Export',  icon: '↓', active: false },
          ].map(item => (
            <div
              key={item.label}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm cursor-default select-none transition-colors ${
                item.active
                  ? 'bg-[#4F46E5]/25 text-[#A5B4FC]'
                  : 'text-[#6366F1]/50 hover:text-[#A5B4FC] hover:bg-[#4F46E5]/10'
              }`}
            >
              <span className="text-base leading-none">{item.icon}</span>
              <span className="font-medium">{item.label}</span>
            </div>
          ))}
        </nav>

        <div className="px-4 pb-6">
          <div className="rounded-xl bg-white/[0.05] px-4 py-3.5 border border-white/[0.06]">
            <p className="text-[#818CF8] text-xs font-semibold mb-1">Sequential processing</p>
            <p className="text-[#E0E7FF]/40 text-xs leading-relaxed">
              Calls Claude per enquiry. Max 100 per batch.
            </p>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-10 py-10 space-y-8">

          {/* Header */}
          <div>
            <h1 className="display-heading text-[2.6rem] text-[#1E1B4B] leading-tight">
              Analyze Enquiries
            </h1>
            <p className="text-[#6B7280] mt-2 text-sm leading-relaxed">
              Classify client messages, generate suggested responses, and export results.
            </p>
          </div>

          {/* Type legend */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {TYPE_LEGEND.map(t => (
              <div key={t.label} className="flex items-center gap-2 text-sm text-[#9CA3AF]">
                <span className="w-2 h-2 rounded-full shrink-0" style={{ background: t.color }} />
                {t.label}
              </div>
            ))}
          </div>

          {/* Form card */}
          <div className="glass-card p-7">
            <AnalyzeForm onResults={setResults} />
          </div>

          {/* Results */}
          {results.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="display-heading text-xl text-[#1E1B4B]">
                  {results.length} result{results.length !== 1 ? 's' : ''}
                </h2>
                <ExportButton results={results} />
              </div>
              <div className="glass-card overflow-hidden">
                <ResultsTable results={results} />
              </div>
            </div>
          )}
        </div>
      </main>

    </div>
  )
}
