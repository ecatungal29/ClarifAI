import { parseCSVtoEnquiries, resultsToCSV } from '@/lib/csv'
import type { EnquiryResult } from '@/lib/types'

describe('parseCSVtoEnquiries', () => {
  it('should parse CSV with "enquiry" column', () => {
    const csv = 'enquiry,other\nHello,extra\nAnother enquiry,extra'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello', 'Another enquiry'])
  })

  it('should parse CSV with "message" column', () => {
    const csv = 'message\nHello\nWorld'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello', 'World'])
  })

  it('should parse quoted fields containing commas', () => {
    const csv = 'enquiry\n"Hello, how are you?"\nAnother'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello, how are you?', 'Another'])
  })

  it('should throw if no matching column', () => {
    expect(() => parseCSVtoEnquiries('subject\nHello')).toThrow(
      'CSV must have a column named "enquiry" or "message"'
    )
  })

  it('should skip empty rows', () => {
    const csv = 'enquiry\nHello\n\nWorld'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello', 'World'])
  })

  it('should return empty array for header-only CSV', () => {
    expect(parseCSVtoEnquiries('enquiry\n')).toEqual([])
  })
})

describe('resultsToCSV', () => {
  it('should produce CSV with correct header', () => {
    const csv = resultsToCSV([])
    expect(csv.split('\n')[0]).toBe('enquiry,type,suggestedResponse,reasoning')
  })

  it('should produce a row per result', () => {
    const results: EnquiryResult[] = [
      { enquiry: 'Hello', type: 'new_client', suggestedResponse: 'Welcome!', reasoning: 'First contact' },
    ]
    const lines = resultsToCSV(results).split('\n')
    expect(lines[1]).toBe('Hello,new_client,Welcome!,First contact')
  })

  it('should escape values containing commas', () => {
    const results: EnquiryResult[] = [
      { enquiry: 'Hello, world', type: 'general_question', suggestedResponse: 'OK', reasoning: 'Simple' },
    ]
    expect(resultsToCSV(results)).toContain('"Hello, world"')
  })

  it('should handle null type', () => {
    const results: EnquiryResult[] = [
      { enquiry: '', type: null, suggestedResponse: 'N/A', reasoning: '' },
    ]
    const row = resultsToCSV(results).split('\n')[1]
    expect(row).toContain('N/A')
  })
})
