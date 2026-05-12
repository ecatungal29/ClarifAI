import { POST } from '@/app/api/analyze/route'
import { NextRequest } from 'next/server'
import * as claudeLib from '@/lib/claude'

jest.mock('@/lib/claude')

const mockClassify = jest.mocked(claudeLib.classifyEnquiry)

function makeRequest(body: unknown) {
  return new NextRequest('http://localhost/api/analyze', {
    method: 'POST',
    body: JSON.stringify(body),
    headers: { 'Content-Type': 'application/json' },
  })
}

describe('POST /api/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockClassify.mockResolvedValue({
      type: 'general_question',
      suggestedResponse: 'Thank you for your enquiry.',
      reasoning: 'General question detected.',
    })
  })

  it('should return 400 when enquiries field is missing', async () => {
    const res = await POST(makeRequest({}))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('should return 400 when enquiries is an empty array', async () => {
    const res = await POST(makeRequest({ enquiries: [] }))
    expect(res.status).toBe(400)
  })

  it('should return 400 for invalid JSON body', async () => {
    const req = new NextRequest('http://localhost/api/analyze', {
      method: 'POST',
      body: 'not json',
      headers: { 'Content-Type': 'application/json' },
    })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('should classify each non-empty enquiry and return results', async () => {
    const res = await POST(makeRequest({ enquiries: ['Hello', 'Help me'] }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.results).toHaveLength(2)
    expect(mockClassify).toHaveBeenCalledTimes(2)
    expect(mockClassify).toHaveBeenCalledWith('Hello')
    expect(mockClassify).toHaveBeenCalledWith('Help me')
  })

  it('should skip whitespace-only enquiries without calling Claude', async () => {
    const res = await POST(makeRequest({ enquiries: ['   '] }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.results[0].type).toBeNull()
    expect(data.results[0].suggestedResponse).toBe('N/A')
    expect(mockClassify).not.toHaveBeenCalled()
  })

  it('should return error result after 3 Claude failures', async () => {
    mockClassify.mockRejectedValue(new Error('Network error'))
    const res = await POST(makeRequest({ enquiries: ['Hello'] }))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.results[0].reasoning).toContain('error')
    expect(mockClassify).toHaveBeenCalledTimes(3)
  })

  it('should return 400 when enquiries contains non-string values', async () => {
    const res = await POST(makeRequest({ enquiries: ['Hello', 42, null] }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })
})
