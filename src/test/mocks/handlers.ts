// MSW Request Handlers for API Mocking
import { http, HttpResponse } from 'msw'

// Sample mock data
const mockGaps = [
    {
        id: 'gap-1',
        problem: 'Limited training data for low-resource languages',
        type: 'data',
        confidence: 0.85,
        impactScore: 'high',
        difficulty: 'high',
        assumptions: ['Assumes multilingual transfer learning is viable'],
        failures: ['Previous attempts failed due to vocabulary mismatch'],
        datasetGaps: ['No parallel corpora for 95% of world languages'],
        evaluationCritique: 'Current metrics favor English-centric evaluation'
    },
    {
        id: 'gap-2',
        problem: 'High inference cost for large models',
        type: 'compute',
        confidence: 0.92,
        impactScore: 'high',
        difficulty: 'medium',
        assumptions: [],
        failures: [],
        datasetGaps: [],
    }
]

const mockStartupIdea = {
    idea: 'AI-powered research assistant for literature review',
    audience: 'PhD students and researchers',
    why_now: 'LLMs have reached sufficient capability for domain-specific reasoning'
}

const mockResearchProposal = {
    title: 'Efficient Multi-Task Learning for Low-Resource NLP',
    abstract: 'We propose a novel approach to address data scarcity...',
    motivation: 'Low-resource languages remain underserved by current NLP systems...',
    methodology: 'We will develop a meta-learning framework that...'
}

export const handlers = [
    // Mock Firecrawl API
    http.post('https://api.firecrawl.dev/v1/scrape', async () => {
        return HttpResponse.json({
            success: true,
            data: {
                markdown: `# Sample Research Paper
                
## Abstract
This paper presents a novel approach to machine learning...

## Limitations
- Limited dataset size
- High computational requirements
- Evaluation metrics may not capture all aspects

## Future Work
- Extend to multilingual settings
- Reduce inference costs
`,
                metadata: {
                    title: 'Sample Research Paper',
                    sourceURL: 'https://arxiv.org/abs/2024.00001'
                }
            }
        })
    }),

    // Mock Gemini API (analyze gaps)
    http.post('https://generativelanguage.googleapis.com/*', async ({ request }) => {
        const body = await request.json() as { contents?: string }
        const content = body.contents || ''

        // Return different responses based on prompt content
        if (content.includes('research gaps') || content.includes('limitations')) {
            return HttpResponse.json({
                candidates: [{
                    content: {
                        parts: [{
                            text: JSON.stringify(mockGaps)
                        }]
                    }
                }]
            })
        }

        if (content.includes('startup idea')) {
            return HttpResponse.json({
                candidates: [{
                    content: {
                        parts: [{
                            text: JSON.stringify(mockStartupIdea)
                        }]
                    }
                }]
            })
        }

        if (content.includes('research proposal')) {
            return HttpResponse.json({
                candidates: [{
                    content: {
                        parts: [{
                            text: JSON.stringify(mockResearchProposal)
                        }]
                    }
                }]
            })
        }

        // Default response
        return HttpResponse.json({
            candidates: [{
                content: {
                    parts: [{
                        text: 'This is a mock response from Gemini'
                    }]
                }
            }]
        })
    }),
]

// Export mock data for use in tests
export const mocks = {
    gaps: mockGaps,
    startupIdea: mockStartupIdea,
    researchProposal: mockResearchProposal,
}
