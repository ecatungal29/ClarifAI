import { NextRequest, NextResponse } from 'next/server'
import { classifyEnquiry } from '@/lib/claude'
import type { AnalyzeRequest, AnalyzeResponse, EnquiryResult } from '@/lib/types'

export async function POST(request: NextRequest) {
  let body: AnalyzeRequest
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { enquiries } = body
  if (!Array.isArray(enquiries) || enquiries.length === 0) {
    return NextResponse.json(
      { error: 'enquiries must be a non-empty array' },
      { status: 400 }
    )
  }

  if (enquiries.some(e => typeof e !== 'string')) {
    return NextResponse.json(
      { error: 'All enquiries must be strings' },
      { status: 400 }
    )
  }

  const results: EnquiryResult[] = []

  for (const enquiry of enquiries) {
    if (!enquiry.trim()) {
      results.push({ enquiry, type: null, suggestedResponse: 'N/A', reasoning: '' })
      continue
    }

    let attempt = 0
    while (attempt < 3) {
      try {
        const classified = await classifyEnquiry(enquiry)
        results.push({ enquiry, ...classified })
        break
      } catch (err) {
        console.error(`[analyze] attempt ${attempt + 1} failed for enquiry: "${enquiry.slice(0, 60)}"`, err)
        attempt++
        if (attempt === 3) {
          results.push({
            enquiry,
            type: 'general_question',
            suggestedResponse: 'Unable to generate response due to an error.',
            reasoning: 'API error after retries',
          })
        } else {
          await new Promise(r => setTimeout(r, Math.pow(2, attempt - 1) * 500))
        }
      }
    }
  }

  const response: AnalyzeResponse = { results }
  return NextResponse.json(response)
}
