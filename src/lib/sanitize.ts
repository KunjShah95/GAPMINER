// Input sanitization utilities
import DOMPurify from 'isomorphic-dompurify'

// ============================================================================
// Content Sanitization
// ============================================================================

/**
 * Sanitize HTML content to prevent XSS attacks
 */
export function sanitizeHtml(html: string): string {
    return DOMPurify.sanitize(html, {
        ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'p', 'br', 'ul', 'ol', 'li', 'code', 'pre'],
        ALLOWED_ATTR: [],
    })
}

/**
 * Sanitize text content - strips all HTML
 */
export function sanitizeText(text: string): string {
    return DOMPurify.sanitize(text, { ALLOWED_TAGS: [] })
}

/**
 * Sanitize markdown content - allows safe markdown but strips scripts
 */
export function sanitizeMarkdown(markdown: string): string {
    // Remove potential script injections in markdown
    return markdown
        .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
        .replace(/javascript:/gi, '')
        .replace(/on\w+\s*=/gi, '')
}

// ============================================================================
// Content Length Limits
// ============================================================================

const LIMITS = {
    URL_MAX_LENGTH: 2048,
    CONTENT_MAX_LENGTH: 100000,  // 100KB for paper content
    PROMPT_MAX_LENGTH: 50000,    // 50KB for prompts to LLM
    QUERY_MAX_LENGTH: 1000,      // 1KB for search queries
    TITLE_MAX_LENGTH: 500,
} as const

export type LimitType = keyof typeof LIMITS

/**
 * Check if content exceeds length limit
 */
export function exceedsLimit(content: string, limitType: LimitType): boolean {
    return content.length > LIMITS[limitType]
}

/**
 * Truncate content to fit within limit
 */
export function truncateToLimit(content: string, limitType: LimitType): string {
    const limit = LIMITS[limitType]
    if (content.length <= limit) return content
    return content.slice(0, limit - 3) + '...'
}

/**
 * Get limit value for a type
 */
export function getLimit(limitType: LimitType): number {
    return LIMITS[limitType]
}

// ============================================================================
// URL Sanitization
// ============================================================================

/**
 * Sanitize and validate a URL
 */
export function sanitizeUrl(url: string): string | null {
    try {
        // Trim and normalize
        const trimmed = url.trim()

        // Check length
        if (exceedsLimit(trimmed, 'URL_MAX_LENGTH')) {
            return null
        }

        // Parse and reconstruct to remove any injection attempts
        const parsed = new URL(trimmed)

        // Only allow http and https
        if (!['http:', 'https:'].includes(parsed.protocol)) {
            return null
        }

        return parsed.toString()
    } catch {
        return null
    }
}

/**
 * Sanitize multiple URLs
 */
export function sanitizeUrls(urls: string[]): { valid: string[]; invalid: string[] } {
    const valid: string[] = []
    const invalid: string[] = []

    for (const url of urls) {
        const sanitized = sanitizeUrl(url)
        if (sanitized) {
            valid.push(sanitized)
        } else {
            invalid.push(url)
        }
    }

    return { valid, invalid }
}

// ============================================================================
// Input Validation
// ============================================================================

/**
 * Validate and sanitize user input before sending to LLM
 */
export function sanitizePromptInput(input: string): string {
    // Remove potential prompt injection patterns
    let sanitized = input
        .replace(/\[\s*SYSTEM\s*\]/gi, '[INPUT]')
        .replace(/\[\s*ASSISTANT\s*\]/gi, '[INPUT]')
        .replace(/\[\s*USER\s*\]/gi, '[INPUT]')
        .replace(/```.*?```/gs, (match) => {
            // Preserve code blocks but sanitize them
            return match.replace(/[<>]/g, '')
        })

    // Truncate if too long
    sanitized = truncateToLimit(sanitized, 'PROMPT_MAX_LENGTH')

    return sanitized
}

/**
 * Validate search query input
 */
export function sanitizeSearchQuery(query: string): string {
    const sanitized = sanitizeText(query.trim())
    return truncateToLimit(sanitized, 'QUERY_MAX_LENGTH')
}

// ============================================================================
// Rate Limiting Helper
// ============================================================================

interface RateLimitState {
    count: number
    resetTime: number
}

const rateLimitStates = new Map<string, RateLimitState>()

/**
 * Check if action is rate limited
 */
export function isRateLimited(
    key: string,
    maxRequests: number = 10,
    windowMs: number = 60000
): boolean {
    const now = Date.now()
    const state = rateLimitStates.get(key)

    if (!state || now > state.resetTime) {
        rateLimitStates.set(key, { count: 1, resetTime: now + windowMs })
        return false
    }

    if (state.count >= maxRequests) {
        return true
    }

    state.count++
    return false
}

/**
 * Reset rate limit for a key
 */
export function resetRateLimit(key: string): void {
    rateLimitStates.delete(key)
}
