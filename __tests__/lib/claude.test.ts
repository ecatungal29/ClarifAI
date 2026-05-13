import { parseClaudeResponse } from '@/lib/claude'

describe('parseClaudeResponse', () => {
  it('should parse valid JSON response', () => {
    const raw = JSON.stringify({
      type: 'complaint',
      confidence: 0.95,
      suggestedResponse: 'We apologize for the inconvenience.',
      reasoning: 'Client expressed dissatisfaction.',
    })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('complaint')
    expect(result.confidence).toBe(0.95)
    expect(result.suggestedResponse).toBe('We apologize for the inconvenience.')
    expect(result.reasoning).toBe('Client expressed dissatisfaction.')
    expect(result.requiresHumanReview).toBe(false)
  })

  it('should strip ```json markdown fences before parsing', () => {
    const raw = '```json\n{"type":"new_client","confidence":0.9,"suggestedResponse":"Welcome!","reasoning":"First contact."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('new_client')
    expect(result.suggestedResponse).toBe('Welcome!')
  })

  it('should strip plain ``` markdown fences before parsing', () => {
    const raw = '```\n{"type":"support_request","confidence":0.8,"suggestedResponse":"We will look into it.","reasoning":"Needs help."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('support_request')
  })

  it('should return fallback on invalid JSON', () => {
    const result = parseClaudeResponse('not valid json')
    expect(result.type).toBe('general_question')
    expect(result.confidence).toBe(0)
    expect(result.suggestedResponse).toBe('')
    expect(result.reasoning).toBe('Failed to parse AI response')
    expect(result.requiresHumanReview).toBe(true)
  })

  it('should return fallback on empty string', () => {
    const result = parseClaudeResponse('')
    expect(result.type).toBe('general_question')
    expect(result.requiresHumanReview).toBe(true)
  })

  it('should extract JSON from fence even with preamble text before it', () => {
    const raw = 'Here is the classification:\n```json\n{"type":"complaint","confidence":0.92,"suggestedResponse":"Sorry.","reasoning":"Dissatisfied."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('complaint')
    expect(result.suggestedResponse).toBe('Sorry.')
  })

  it('should return fallback when type is not a valid EnquiryType', () => {
    const raw = JSON.stringify({ type: 'escalation', confidence: 0.9, suggestedResponse: 'X', reasoning: 'Y' })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('general_question')
  })

  it('should return fallback when required fields are missing', () => {
    const raw = JSON.stringify({ type: 'complaint' })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('general_question')
  })

  it('should set requiresHumanReview true when confidence is below 0.85', () => {
    const raw = JSON.stringify({
      type: 'general_question',
      confidence: 0.6,
      suggestedResponse: 'Thanks for reaching out.',
      reasoning: 'Unclear intent.',
    })
    const result = parseClaudeResponse(raw)
    expect(result.requiresHumanReview).toBe(true)
  })

  it('should clamp confidence to [0, 1]', () => {
    const raw = JSON.stringify({
      type: 'new_client',
      confidence: 1.5,
      suggestedResponse: 'Hi there,',
      reasoning: 'New enquiry.',
    })
    const result = parseClaudeResponse(raw)
    expect(result.confidence).toBe(1)
  })
})
