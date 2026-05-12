import Anthropic from '@anthropic-ai/sdk'
import type { EnquiryType } from './types'

let _client: Anthropic | null = null

function getClient(): Anthropic {
  if (!_client) {
    _client = new Anthropic()
  }
  return _client
}

const SYSTEM_PROMPT = `You are an enquiry classification assistant for a strata management consulting firm.

Classify the given client enquiry into exactly one of these types:
- new_client: Someone looking to engage the firm for the first time
- support_request: An existing client needing help or clarification on an ongoing matter
- complaint: A client expressing dissatisfaction, frustration, or reporting a failure
- general_question: General information requests that do not fit the above categories

Respond with ONLY valid JSON in this exact format — no other text, no markdown fences, no explanation:
{
  "type": "new_client",
  "suggestedResponse": "A professional, warm response for the staff member to send or adapt",
  "reasoning": "One or two sentences explaining why this classification was chosen"
}
(type must be exactly one of: new_client, support_request, complaint, general_question)`

export interface ClassifyResult {
  type: EnquiryType
  suggestedResponse: string
  reasoning: string
}

export async function classifyEnquiry(enquiry: string): Promise<ClassifyResult> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    temperature: 0.7,
    system: [
      {
        type: 'text' as const,
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ],
    messages: [{ role: 'user', content: enquiry }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseClaudeResponse(raw)
}

const VALID_TYPES = new Set<EnquiryType>(['new_client', 'support_request', 'complaint', 'general_question'])

export function parseClaudeResponse(raw: string): ClassifyResult {
  const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  const cleaned = (fenceMatch ? fenceMatch[1] : raw).trim()

  try {
    const parsed = JSON.parse(cleaned)
    if (
      !VALID_TYPES.has(parsed.type) ||
      typeof parsed.suggestedResponse !== 'string' ||
      typeof parsed.reasoning !== 'string'
    ) {
      throw new Error('Invalid response shape')
    }
    return {
      type: parsed.type,
      suggestedResponse: parsed.suggestedResponse,
      reasoning: parsed.reasoning,
    }
  } catch {
    return {
      type: 'general_question',
      suggestedResponse: 'Unable to generate response',
      reasoning: 'Unable to determine type',
    }
  }
}
