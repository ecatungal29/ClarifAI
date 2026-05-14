'use client'

import { useEffect, useState } from 'react'
import type { EnquiryResult, EnquiryType } from '@/lib/types'
import { getResultsPageSlice, RESULTS_PAGE_SIZE } from '@/lib/resultsPagination'

const TYPE_CONFIG: Record<EnquiryType, { label: string; bg: string; text: string }> = {
  new_client:       { label: 'New Client',  bg: '#166534', text: '#86EFAC' },
  support_request:  { label: 'Support',     bg: '#312E81', text: '#A5B4FC' },
  complaint:        { label: 'Complaint',   bg: '#7F1D1D', text: '#FCA5A5' },
  general_question: { label: 'General',     bg: '#1E293B', text: '#94A3B8' },
}

interface Props {
  results: EnquiryResult[]
}

export default function ResultsTable({ results }: Props) {
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [results])

  if (results.length === 0) return null

  const { rows, totalPages, safePage, startIndex } = getResultsPageSlice(results, page)
  const rangeFrom = startIndex + 1
  const rangeTo = startIndex + rows.length

  return (
    <div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2a3650]">
              <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest w-[18%]">Enquiry</th>
              <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest w-[12%]">Type</th>
              <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest w-[42%]">Suggested Response</th>
              <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest w-[28%]">Reasoning</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const cfg = r.type ? TYPE_CONFIG[r.type] : null
              const globalIndex = startIndex + i
              return (
                <tr
                  key={globalIndex}
                  className="border-b last:border-0 hover:bg-white/[0.03] transition-colors row-enter"
                  style={{
                    borderColor: 'rgba(255,255,255,0.06)',
                    animationDelay: `${i * 35}ms`,
                  }}
                >
                  <td className="px-5 py-4 align-top">
                    <p className="text-[#F1F5F9] break-words leading-relaxed text-sm">{r.enquiry || '—'}</p>
                  </td>
                  <td className="px-5 py-4 align-top">
                    <div className="flex flex-col gap-1.5">
                      {cfg ? (
                        <span
                          className="inline-flex justify-center items-end text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
                          style={{ background: cfg.bg, color: cfg.text }}
                        >
                          {cfg.label}
                        </span>
                      ) : (
                        <span className="text-[#475569] text-xs">—</span>
                      )}
                      {r.requiresHumanReview && (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full whitespace-nowrap bg-[#D97706]/15 text-[#FCD34D] border border-[#D97706]/30">
                          ⚠ Review
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-5 py-4 align-top text-[#E2E8F0] leading-relaxed text-sm">{r.suggestedResponse}</td>
                  <td className="px-5 py-4 align-top text-[#CBD5E1] text-xs leading-relaxed break-words">{r.reasoning}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between px-5 py-3.5 border-t border-[#2a3650]">
        <p className="text-xs text-[#64748B]">
          Showing {rangeFrom}–{rangeTo} of {results.length}
          <span className="text-[#475569]"> · {RESULTS_PAGE_SIZE} per page</span>
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            disabled={safePage <= 1}
            onClick={() =>
              setPage((p) => {
                const { safePage: sp } = getResultsPageSlice(results, p)
                return Math.max(1, sp - 1)
              })
            }
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-[#2a3650] text-[#CBD5E1] hover:border-[#3a4a60] hover:bg-white/[0.03] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Previous
          </button>
          <span className="text-xs text-[#94A3B8] tabular-nums min-w-[5.5rem] text-center">
            Page {safePage} / {totalPages}
          </span>
          <button
            type="button"
            disabled={safePage >= totalPages}
            onClick={() =>
              setPage((p) => {
                const { safePage: sp, totalPages: tp } = getResultsPageSlice(results, p)
                return Math.min(sp + 1, tp)
              })
            }
            className="h-8 px-3 rounded-lg text-xs font-semibold border border-[#2a3650] text-[#CBD5E1] hover:border-[#3a4a60] hover:bg-white/[0.03] disabled:opacity-40 disabled:pointer-events-none transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  )
}
