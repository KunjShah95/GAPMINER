// API service for Firecrawl and Gemini integration
// Uses direct REST API calls for browser compatibility
import { GoogleGenAI } from "@google/genai"
import type { Gap } from "./firestore"

// Initialize Gemini
const genai = new GoogleGenAI({
    apiKey: import.meta.env.VITE_GEMINI_API_KEY || "",
})

// Types
export interface ScrapedContent {
    url: string
    title: string
    content: string
    venue?: string
}

export interface CrawlAnalysisResult {
    url: string
    title: string
    venue?: string
    content: string
    gaps: Gap[]
    status: "success" | "error"
    error?: string
}

// Scrape a URL using Firecrawl REST API directly
export async function scrapeUrl(url: string): Promise<ScrapedContent> {
    const apiKey = import.meta.env.VITE_FIRECRAWL_API_KEY

    if (!apiKey) {
        throw new Error("Firecrawl API key not configured. Please add VITE_FIRECRAWL_API_KEY to your .env file.")
    }

    try {
        const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${apiKey}`,
            },
            body: JSON.stringify({
                url,
                formats: ["markdown"],
            }),
        })

        if (!response.ok) {
            const error = await response.json().catch(() => ({}))
            throw new Error(error.message || `Firecrawl API error: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
            throw new Error(result.error || "Failed to scrape URL")
        }

        const data = result.data || {}
        // Extract title from metadata or markdown
        const title = data.metadata?.title || extractTitleFromContent(data.markdown || "") || url

        // Try to detect venue from URL or content
        const venue = detectVenue(url, data.markdown || "")

        return {
            url,
            title,
            content: data.markdown || "",
            venue,
        }
    } catch (error) {
        console.error("Firecrawl error:", error)
        throw error
    }
}

// Analyze content for research gaps using Gemini
export async function analyzeForGaps(content: string): Promise<Gap[]> {
    const apiKey = import.meta.env.VITE_GEMINI_API_KEY

    if (!apiKey) {
        throw new Error("Gemini API key not configured. Please add VITE_GEMINI_API_KEY to your .env file.")
    }

    try {
        const prompt = `You are a research gap analyst. Analyze the following academic paper content and identify research gaps, limitations, and unsolved problems mentioned or implied in the paper.

For each gap found, provide:
1. A clear description of the problem/limitation
2. The type of gap: "data" (data scarcity/quality issues), "compute" (computational limitations), "evaluation" (evaluation/benchmark issues), or "methodology" (methodological limitations)
3. A confidence score between 0 and 1

Return your response as a JSON array with objects containing: problem, type, confidence

Paper content:
${content.slice(0, 15000)}

Return ONLY valid JSON array, no markdown formatting or explanation.`

        const response = await genai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: prompt,
        })

        const text = response.text || ""

        // Parse JSON response
        const jsonMatch = text.match(/\[[\s\S]*\]/)
        if (!jsonMatch) {
            console.error("No JSON array found in response:", text)
            return []
        }

        const gaps: Array<{ problem: string; type: string; confidence: number }> = JSON.parse(jsonMatch[0])

        return gaps.map((gap, index) => ({
            id: `gap-${Date.now()}-${index}`,
            problem: gap.problem,
            type: gap.type as Gap["type"],
            confidence: Math.min(1, Math.max(0, gap.confidence)),
        }))
    } catch (error) {
        console.error("Gemini analysis error:", error)
        throw error
    }
}

// Combined crawl and analyze function
export async function crawlAndAnalyze(url: string): Promise<CrawlAnalysisResult> {
    try {
        // Step 1: Scrape the URL
        const scraped = await scrapeUrl(url)

        // Step 2: Analyze for gaps
        const gaps = await analyzeForGaps(scraped.content)

        return {
            url: scraped.url,
            title: scraped.title,
            venue: scraped.venue,
            content: scraped.content,
            gaps,
            status: "success",
        }
    } catch (error) {
        return {
            url,
            title: "Unknown Paper",
            content: "",
            gaps: [],
            status: "error",
            error: error instanceof Error ? error.message : "Unknown error occurred",
        }
    }
}

// Helper functions
function extractTitleFromContent(markdown: string): string | null {
    // Try to find H1 heading
    const h1Match = markdown.match(/^#\s+(.+)$/m)
    if (h1Match) return h1Match[1].trim()

    // Try to find first strong text
    const strongMatch = markdown.match(/\*\*(.+?)\*\*/)
    if (strongMatch) return strongMatch[1].trim()

    return null
}

function detectVenue(url: string, content: string): string | undefined {
    const urlLower = url.toLowerCase()
    const contentLower = content.toLowerCase()

    if (urlLower.includes("arxiv.org")) return "arXiv"
    if (urlLower.includes("openreview.net")) return "OpenReview"
    if (urlLower.includes("aclanthology.org")) return "ACL"
    if (urlLower.includes("neurips")) return "NeurIPS"
    if (urlLower.includes("icml")) return "ICML"
    if (urlLower.includes("iclr")) return "ICLR"
    if (urlLower.includes("aaai")) return "AAAI"
    if (urlLower.includes("cvpr")) return "CVPR"
    if (urlLower.includes("iccv")) return "ICCV"
    if (urlLower.includes("eccv")) return "ECCV"

    // Check content for conference mentions
    if (contentLower.includes("neurips")) return "NeurIPS"
    if (contentLower.includes("icml")) return "ICML"
    if (contentLower.includes("iclr")) return "ICLR"

    return undefined
}
