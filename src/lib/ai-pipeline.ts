// Enhanced AI Pipeline Service for GapMiner
// Handles batch processing, smart recommendations, and advanced AI features

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit,
} from "firebase/firestore"
import { db } from "./firebase"
import { logUsageEvent } from "./subscription"

// ============================================
// TYPES
// ============================================

export type ProcessingStatus = "queued" | "processing" | "completed" | "failed"

export interface BatchJob {
    id?: string
    userId: string
    teamId?: string
    type: "gap_extraction" | "summarization" | "citation_analysis" | "trend_analysis"
    status: ProcessingStatus
    progress: number
    totalItems: number
    completedItems: number
    failedItems: number
    inputData: BatchInput
    outputData?: BatchOutput
    error?: string
    priority: "low" | "normal" | "high"
    createdAt: Timestamp
    startedAt?: Timestamp
    completedAt?: Timestamp
}

export interface BatchInput {
    paperIds?: string[]
    searchQuery?: string
    collectionId?: string
    options?: Record<string, any>
}

export interface BatchOutput {
    results: any[]
    summary?: string
    insights?: AIInsight[]
}

export interface AIInsight {
    id: string
    type: "gap" | "trend" | "recommendation" | "connection"
    title: string
    description: string
    confidence: number
    relatedPapers: string[]
    metadata?: Record<string, any>
}

export interface SmartRecommendation {
    id?: string
    userId: string
    type: "paper" | "gap" | "topic" | "methodology"
    title: string
    description: string
    score: number
    reasoning: string
    dismissed: boolean
    actionedAt?: Timestamp
    createdAt: Timestamp
}

export interface TrendPrediction {
    id?: string
    topic: string
    currentInterest: number
    predictedGrowth: number
    confidence: number
    timeframe: "3m" | "6m" | "1y"
    supportingEvidence: string[]
    createdAt: Timestamp
}

// Collection references
const BATCH_JOBS = "batchJobs"
const RECOMMENDATIONS = "recommendations"

// ============================================
// BATCH PROCESSING
// ============================================

export async function createBatchJob(
    userId: string,
    type: BatchJob["type"],
    inputData: BatchInput,
    priority: BatchJob["priority"] = "normal",
    teamId?: string
): Promise<string> {
    const job: Omit<BatchJob, "id"> = {
        userId,
        teamId,
        type,
        status: "queued",
        progress: 0,
        totalItems: inputData.paperIds?.length || 0,
        completedItems: 0,
        failedItems: 0,
        inputData,
        priority,
        createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, BATCH_JOBS), job)

    // Log usage event
    await logUsageEvent(userId, "paper_crawl", docRef.id, {
        type,
        itemCount: job.totalItems,
        priority
    })

    // In a real implementation, this would trigger a Cloud Function or queue
    // For now, we simulate starting the job
    setTimeout(() => processJob(docRef.id), 100)

    return docRef.id
}

export async function getBatchJob(jobId: string): Promise<BatchJob | null> {
    const docRef = doc(db, BATCH_JOBS, jobId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as BatchJob
}

export async function getUserBatchJobs(
    userId: string,
    limitCount: number = 20
): Promise<BatchJob[]> {
    const q = query(
        collection(db, BATCH_JOBS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as BatchJob))
}

export async function cancelBatchJob(jobId: string): Promise<void> {
    await updateDoc(doc(db, BATCH_JOBS, jobId), {
        status: "failed",
        error: "Cancelled by user",
    })
}

// Simulated job processing (would be Cloud Function in production)
async function processJob(jobId: string): Promise<void> {
    const job = await getBatchJob(jobId)
    if (!job || job.status !== "queued") return

    await updateDoc(doc(db, BATCH_JOBS, jobId), {
        status: "processing",
        startedAt: Timestamp.now(),
    })

    // Simulate processing with progress updates
    const totalItems = job.totalItems || 10
    for (let i = 1; i <= totalItems; i++) {
        await new Promise(resolve => setTimeout(resolve, 500))

        const progress = Math.round((i / totalItems) * 100)
        await updateDoc(doc(db, BATCH_JOBS, jobId), {
            progress,
            completedItems: i,
        })
    }

    // Generate mock results
    const results = generateMockResults(job.type, totalItems)

    await updateDoc(doc(db, BATCH_JOBS, jobId), {
        status: "completed",
        progress: 100,
        completedAt: Timestamp.now(),
        outputData: {
            results,
            summary: `Processed ${totalItems} items successfully`,
            insights: generateMockInsights(job.type),
        },
    })
}

function generateMockResults(type: BatchJob["type"], count: number): any[] {
    const results = []
    for (let i = 0; i < count; i++) {
        switch (type) {
            case "gap_extraction":
                results.push({
                    paperId: `paper-${i}`,
                    gaps: [
                        { id: `gap-${i}-1`, title: "Methodology gap", severity: Math.random() },
                        { id: `gap-${i}-2`, title: "Data limitation", severity: Math.random() },
                    ],
                })
                break
            case "summarization":
                results.push({
                    paperId: `paper-${i}`,
                    summary: "AI-generated summary of the paper's key findings and contributions...",
                    keyPoints: ["Point 1", "Point 2", "Point 3"],
                })
                break
            case "citation_analysis":
                results.push({
                    paperId: `paper-${i}`,
                    citationCount: Math.floor(Math.random() * 100),
                    influenceScore: Math.random(),
                    connectedPapers: [`paper-${i + 1}`, `paper-${i + 2}`],
                })
                break
            case "trend_analysis":
                results.push({
                    topic: `Topic ${i}`,
                    growth: Math.random() * 2 - 0.5,
                    papers: Math.floor(Math.random() * 1000),
                })
                break
        }
    }
    return results
}

function generateMockInsights(_type: BatchJob["type"]): AIInsight[] {
    return [
        {
            id: "insight-1",
            type: "gap",
            title: "Cross-domain methodology opportunity",
            description: "Multiple papers could benefit from applying techniques from adjacent fields.",
            confidence: 0.85,
            relatedPapers: ["paper-1", "paper-5", "paper-8"],
        },
        {
            id: "insight-2",
            type: "trend",
            title: "Emerging research direction",
            description: "There's growing interest in this methodology with 40% increase in publications.",
            confidence: 0.72,
            relatedPapers: ["paper-2", "paper-3"],
        },
        {
            id: "insight-3",
            type: "connection",
            title: "Unexplored connection",
            description: "These papers share similar limitations but haven't been connected in literature.",
            confidence: 0.68,
            relatedPapers: ["paper-4", "paper-6", "paper-9"],
        },
    ]
}

// ============================================
// SMART RECOMMENDATIONS
// ============================================

export async function generateRecommendations(
    userId: string,
    _recentPaperIds: string[],
    _recentGapIds: string[]
): Promise<SmartRecommendation[]> {
    // In production, this would call an ML model
    const recommendations: SmartRecommendation[] = [
        {
            userId,
            type: "paper",
            title: "Related Research Paper",
            description: "Based on your recent gap analysis, this paper addresses similar methodological concerns.",
            score: 0.92,
            reasoning: "High semantic similarity with your analyzed papers. Shares 3 key citations.",
            dismissed: false,
            createdAt: Timestamp.now(),
        },
        {
            userId,
            type: "gap",
            title: "Potential Research Gap",
            description: "We identified a potential gap in the literature based on your research interests.",
            score: 0.85,
            reasoning: "Cross-referencing multiple papers reveals this unexplored area.",
            dismissed: false,
            createdAt: Timestamp.now(),
        },
        {
            userId,
            type: "topic",
            title: "Trending Topic Suggestion",
            description: "This topic is gaining momentum and aligns with your research focus.",
            score: 0.78,
            reasoning: "25% increase in publications over the last 6 months in this area.",
            dismissed: false,
            createdAt: Timestamp.now(),
        },
    ]

    // Save recommendations
    for (const rec of recommendations) {
        await addDoc(collection(db, RECOMMENDATIONS), rec)
    }

    return recommendations
}

export async function getUserRecommendations(
    userId: string,
    includeDiscissed: boolean = false
): Promise<SmartRecommendation[]> {
    let q = query(
        collection(db, RECOMMENDATIONS),
        where("userId", "==", userId),
        orderBy("score", "desc"),
        limit(20)
    )

    if (!includeDiscissed) {
        q = query(
            collection(db, RECOMMENDATIONS),
            where("userId", "==", userId),
            where("dismissed", "==", false),
            orderBy("score", "desc"),
            limit(20)
        )
    }

    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SmartRecommendation))
}

