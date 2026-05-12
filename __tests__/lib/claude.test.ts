import { parseClaudeResponse } from '@/lib/claude'

describe('parseClaudeResponse', () => {
  it('should parse valid JSON response', () => {
    const raw = JSON.stringify({
      type: 'complaint',
      suggestedResponse: 'We apologize for the inconvenience.',
      reasoning: 'Client expressed dissatisfaction.',
    })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('complaint')
    expect(result.suggestedResponse).toBe('We apologize for the inconvenience.')
    expect(result.reasoning).toBe('Client expressed dissatisfaction.')
  })

  it('should strip ```json markdown fences before parsing', () => {
    const raw = '```json\n{"type":"new_client","suggestedResponse":"Welcome!","reasoning":"First contact."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('new_client')
    expect(result.suggestedResponse).toBe('Welcome!')
  })

  it('should strip plain ``` markdown fences before parsing', () => {
    const raw = '```\n{"type":"support_request","suggestedResponse":"We will look into it.","reasoning":"Needs help."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('support_request')
  })

  it('should return fallback on invalid JSON', () => {
    const result = parseClaudeResponse('not valid json')
    expect(result.type).toBe('general_question')
    expect(result.suggestedResponse).toBe('Unable to generate response')
    expect(result.reasoning).toBe('Unable to determine type')
  })

  it('should return fallback on empty string', () => {
    const result = parseClaudeResponse('')
    expect(result.type).toBe('general_question')
  })

  it('should extract JSON from fence even with preamble text before it', () => {
    const raw = 'Here is the classification:\n```json\n{"type":"complaint","suggestedResponse":"Sorry.","reasoning":"Dissatisfied."}\n```'
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('complaint')
    expect(result.suggestedResponse).toBe('Sorry.')
  })

  it('should return fallback when type is not a valid EnquiryType', () => {
    const raw = JSON.stringify({ type: 'escalation', suggestedResponse: 'X', reasoning: 'Y' })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('general_question')
  })

  it('should return fallback when required fields are missing', () => {
    const raw = JSON.stringify({ type: 'complaint' })
    const result = parseClaudeResponse(raw)
    expect(result.type).toBe('general_question')
  })
})
