import Anthropic from "@anthropic-ai/sdk";
import type { EnquiryType } from "./types";

let _client: Anthropic | null = null;

function getClient(): Anthropic {
	if (!_client) {
		_client = new Anthropic();
	}
	return _client;
}

const VALID_TYPES = new Set<EnquiryType>([
	"new_client",
	"support_request",
	"complaint",
	"general_question",
]);

const SYSTEM_PROMPT = `
You are an enquiry classification assistant for a strata management consulting firm.

Your responsibilities:
1. Classify the enquiry into exactly ONE category
2. Generate a professional suggested response
3. Explain the reasoning briefly

Enquiry categories:

- new_client:
  Someone seeking to engage the firm for the first time

- support_request:
  An existing client requesting help, updates, clarification, or assistance with an ongoing matter

- complaint:
  A client expressing dissatisfaction, frustration, criticism, or reporting a service failure

- general_question:
  General informational enquiries that do not fit the above categories

Rules:
- Respond ONLY with valid JSON
- No markdown
- No code fences
- No extra commentary
- Do not invent facts
- Do not promise actions were completed
- Do not admit liability or legal fault
- Do not fabricate timelines or guarantees
- Keep responses concise, professional, and warm
- Suggested response should sound like a real staff member
- Use "Hi [First Name]," only if a clear first name is confidently identifiable
- Otherwise use "Hi there,"
- Keep suggested responses under 150 words
- confidence must be a number between 0 and 1

JSON format:
{
  "type": "new_client",
  "confidence": 0.95,
  "suggestedResponse": "Hi John, ...",
  "reasoning": "The sender is enquiring about engaging services for the first time."
}

"type" must be exactly one of:
- new_client
- support_request
- complaint
- general_question
`;

export interface ClassifyResult {
	type: EnquiryType;
	confidence: number;
	suggestedResponse: string;
	reasoning: string;
	requiresHumanReview: boolean;
}

function sanitizeEnquiry(enquiry: string): string {
	return enquiry
		.replace(/<[^>]*>/g, " ")
		.replace(/\s+/g, " ")
		.replace(
			/This email and any attachments may contain confidential information[\s\S]*$/i,
			"",
		)
		.trim()
		.slice(0, 8000);
}

export async function classifyEnquiry(
	enquiry: string,
): Promise<ClassifyResult> {
	try {
		const sanitizedEnquiry = sanitizeEnquiry(enquiry);

		const message = await getClient().messages.create({
			model: "claude-haiku-4-5-20251001",
			max_tokens: 350,
			temperature: 0.1,
			system: SYSTEM_PROMPT,
			messages: [{ role: "user", content: sanitizedEnquiry }],
		});

		const raw = message.content
			.filter((block) => block.type === "text")
			.map((block) => block.text)
			.join("\n");

		return parseClaudeResponse(raw);
	} catch (error) {
		console.error("AI classification failed:", error);
		return fallbackResponse("AI request failed");
	}
}

export function parseClaudeResponse(raw: string): ClassifyResult {
	try {
		const fenceMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/i);
		const cleaned = (fenceMatch ? fenceMatch[1] : raw).trim();

		const parsed = JSON.parse(cleaned);

		if (
			!VALID_TYPES.has(parsed.type) ||
			typeof parsed.confidence !== "number" ||
			typeof parsed.suggestedResponse !== "string" ||
			typeof parsed.reasoning !== "string"
		) {
			throw new Error("Invalid response shape");
		}

		const confidence = Math.max(0, Math.min(1, parsed.confidence));

		return {
			type: parsed.type,
			confidence,
			suggestedResponse: parsed.suggestedResponse.trim(),
			reasoning: parsed.reasoning.trim(),
			requiresHumanReview: confidence < 0.85,
		};
	} catch (error) {
		console.error("Failed to parse Claude response:", error);
		console.error("Raw response:", raw);
		return fallbackResponse("Failed to parse AI response");
	}
}

function fallbackResponse(reason: string): ClassifyResult {
	return {
		type: "general_question",
		confidence: 0,
		suggestedResponse: "",
		reasoning: reason,
		requiresHumanReview: true,
	};
}
