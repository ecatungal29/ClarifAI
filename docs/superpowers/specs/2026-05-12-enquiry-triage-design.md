# ClarifAI Enquiry Triage — Design Document

**Date:** 2026-05-12  
**Status:** Approved for Implementation  
**Scope:** MVP — Core enquiry classification + response generation for batch processing

---

## Context

Strata Management Consultants processes high volumes of client enquiries manually — staff read each one, determine the type, and draft a response or route it. This is repetitive and time-consuming.

**Goal:** Build a prototype tool that uses AI (Claude) to instantly classify enquiries by type and generate response suggestions, reducing manual work and improving consistency.

**Success criteria:**
- Accept batch enquiries (text paste or CSV upload)
- Classify each by type (new client, support request, complaint, general question)
- Generate suggested response for each
- Export results as CSV
- Handle edge cases gracefully (vague input, API errors, batch timeouts)

---

## Architecture Overview

**Stack:** Next.js 15+ (App Router) + TypeScript + Claude API + Anthropic SDK

**High-level flow:**
1. User inputs enquiries via web form (paste text or upload CSV)
2. Frontend sends batch to `/api/analyze` endpoint
3. API calls Claude API sequentially for each enquiry
4. Claude classifies and generates response suggestion
5. Results returned to frontend, displayed in table, exportable as CSV

**Why this approach:**
- Single Next.js app keeps dependencies minimal and deployment simple
- Frontend + backend co-located enables fast iteration
- Claude API provides reliable classification and response generation
- Synchronous processing is acceptable for initial batches (typical: <50 enquiries at once)

**Future extensibility:** Can add async queue processing, confidence scoring, team routing, or email integration without restructuring core.

---

## Components & Data Flow

### Frontend Components

**1. AnalyzeForm**
- Text input area: paste enquiries (one per line)
- OR CSV file upload: expects column named "enquiry" or "message"
- Submit button, loading state, error display
- Validation: reject empty submission

**2. ResultsTable**
- Displays: enquiry text → classification type → suggested response → reasoning
- Sortable/searchable (stretch goal, not MVP)
- Highlight failed rows (if any)

**3. ExportButton**
- Downloads results as CSV with all columns

### Data Shape

**Input to API:**
```typescript
{
  enquiries: string[]
}
```

**Output from API:**
```typescript
{
  results: Array<{
    enquiry: string
    type: "new_client" | "support_request" | "complaint" | "general_question"
    suggestedResponse: string
    reasoning: string
  }>
}
```

### API Flow

**Endpoint:** `POST /api/analyze`

1. Receive array of enquiry strings
2. For each enquiry:
   - Call Claude API with system prompt + enquiry text
   - Parse response to extract: type, suggested response, reasoning
   - Handle errors gracefully
3. Return results array

**Claude Integration:**
- System prompt: Instructions on classification criteria, response tone (professional but warm), format expectations
- User message: The enquiry text
- Model: `claude-3-5-sonnet-20241022` (or latest available)
- Temperature: 0.7 (balanced creativity + consistency)
- Max tokens: 500 per response

**Response parsing:** Extract JSON or structured text from Claude output (e.g., Claude returns a structured format, we parse it into our result shape)

---

## Error Handling & Edge Cases

### API / Claude Errors
- **Network timeout:** Retry up to 2x with exponential backoff, then return error message to user
- **Rate limit (429):** Queue retry, inform user processing is slower than expected
- **Invalid response:** If Claude's output can't be parsed, classify as "general_question" and note "Unable to determine type"
- **Empty enquiry:** Skip, return `{ enquiry: "", type: null, suggestedResponse: "N/A" }`

### Frontend Validation
- **Empty batch:** Show message "Please enter or upload at least one enquiry"
- **Large batch (100+):** Warn "Processing may take 1-2 minutes"
- **CSV parsing error:** Show which rows failed to parse, allow user to fix and re-upload

### Vague or Nonsensical Input
- Trust Claude's judgment; it will classify reasonably
- Example: Random string → likely "general_question"
- No special handling needed; results are transparent to user

### Security
- System prompt is locked (can't be overridden by user input)
- No sensitive data in Claude calls (just enquiry text + no authentication info)
- Safe for production use

---

## Testing Strategy

### Unit Tests
- **Classification parsing:** Mock Claude response, verify we extract type/response correctly
- **CSV parsing:** Valid rows, empty rows, missing columns, malformed input
- **Prompt formatting:** Ensure user enquiry is safely injected into system prompt

### Integration Tests
- **Full API flow:** Send enquiry → call Claude → parse response → return result
- **Error paths:** Timeout, rate limit, parse failure — verify graceful degradation
- **Batch processing:** Multiple enquiries in one request

### Manual Testing
- Sample enquiries for each type:
  - **New client:** "Hi, we're a new development company looking for consulting on building regulations"
  - **Support request:** "Our site plan was approved but we need clarification on setback requirements"
  - **Complaint:** "Your team missed the inspection deadline and now we're behind schedule"
  - **General question:** "What's the difference between a site plan and a development application?"
- Edge cases:
  - Very long enquiry (500+ words)
  - One-word enquiry ("Help")
  - Enquiry in different language (should still classify, not error)

### Verification
- Results match expected types for test enquiries
- CSV export contains correct columns and data
- API returns 200 for valid input, 400 for invalid
- Batch of 50 enquiries processes in <2 minutes

---

## File Structure (to be created)

```
ClarifAI/
├── app/
│   ├── layout.tsx
│   ├── page.tsx              # Main page, AnalyzeForm + ResultsTable
│   └── api/
│       └── analyze/
│           └── route.ts      # POST /api/analyze — orchestrates Claude calls
├── components/
│   ├── AnalyzeForm.tsx
│   ├── ResultsTable.tsx
│   └── ExportButton.tsx
├── lib/
│   ├── claude.ts            # Claude API client, prompt templates
│   ├── csv.ts               # CSV parsing/export utilities
│   └── types.ts             # TypeScript types (input/output shapes)
├── docs/
│   └── superpowers/
│       └── specs/
│           └── 2026-05-12-enquiry-triage-design.md (this file)
├── README.md                # Setup, running, design decisions
├── .env.example             # ANTHROPIC_API_KEY
├── package.json
└── tsconfig.json
```

---

## Design Decisions

1. **Synchronous processing:** Simpler to build and test than async queue. OK for MVP (<100 enquiries typical).
2. **Claude over other models:** Better at nuanced analysis, prompt caching support, structured output capability.
3. **CSV support:** Real-world use case — staff often work with spreadsheets.
4. **Reasoning field:** Adds transparency — staff see *why* the AI classified something, builds trust.
5. **No auth for MVP:** Assumes internal tool usage. Can add later.

---

## Success Metrics (Post-Launch)

- Tool can classify 100 diverse enquiries with >85% accuracy
- Staff find suggested responses useful (can use as-is or edit)
- Processing time: <2 minutes for 50 enquiries
- Zero API errors in first 100 runs
- No prompt injection vulnerabilities

---

## Future Enhancements (Out of Scope)

- Confidence scoring (re-use Claude's probability via structured output)
- Team routing (e.g., classify AND suggest "Sales" vs "Support" team)
- Email integration (auto-fetch from Gmail/Outlook, send responses)
- Batch scheduling (upload multiple CSVs, process overnight)
- Admin dashboard (usage stats, response quality ratings)
