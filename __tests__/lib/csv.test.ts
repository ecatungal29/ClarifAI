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

  it('should handle Windows line endings (\\r\\n)', () => {
    const csv = 'enquiry\r\nHello\r\nWorld'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello', 'World'])
  })

  it('should handle UTF-8 BOM from Excel exports', () => {
    const csv = '﻿enquiry\nHello\nWorld'
    expect(parseCSVtoEnquiries(csv)).toEqual(['Hello', 'World'])
  })

  it('should handle quoted fields with escaped double-quotes', () => {
    const csv = 'enquiry\n"She said ""hello"""\nAnother'
    expect(parseCSVtoEnquiries(csv)).toEqual(['She said "hello"', 'Another'])
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

  it('should escape values containing double-quotes', () => {
    const results: EnquiryResult[] = [
      { enquiry: 'He said "help"', type: 'support_request', suggestedResponse: 'OK', reasoning: 'Test' },
    ]
    expect(resultsToCSV(results)).toContain('"He said ""help"""')
  })
})
