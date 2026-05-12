import type { EnquiryResult, EnquiryType } from '@/lib/types'

const TYPE_LABELS: Record<EnquiryType, string> = {
  new_client: 'New Client',
  support_request: 'Support Request',
  complaint: 'Complaint',
  general_question: 'General Question',
}

const TYPE_CLASSES: Record<EnquiryType, string> = {
  new_client: 'bg-green-100 text-green-800',
  support_request: 'bg-blue-100 text-blue-800',
  complaint: 'bg-red-100 text-red-800',
  general_question: 'bg-gray-100 text-gray-800',
}

interface Props {
  results: EnquiryResult[]
}

export default function ResultsTable({ results }: Props) {
  if (results.length === 0) return null

  return (
    <div className="overflow-x-auto rounded-lg border border-gray-200">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            <th className="text-left px-4 py-3 font-medium text-gray-600 border-b">Enquiry</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 border-b w-36">Type</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 border-b">Suggested Response</th>
            <th className="text-left px-4 py-3 font-medium text-gray-600 border-b">Reasoning</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {results.map((r, i) => (
            <tr key={i} className={r.type === null ? 'bg-red-50' : 'bg-white'}>
              <td className="px-4 py-3 align-top max-w-xs break-words text-gray-800">{r.enquiry || '—'}</td>
              <td className="px-4 py-3 align-top">
                {r.type ? (
                  <span className={`inline-block text-xs font-medium px-2 py-1 rounded-full ${TYPE_CLASSES[r.type]}`}>
                    {TYPE_LABELS[r.type]}
                  </span>
                ) : (
                  <span className="text-gray-400">—</span>
                )}
              </td>
              <td className="px-4 py-3 align-top text-gray-700">{r.suggestedResponse}</td>
              <td className="px-4 py-3 align-top text-gray-500 text-xs">{r.reasoning}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
