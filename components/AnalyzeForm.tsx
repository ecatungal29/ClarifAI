'use client'

import { useState, useRef } from 'react'
import { parseCSVtoEnquiries } from '@/lib/csv'
import type { EnquiryResult } from '@/lib/types'

interface Props {
  onResults: (results: EnquiryResult[]) => void
}

export default function AnalyzeForm({ onResults }: Props) {
  const [text, setText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [warning, setWarning] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setWarning(null)

    let enquiries: string[] = []

    if (text.trim()) {
      enquiries = text.split('\n').map(s => s.trim()).filter(Boolean)
    } else if (fileRef.current?.files?.[0]) {
      try {
        const csv = await fileRef.current.files[0].text()
        enquiries = parseCSVtoEnquiries(csv)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'CSV parsing failed')
        return
      }
    }

    if (enquiries.length === 0) {
      setError('Please enter or upload at least one enquiry')
      return
    }

    if (enquiries.length > 100) {
      setWarning(`Processing ${enquiries.length} enquiries — this may take 1–2 minutes.`)
    }

    setLoading(true)
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enquiries }),
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error ?? 'Analysis failed')
      }

      const data = await res.json()
      onResults(data.results ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label
          htmlFor="enquiries-textarea"
          className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2"
        >
          Paste enquiries
          <span className="text-[#475569] font-normal normal-case tracking-normal ml-1">— one per line</span>
        </label>
        <textarea
          id="enquiries-textarea"
          value={text}
          onChange={e => setText(e.target.value)}
          rows={7}
          className="w-full bg-[#0F1629] border border-[#2a3650] rounded-xl p-4 font-mono text-sm text-[#E2E8F0] placeholder-[#334155] focus:outline-none focus:border-[#D97706]/60 focus:ring-2 focus:ring-[#D97706]/20 transition-all resize-none"
          placeholder={
            "Hi, we're a new company looking for consulting…\n" +
            "Our site plan was approved but we need clarification…\n" +
            "Your team missed the deadline and we're behind schedule."
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-[#1e2f47]" />
        <span className="text-xs text-[#334155] uppercase tracking-widest">or</span>
        <div className="flex-1 border-t border-[#1e2f47]" />
      </div>

      <div>
        <label
          htmlFor="csv-upload"
          className="block text-xs font-bold text-[#94A3B8] uppercase tracking-widest mb-2"
        >
          Upload CSV
          <span className="text-[#475569] font-normal normal-case tracking-normal ml-1">
            — must have an &ldquo;enquiry&rdquo; or &ldquo;message&rdquo; column
          </span>
        </label>
        <label
          htmlFor="csv-upload"
          className="flex items-center gap-3 px-4 py-3.5 border border-dashed border-[#2a3650] rounded-xl bg-[#0F1629] cursor-pointer hover:border-[#D97706]/40 hover:bg-[#D97706]/5 transition-all group"
        >
          <span className="text-[#D97706] text-base leading-none">↑</span>
          <span className="text-sm text-[#475569] group-hover:text-[#F59E0B] transition-colors">
            {fileName ?? 'Choose a .csv file'}
          </span>
          <input
            ref={fileRef}
            id="csv-upload"
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      {warning && (
        <div
          role="alert"
          className="flex gap-2.5 text-sm text-[#FCD34D] bg-[#D97706]/10 border border-[#D97706]/30 rounded-lg p-3.5"
        >
          <span className="shrink-0 mt-0.5">⚠</span>
          <p>{warning}</p>
        </div>
      )}

      {error && (
        <div
          role="alert"
          className="flex gap-2.5 text-sm text-[#FCA5A5] bg-[#EF4444]/10 border border-[#EF4444]/30 rounded-lg p-3.5"
        >
          <span className="shrink-0 mt-0.5">✕</span>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2.5 rounded-lg text-sm font-bold uppercase tracking-widest transition-all disabled:cursor-not-allowed ${
          loading
            ? 'btn-loading text-[#1a2236] opacity-95'
            : 'bg-[#D97706] text-[#0F1629] hover:bg-[#F59E0B] active:scale-[0.98] shadow-lg shadow-[#D97706]/25 hover:shadow-[#F59E0B]/30'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-[#1a2236]/30 border-t-[#1a2236] rounded-full animate-spin" />
            Analyzing…
          </span>
        ) : (
          'Analyze Enquiries'
        )}
      </button>
    </form>
  )
}
