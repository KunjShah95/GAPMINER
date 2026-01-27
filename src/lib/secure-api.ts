// Secure API client for frontend
// Uses backend proxy to keep API keys secure

const API_BASE = import.meta.env.PROD ? '/api' : import.meta.env.VITE_API_URL || '/api'

class ApiError extends Error {
    statusCode: number

    constructor(message: string, statusCode: number = 500) {
        super(message)
        this.name = 'ApiError'
        this.statusCode = statusCode
    }
}

/**
 * Make a secure API request through the backend proxy
 */
async function secureApiRequest<T>(
    action: string,
    payload: Record<string, unknown> = {}
): Promise<T> {
    const response = await fetch(`${API_BASE}/gemini`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action, ...payload }),
    })

    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Request failed' }))
        throw new ApiError(errorData.error || 'Request failed', response.status)
    }

    return response.json()
}

// ============================================================================
// Secure API Functions
// ============================================================================

/**
 * Analyze paper content for research gaps (secure)
 */
export async function secureAnalyzeGaps(content: string) {
    return secureApiRequest<{ gaps: Array<Record<string, unknown>> }>('analyze-gaps', { content })
}

/**
 * Explain why a problem remains unsolved (secure)
 */
export async function secureExplainUnsolved(problem: string) {
    return secureApiRequest<{ explanation: string }>('explain-unsolved', { prompt: problem })
}

/**
 * Generate startup idea from research gap (secure)
 */
export async function secureGenerateStartupIdea(problem: string) {
    return secureApiRequest<{ idea: string; audience: string; why_now: string }>(
        'generate-startup-idea',
        { prompt: problem }
    )
}

/**
 * Generate research questions (secure)
 */
export async function secureGenerateResearchQuestions(problem: string) {
    return secureApiRequest<{ questions: string[] }>('generate-research-questions', { prompt: problem })
}

/**
 * Compare multiple papers (secure)
 */
export async function secureComparePapers(papers: Array<{ title: string; content: string }>) {
    return secureApiRequest<{ comparison: string }>('compare-papers', { papers })
}

/**
 * Chat with paper context (secure)
 */
export async function secureChatWithPapers(
    query: string,
    papers: Array<{ title: string; content: string }>,
    history: Array<{ role: string; content: string }>
) {
    return secureApiRequest<{ response: string }>('chat', { prompt: query, papers, history })
}

// ============================================================================
// Feature Detection
// ============================================================================

/**
 * Check if secure API is available (backend deployed)
 */
export async function isSecureApiAvailable(): Promise<boolean> {
    try {
        const response = await fetch(`${API_BASE}/gemini`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ action: 'health-check' }),
        })
        return response.ok || response.status === 400 // 400 means API is responding but action unknown
    } catch {
        return false
    }
}

export { ApiError }
