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
  "type": "new_client" | "support_request" | "complaint" | "general_question",
  "suggestedResponse": "A professional, warm response for the staff member to send or adapt",
  "reasoning": "One or two sentences explaining why this classification was chosen"
}`

export interface ClassifyResult {
  type: EnquiryType
  suggestedResponse: string
  reasoning: string
}

export async function classifyEnquiry(enquiry: string): Promise<ClassifyResult> {
  const message = await getClient().messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 500,
    system: [
      {
        type: 'text',
        text: SYSTEM_PROMPT,
        cache_control: { type: 'ephemeral' },
      },
    ] as Anthropic.Messages.TextBlockParam[],
    messages: [{ role: 'user', content: enquiry }],
  })

  const raw = message.content[0].type === 'text' ? message.content[0].text : ''
  return parseClaudeResponse(raw)
}

export function parseClaudeResponse(raw: string): ClassifyResult {
  const cleaned = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/, '')
    .trim()

  try {
    const parsed = JSON.parse(cleaned)
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
