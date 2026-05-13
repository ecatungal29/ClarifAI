export type EnquiryType = 'new_client' | 'support_request' | 'complaint' | 'general_question'

export interface EnquiryResult {
  enquiry: string
  type: EnquiryType | null
  confidence: number
  suggestedResponse: string
  reasoning: string
  requiresHumanReview: boolean
}

export interface AnalyzeRequest {
  enquiries: string[]
}

export interface AnalyzeResponse {
  results: EnquiryResult[]
}
