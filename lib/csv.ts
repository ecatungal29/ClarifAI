import type { EnquiryResult } from './types'

export function parseCSVtoEnquiries(csv: string): string[] {
  const lines = csv.trim().split('\n')
  if (lines.length < 2) return []

  const header = lines[0].split(',').map(h => h.trim().replace(/"/g, '').toLowerCase())
  const colIndex = header.indexOf('enquiry') !== -1
    ? header.indexOf('enquiry')
    : header.indexOf('message')

  if (colIndex === -1) {
    throw new Error('CSV must have a column named "enquiry" or "message"')
  }

  return lines
    .slice(1)
    .map(line => parseCSVLine(line)[colIndex]?.trim() ?? '')
    .filter(e => e.length > 0)
}

function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes
    } else if (char === ',' && !inQuotes) {
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }
  result.push(current)
  return result
}

export function resultsToCSV(results: EnquiryResult[]): string {
  const header = 'enquiry,type,suggestedResponse,reasoning'
  const rows = results.map(r =>
    [
      csvEscape(r.enquiry),
      csvEscape(r.type ?? ''),
      csvEscape(r.suggestedResponse),
      csvEscape(r.reasoning),
    ].join(',')
  )
  return [header, ...rows].join('\n')
}

function csvEscape(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}
