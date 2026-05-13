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
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Paste enquiries
          <span className="text-[#9CA3AF] font-normal ml-1">— one per line</span>
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={7}
          className="w-full bg-white border border-[#E5E1DA] rounded-xl p-4 font-mono text-sm text-[#374151] placeholder-[#C4BAB0] focus:outline-none focus:border-[#4F46E5]/50 focus:ring-3 focus:ring-[#4F46E5]/8 transition-all resize-none"
          placeholder={
            "Hi, we're a new company looking for consulting…\n" +
            "Our site plan was approved but we need clarification…\n" +
            'Your team missed the deadline and we\'re behind schedule.'
          }
        />
      </div>

      <div className="flex items-center gap-3">
        <div className="flex-1 border-t border-[#E5E1DA]" />
        <span className="text-xs text-[#C4BAB0] uppercase tracking-widest">or</span>
        <div className="flex-1 border-t border-[#E5E1DA]" />
      </div>

      <div>
        <label className="block text-sm font-medium text-[#374151] mb-2">
          Upload CSV
          <span className="text-[#9CA3AF] font-normal ml-1">
            — must have an &ldquo;enquiry&rdquo; or &ldquo;message&rdquo; column
          </span>
        </label>
        <label className="flex items-center gap-3 px-4 py-3.5 border border-dashed border-[#C8C4BE] rounded-xl bg-[#FAFAF8] cursor-pointer hover:border-[#4F46E5]/40 hover:bg-[#EEF2FF]/20 transition-all group">
          <span className="text-[#4F46E5] text-base leading-none">↑</span>
          <span className="text-sm text-[#9CA3AF] group-hover:text-[#4F46E5] transition-colors">
            {fileName ?? 'Choose a .csv file'}
          </span>
          <input
            ref={fileRef}
            type="file"
            accept=".csv"
            className="sr-only"
            onChange={e => setFileName(e.target.files?.[0]?.name ?? null)}
          />
        </label>
      </div>

      {warning && (
        <div className="flex gap-2.5 text-sm text-[#92400E] bg-[#FFFBEB] border border-[#FDE68A] rounded-lg p-3.5">
          <span className="shrink-0 mt-0.5">⚠</span>
          <p>{warning}</p>
        </div>
      )}

      {error && (
        <div className="flex gap-2.5 text-sm text-[#991B1B] bg-[#FEF2F2] border border-[#FECACA] rounded-lg p-3.5">
          <span className="shrink-0 mt-0.5">✕</span>
          <p>{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className={`px-6 py-2.5 rounded-lg text-sm font-semibold text-white transition-all disabled:cursor-not-allowed ${
          loading
            ? 'btn-loading opacity-90'
            : 'bg-[#3730A3] hover:bg-[#4338CA] active:scale-[0.98] shadow-sm shadow-[#3730A3]/20'
        }`}
      >
        {loading ? (
          <span className="flex items-center gap-2">
            <span className="inline-block w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            Analyzing…
          </span>
        ) : (
          'Analyze Enquiries'
        )}
      </button>
    </form>
  )
}
