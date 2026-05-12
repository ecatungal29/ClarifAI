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
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Paste enquiries <span className="text-gray-400">(one per line)</span>
        </label>
        <textarea
          value={text}
          onChange={e => setText(e.target.value)}
          rows={8}
          className="w-full border border-gray-300 rounded-md p-3 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder={"Hi, we're a new company looking for consulting...\nOur site plan was approved but we need clarification...\nYour team missed the deadline and we're behind schedule."}
        />
      </div>

      <div className="flex items-center gap-2">
        <div className="flex-1 border-t border-gray-200" />
        <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
        <div className="flex-1 border-t border-gray-200" />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Upload CSV <span className="text-gray-400">(must have an &quot;enquiry&quot; or &quot;message&quot; column)</span>
        </label>
        <input ref={fileRef} type="file" accept=".csv" className="text-sm text-gray-600" />
      </div>

      {warning && (
        <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-md p-2">{warning}</p>
      )}
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-md p-2">{error}</p>
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-600 text-white px-5 py-2 rounded-md text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? 'Analyzing…' : 'Analyze Enquiries'}
      </button>
    </form>
  )
}
