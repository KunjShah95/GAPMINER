// Vercel Edge Function - Secure API Proxy for Gemini
// This keeps API keys on the server side, not exposed to browser

import { GoogleGenAI } from '@google/genai'

export const config = {
    runtime: 'edge',
}

// Initialize Gemini with server-side API key
const genai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY || '',
})

interface RequestBody {
    action: string
    content?: string
    prompt?: string
    papers?: Array<{ title: string; content: string }>
    history?: Array<{ role: string; content: string }>
}

export default async function handler(request: Request) {
    // Only allow POST requests
    if (request.method !== 'POST') {
        return new Response(JSON.stringify({ error: 'Method not allowed' }), {
            status: 405,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    // Validate API key is configured
    if (!process.env.GEMINI_API_KEY) {
        return new Response(JSON.stringify({ error: 'API key not configured' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }

    try {
        const body: RequestBody = await request.json()
        const { action, content, prompt, papers, history } = body

        let result: unknown

        switch (action) {
            case 'analyze-gaps':
                result = await analyzeGaps(content || '')
                break

            case 'explain-unsolved':
                result = await explainUnsolved(prompt || '')
                break

            case 'generate-startup-idea':
                result = await generateStartupIdea(prompt || '')
                break

            case 'generate-research-questions':
                result = await generateResearchQuestions(prompt || '')
                break

            case 'compare-papers':
                result = await comparePapers(papers || [])
                break

            case 'chat':
                result = await chatWithPapers(prompt || '', papers || [], history || [])
                break

            default:
                return new Response(JSON.stringify({ error: 'Unknown action' }), {
                    status: 400,
                    headers: { 'Content-Type': 'application/json' },
                })
        }

        return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })
    } catch (error) {
        console.error('API Error:', error)
        return new Response(
            JSON.stringify({
                error: error instanceof Error ? error.message : 'Internal server error',
            }),
            {
                status: 500,
                headers: { 'Content-Type': 'application/json' },
            }
        )
    }
}

// ============================================================================
// API Functions (Server-side)
// ============================================================================

async function analyzeGaps(content: string) {
    if (!content.trim()) {
        return { gaps: [] }
    }

    const prompt = `You are an expert researcher analyzing academic papers.
    
Analyze the following paper content and extract ALL research gaps, limitations, and unsolved problems:

${content.slice(0, 50000)}

Return a JSON array of gaps with this structure:
[
  {
    "problem": "Description of the gap or limitation",
    "type": "data" | "compute" | "evaluation" | "theory" | "deployment" | "methodology",
    "confidence": 0.0-1.0,
    "impactScore": "low" | "medium" | "high",
    "difficulty": "low" | "medium" | "high",
    "assumptions": ["assumption 1", ...],
    "failures": ["previous failure or failed approach", ...],
    "datasetGaps": ["missing dataset or benchmark", ...],
    "evaluationCritique": "critique of evaluation methodology if applicable"
  }
]

Return ONLY the JSON array, no additional text.`

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
        return { gaps: [] }
    }

    try {
        const gaps = JSON.parse(jsonMatch[0])
        return {
            gaps: gaps.map((gap: Record<string, unknown>, index: number) => ({
                id: `gap-${Date.now()}-${index}`,
                ...gap,
            })),
        }
    } catch {
        return { gaps: [] }
    }
}

async function explainUnsolved(problem: string) {
    const prompt = `Research Problem: "${problem}"

Explain in detail why this problem remains unsolved in the research community.
Consider:
1. Technical challenges
2. Resource constraints
3. Fundamental limitations
4. Historical context

Provide a comprehensive explanation (2-3 paragraphs).`

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    })

    return { explanation: response.text || '' }
}

async function generateStartupIdea(problem: string) {
    const prompt = `Research Gap: "${problem}"

Convert this research gap into a viable startup idea. Return JSON:
{
  "idea": "Startup name and one-line pitch",
  "audience": "Target market/users",
  "why_now": "Why this is the right time for this solution"
}

Return ONLY JSON.`

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\{[\s\S]*\}/)

    if (!jsonMatch) {
        throw new Error('Failed to parse response')
    }

    return JSON.parse(jsonMatch[0])
}

async function generateResearchQuestions(problem: string) {
    const prompt = `Research Gap: "${problem}"

Generate 5 specific, answerable research questions that could help address this gap.
Return a JSON array of strings.

Return ONLY the JSON array.`

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    })

    const text = response.text || ''
    const jsonMatch = text.match(/\[[\s\S]*\]/)

    if (!jsonMatch) {
        return { questions: [] }
    }

    return { questions: JSON.parse(jsonMatch[0]) }
}

async function comparePapers(papers: Array<{ title: string; content: string }>) {
    if (papers.length < 2) {
        throw new Error('Need at least 2 papers to compare')
    }

    const prompt = `Compare these research papers:

Paper 1: ${papers[0].title}
${papers[0].content.slice(0, 10000)}

Paper 2: ${papers[1].title}
${papers[1].content.slice(0, 10000)}

Provide a comparison covering:
1. Research approach differences
2. Complementary findings
3. Contradictions
4. Combined opportunities

Be specific and insightful.`

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents: prompt,
    })

    return { comparison: response.text || '' }
}

async function chatWithPapers(
    query: string,
    papers: Array<{ title: string; content: string }>,
    history: Array<{ role: string; content: string }>
) {
    const paperContext = papers
        .map((p, i) => `Paper ${i + 1}: ${p.title}\n${p.content.slice(0, 5000)}`)
        .join('\n\n---\n\n')

    const systemInstruction = `You are a research assistant with access to the user's paper library.
Use the following papers as context for answering questions:

${paperContext}

Answer questions based on these papers. Be precise and cite specific papers when relevant.`

    const contents = [
        ...history.map((m) => ({
            role: m.role === 'assistant' ? ('model' as const) : ('user' as const),
            parts: [{ text: m.content }],
        })),
        {
            role: 'user' as const,
            parts: [{ text: `${systemInstruction}\n\nUser Query: ${query}` }],
        },
    ]

    const response = await genai.models.generateContent({
        model: 'gemini-2.0-flash',
        contents,
    })

    return { response: response.text || '' }
}
