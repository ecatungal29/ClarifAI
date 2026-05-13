import type { EnquiryResult, EnquiryType } from '@/lib/types'

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
  if (results.length === 0) return null

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-[#2a3650]">
            <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Enquiry</th>
            <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest w-36">Type</th>
            <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Suggested Response</th>
            <th scope="col" className="text-left px-5 py-3.5 text-[10px] font-bold text-[#94A3B8] uppercase tracking-widest">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const cfg = r.type ? TYPE_CONFIG[r.type] : null
            return (
              <tr
                key={i}
                className="border-b last:border-0 hover:bg-white/[0.03] transition-colors row-enter"
                style={{
                  borderColor: 'rgba(255,255,255,0.06)',
                  animationDelay: `${i * 35}ms`,
                }}
              >
                <td className="px-5 py-4 align-top max-w-[220px]">
                  <p className="text-[#F1F5F9] break-words leading-relaxed text-sm">{r.enquiry || '—'}</p>
                </td>
                <td className="px-5 py-4 align-top">
                  <div className="flex flex-col gap-1.5">
                    {cfg ? (
                      <span
                        className="inline-flex items-center text-xs font-bold px-2.5 py-1 rounded-full whitespace-nowrap"
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
  )
}
