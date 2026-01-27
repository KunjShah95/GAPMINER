// Unit tests for API functions
import { describe, it, expect } from 'vitest'
import {
    GapSchema,
    StartupIdeaSchema,
    isValidPaperUrl,
    validatePaperUrls
} from '@/types/research'

describe('Research Types Validation', () => {
    describe('GapSchema', () => {
        it('should validate a valid gap object', () => {
            const validGap = {
                problem: 'Limited training data',
                type: 'data',
                confidence: 0.85,
            }

            const result = GapSchema.safeParse(validGap)
            expect(result.success).toBe(true)
        })

        it('should reject invalid gap type', () => {
            const invalidGap = {
                problem: 'Test',
                type: 'invalid_type',
                confidence: 0.5,
            }

            const result = GapSchema.safeParse(invalidGap)
            expect(result.success).toBe(false)
        })

        it('should reject confidence out of range', () => {
            const invalidGap = {
                problem: 'Test',
                type: 'data',
                confidence: 1.5, // > 1
            }

            const result = GapSchema.safeParse(invalidGap)
            expect(result.success).toBe(false)
        })

        it('should reject empty problem', () => {
            const invalidGap = {
                problem: '',
                type: 'data',
                confidence: 0.5,
            }

            const result = GapSchema.safeParse(invalidGap)
            expect(result.success).toBe(false)
        })

        it('should allow optional fields', () => {
            const gapWithOptionals = {
                problem: 'Test problem',
                type: 'compute',
                confidence: 0.9,
                impactScore: 'high',
                difficulty: 'medium',
                assumptions: ['Assumption 1'],
                failures: ['Previous failure'],
            }

            const result = GapSchema.safeParse(gapWithOptionals)
            expect(result.success).toBe(true)
            if (result.success) {
                expect(result.data.impactScore).toBe('high')
                expect(result.data.assumptions).toHaveLength(1)
            }
        })
    })

    describe('StartupIdeaSchema', () => {
        it('should validate a valid startup idea', () => {
            const validIdea = {
                idea: 'AI research assistant',
                audience: 'Researchers',
                why_now: 'LLMs are mature',
            }

            const result = StartupIdeaSchema.safeParse(validIdea)
            expect(result.success).toBe(true)
        })

        it('should reject missing fields', () => {
            const invalidIdea = {
                idea: 'Test idea',
                // missing audience and why_now
            }

            const result = StartupIdeaSchema.safeParse(invalidIdea)
            expect(result.success).toBe(false)
        })
    })
})

describe('URL Validation', () => {
    describe('isValidPaperUrl', () => {
        it('should accept arXiv URLs', () => {
            expect(isValidPaperUrl('https://arxiv.org/abs/2024.00001')).toBe(true)
            expect(isValidPaperUrl('https://arxiv.org/pdf/2024.00001.pdf')).toBe(true)
        })

        it('should accept OpenReview URLs', () => {
            expect(isValidPaperUrl('https://openreview.net/forum?id=abc123')).toBe(true)
        })

        it('should accept ACL Anthology URLs', () => {
            expect(isValidPaperUrl('https://aclanthology.org/2023.acl-long.1/')).toBe(true)
        })

        it('should accept Semantic Scholar URLs', () => {
            expect(isValidPaperUrl('https://www.semanticscholar.org/paper/abc')).toBe(true)
        })

        it('should reject non-academic URLs', () => {
            expect(isValidPaperUrl('https://google.com')).toBe(false)
            expect(isValidPaperUrl('https://example.com/paper.pdf')).toBe(false)
        })

        it('should reject invalid URLs', () => {
            expect(isValidPaperUrl('not-a-url')).toBe(false)
            expect(isValidPaperUrl('')).toBe(false)
        })
    })

    describe('validatePaperUrls', () => {
        it('should separate valid and invalid URLs', () => {
            const urls = [
                'https://arxiv.org/abs/2024.00001',
                'https://google.com',
                'https://openreview.net/forum?id=xyz',
                'invalid-url',
            ]

            const result = validatePaperUrls(urls)

            expect(result.valid).toHaveLength(2)
            expect(result.invalid).toHaveLength(2)
            expect(result.valid).toContain('https://arxiv.org/abs/2024.00001')
            expect(result.invalid).toContain('https://google.com')
        })
    })
})