export async function dismissRecommendation(recId: string): Promise<void> {
    await updateDoc(doc(db, RECOMMENDATIONS, recId), {
        dismissed: true,
    })
}

export async function actionRecommendation(recId: string): Promise<void> {
    await updateDoc(doc(db, RECOMMENDATIONS, recId), {
        actionedAt: Timestamp.now(),
    })
}

// ============================================
// TREND PREDICTIONS
// ============================================

export async function getTrendPredictions(
    _topics?: string[],
    timeframe: TrendPrediction["timeframe"] = "6m"
): Promise<TrendPrediction[]> {
    // In production, this would query an ML-generated table
    const mockTrends: TrendPrediction[] = [
        {
            topic: "Large Language Models in Research",
            currentInterest: 95,
            predictedGrowth: 0.35,
            confidence: 0.88,
            timeframe,
            supportingEvidence: [
                "40% increase in papers mentioning LLMs",
                "Major funding announcements",
                "New benchmark datasets released",
            ],
            createdAt: Timestamp.now(),
        },
        {
            topic: "Federated Learning",
            currentInterest: 72,
            predictedGrowth: 0.28,
            confidence: 0.82,
            timeframe,
            supportingEvidence: [
                "Growing privacy concerns",
                "Healthcare applications expanding",
            ],
            createdAt: Timestamp.now(),
        },
        {
            topic: "Explainable AI",
            currentInterest: 68,
            predictedGrowth: 0.22,
            confidence: 0.79,
            timeframe,
            supportingEvidence: [
                "Regulatory requirements increasing",
                "Industry adoption barriers",
            ],
            createdAt: Timestamp.now(),
        },
    ]

    return mockTrends
}

// ============================================
// TEXT ANALYSIS UTILITIES
// ============================================

export function extractKeyPhrases(text: string, maxPhrases: number = 5): string[] {
    // Simple keyword extraction (would use NLP library in production)
    const words = text.toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 4)

    const frequency: Record<string, number> = {}
    words.forEach(w => {
        frequency[w] = (frequency[w] || 0) + 1
    })

    return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])
        .slice(0, maxPhrases)
        .map(([word]) => word)
}

export function calculateSimilarity(text1: string, text2: string): number {
    // Simple Jaccard similarity (would use embeddings in production)
    const words1 = new Set(text1.toLowerCase().split(/\s+/))
    const words2 = new Set(text2.toLowerCase().split(/\s+/))

    const intersection = new Set([...words1].filter(x => words2.has(x)))
    const union = new Set([...words1, ...words2])

    return intersection.size / union.size
}

export function summarizeText(text: string, maxLength: number = 200): string {
    // Simple extractive summarization (would use LLM in production)
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)

    if (sentences.length === 0) return text

    // Take first and most "important" sentences
    const summary = sentences.slice(0, 3).join(". ").trim()

    if (summary.length <= maxLength) return summary + "."
    return summary.substring(0, maxLength - 3) + "..."
}
