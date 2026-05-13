import type { EnquiryResult, EnquiryType } from '@/lib/types'

const TYPE_CONFIG: Record<EnquiryType, { label: string; dot: string; bg: string; text: string }> = {
  new_client:       { label: 'New Client',    dot: '#6B9E78', bg: '#F0FDF4', text: '#166534' },
  support_request:  { label: 'Support',       dot: '#4F46E5', bg: '#EEF2FF', text: '#3730A3' },
  complaint:        { label: 'Complaint',     dot: '#DC2626', bg: '#FEF2F2', text: '#991B1B' },
  general_question: { label: 'General',       dot: '#9CA3AF', bg: '#F9FAFB', text: '#4B5563' },
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
          <tr className="border-b border-[#F0EDE8]">
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#B0ABA4] uppercase tracking-wider">Enquiry</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#B0ABA4] uppercase tracking-wider w-36">Type</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#B0ABA4] uppercase tracking-wider">Suggested Response</th>
            <th className="text-left px-5 py-3.5 text-xs font-semibold text-[#B0ABA4] uppercase tracking-wider">Reasoning</th>
          </tr>
        </thead>
        <tbody>
          {results.map((r, i) => {
            const cfg = r.type ? TYPE_CONFIG[r.type] : null
            return (
              <tr
                key={i}
                className="border-b border-[#F5F2EE] last:border-0 hover:bg-background transition-colors row-enter"
                style={{ animationDelay: `${i * 35}ms` }}
              >
                <td className="px-5 py-4 align-top max-w-[220px]">
                  <p className="text-[#374151] wrap-break-word leading-relaxed text-sm">{r.enquiry || '—'}</p>
                </td>
                <td className="px-5 py-4 align-top">
                  {cfg ? (
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full whitespace-nowrap"
                      style={{ background: cfg.bg, color: cfg.text }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: cfg.dot }} />
                      {cfg.label}
                    </span>
                  ) : (
                    <span className="text-[#9CA3AF] text-xs">—</span>
                  )}
                </td>
                <td className="px-5 py-4 align-top text-[#4B5563] leading-relaxed text-sm">{r.suggestedResponse}</td>
                <td className="px-5 py-4 align-top text-[#9CA3AF] text-xs leading-relaxed">{r.reasoning}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
