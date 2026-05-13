'use client'

import { useState } from 'react'
import AnalyzeForm from '@/components/AnalyzeForm'
import ResultsTable from '@/components/ResultsTable'
import ExportButton from '@/components/ExportButton'
import type { EnquiryResult, EnquiryType } from '@/lib/types'

const FILTERS: { label: string; value: EnquiryType | 'all' }[] = [
  { label: 'All',            value: 'all' },
  { label: 'New Client',     value: 'new_client' },
  { label: 'Support',        value: 'support_request' },
  { label: 'Complaint',      value: 'complaint' },
  { label: 'General',        value: 'general_question' },
]

export default function Home() {
  const [results, setResults] = useState<EnquiryResult[]>([])
  const [filter, setFilter] = useState<EnquiryType | 'all'>('all')
  const [showForm, setShowForm] = useState(true)

  function handleResults(r: EnquiryResult[]) {
    setResults(r)
    setFilter('all')
    setShowForm(false)
  }

  function handleNewEnquiry() {
    setShowForm(true)
    setResults([])
    setFilter('all')
  }

  const filtered = filter === 'all' ? results : results.filter(r => r.type === filter)

  return (
    <div className="min-h-screen bg-[#0F1629] flex flex-col">

      {/* Top nav */}
      <header className="sticky top-0 z-20 bg-[#0c1220] border-b border-[#1e2f47]">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 h-14 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-md bg-[#D97706] flex items-center justify-center shrink-0">
              <span className="text-[#0F1629] text-xs font-black">C</span>
            </div>
            <span className="text-white font-bold text-sm tracking-widest uppercase">ClarifAI</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="h-8 px-3 border border-[#2a3650] hover:border-[#3a4a60] text-[#94A3B8] hover:text-[#CBD5E1] text-xs font-medium rounded-lg transition-colors">
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Page body */}
      <main className="flex-1">
        <div className="max-w-[1440px] mx-auto px-6 md:px-10 py-8 space-y-6">

          {/* Page title row */}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="display-heading text-[2rem] md:text-[2.4rem] text-white leading-tight">
                Analyze Enquiries
              </h1>
              <p className="text-[#94A3B8] mt-1 text-sm">
                Classify client messages, generate suggested responses, and export results.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0 pt-1">
              <button
                onClick={handleNewEnquiry}
                className="h-9 px-4 bg-[#D97706] hover:bg-[#F59E0B] text-[#0F1629] text-xs font-bold uppercase tracking-widest rounded-lg transition-colors flex items-center gap-1.5 shadow-md shadow-[#D97706]/20"
              >
                <span className="text-sm leading-none">+</span>
                New Enquiry
              </button>
              {results.length > 0 && <ExportButton results={results} />}
            </div>
          </div>

          {/* Form */}
          {showForm && (
            <div className="glass-card p-7">
              <AnalyzeForm onResults={handleResults} />
            </div>
          )}

          {/* Results section */}
          {results.length > 0 && (
            <div className="space-y-3">

              {/* Filter bar */}
              <div className="flex items-center gap-2 flex-wrap">
                {FILTERS.map(f => {
                  const count = f.value === 'all'
                    ? results.length
                    : results.filter(r => r.type === f.value).length
                  if (f.value !== 'all' && count === 0) return null
                  return (
                    <button
                      key={f.value}
                      onClick={() => setFilter(f.value)}
                      className={`h-8 px-3.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
                        filter === f.value
                          ? 'bg-[#D97706]/20 text-[#F59E0B] border border-[#D97706]/40'
                          : 'border border-[#2a3650] text-[#64748B] hover:border-[#3a4a60] hover:text-[#94A3B8]'
                      }`}
                    >
                      {f.label}
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                        filter === f.value ? 'bg-[#D97706]/30 text-[#F59E0B]' : 'bg-[#1e2f47] text-[#475569]'
                      }`}>
                        {count}
                      </span>
                    </button>
                  )
                })}
                <span className="ml-auto text-xs text-[#475569]">
                  {filtered.length} of {results.length} result{results.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Results table */}
              <div className="glass-card overflow-hidden">
                <ResultsTable results={filtered} />
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
