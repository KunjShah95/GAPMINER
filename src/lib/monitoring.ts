// Error Tracking and Monitoring Service
// Centralized error handling, logging, and performance monitoring

import { Timestamp, collection, addDoc } from "firebase/firestore"
import { db } from "./firebase"

// ============================================
// TYPES
// ============================================

export type ErrorSeverity = "low" | "medium" | "high" | "critical"
export type ErrorCategory = "api" | "ui" | "auth" | "network" | "validation" | "unknown"

export interface ErrorLog {
    id?: string
    message: string
    stack?: string
    severity: ErrorSeverity
    category: ErrorCategory
    userId?: string
    sessionId: string
    url: string
    userAgent: string
    metadata?: Record<string, any>
    timestamp: Timestamp
}

export interface PerformanceMetric {
    id?: string
    name: string
    value: number
    unit: "ms" | "bytes" | "count" | "percent"
    category: "navigation" | "resource" | "api" | "render"
    userId?: string
    sessionId: string
    url: string
    timestamp: Timestamp
}

// ============================================
// SESSION & CONFIG
// ============================================

let sessionId = ""
let currentUserId: string | null = null
let isInitialized = false

function getSessionId(): string {
    if (!sessionId) {
        sessionId = `session_${Date.now()}_${Math.random().toString(36).slice(2)}`
    }
    return sessionId
}

export function initErrorTracking(userId?: string) {
    if (isInitialized) return

    currentUserId = userId || null
    isInitialized = true

    // Global error handler
    window.onerror = (message, source, lineno, colno, error) => {
        trackError({
            message: String(message),
            stack: error?.stack,
            severity: "high",
            category: "unknown",
            metadata: { source, lineno, colno },
        })
        return false
    }

    // Unhandled promise rejections
    window.onunhandledrejection = (event) => {
        trackError({
            message: event.reason?.message || "Unhandled promise rejection",
            stack: event.reason?.stack,
            severity: "high",
            category: "unknown",
            metadata: { reason: String(event.reason) },
        })
    }

    // Performance observer
    if ("PerformanceObserver" in window) {
        try {
            const observer = new PerformanceObserver((list) => {
                for (const entry of list.getEntries()) {
                    if (entry.entryType === "navigation") {
                        const navEntry = entry as PerformanceNavigationTiming
                        trackPerformance("page_load", navEntry.loadEventEnd - navEntry.startTime, "ms", "navigation")
                        trackPerformance("dom_interactive", navEntry.domInteractive - navEntry.startTime, "ms", "navigation")
                        trackPerformance("first_byte", navEntry.responseStart - navEntry.requestStart, "ms", "navigation")
                    }
                    if (entry.entryType === "largest-contentful-paint") {
                        trackPerformance("lcp", entry.startTime, "ms", "render")
                    }
                }
            })
            observer.observe({ entryTypes: ["navigation", "largest-contentful-paint"] })
        } catch (e) {
            console.warn("Performance observer not supported:", e)
        }
    }

    console.log("[ErrorTracking] Initialized with session:", getSessionId())
}

export function setTrackingUser(userId: string | null) {
    currentUserId = userId
}

// ============================================
// ERROR TRACKING
// ============================================

interface TrackErrorOptions {
    message: string
    stack?: string
    severity?: ErrorSeverity
    category?: ErrorCategory
    metadata?: Record<string, any>
}

export async function trackError(options: TrackErrorOptions): Promise<void> {
    const {
        message,
        stack,
        severity = "medium",
        category = "unknown",
        metadata,
    } = options

    const errorLog: Omit<ErrorLog, "id"> = {
        message,
        stack,
        severity,
        category,
        userId: currentUserId || undefined,
        sessionId: getSessionId(),
        url: window.location.href,
        userAgent: navigator.userAgent,
        metadata,
        timestamp: Timestamp.now(),
    }

    // Log to console in development
    if (import.meta.env.DEV) {
        console.error("[Error Tracked]", errorLog)
    }

    // Send to Firestore
    try {
        await addDoc(collection(db, "errorLogs"), errorLog)
    } catch (e) {
        console.error("Failed to log error:", e)
    }
}

// Convenience methods
export function trackAPIError(message: string, metadata?: Record<string, any>) {
    trackError({ message, category: "api", severity: "medium", metadata })
}

export function trackUIError(message: string, metadata?: Record<string, any>) {
    trackError({ message, category: "ui", severity: "low", metadata })
}

export function trackAuthError(message: string, metadata?: Record<string, any>) {
    trackError({ message, category: "auth", severity: "high", metadata })
}

export function trackNetworkError(message: string, metadata?: Record<string, any>) {
    trackError({ message, category: "network", severity: "medium", metadata })
}

// ============================================
// PERFORMANCE TRACKING
// ============================================

export async function trackPerformance(
    name: string,
    value: number,
    unit: PerformanceMetric["unit"],
    category: PerformanceMetric["category"]
): Promise<void> {
    const metric: Omit<PerformanceMetric, "id"> = {
        name,
        value: Math.round(value * 100) / 100,
        unit,
        category,
        userId: currentUserId || undefined,
        sessionId: getSessionId(),
        url: window.location.href,
        timestamp: Timestamp.now(),
    }

    if (import.meta.env.DEV) {
        console.log("[Performance]", `${name}: ${value}${unit}`)
    }

    try {
        await addDoc(collection(db, "performanceMetrics"), metric)
    } catch (e) {
        // Silently fail for perf metrics
    }
}

// API timing helper
export function createAPITimer(endpoint: string) {
    const start = performance.now()
    return {
        end: (success: boolean = true) => {
            const duration = performance.now() - start
            trackPerformance(`api_${endpoint}`, duration, "ms", "api")
            if (!success) {
                trackPerformance(`api_${endpoint}_failed`, duration, "ms", "api")
            }
        },
    }
}

// ============================================
// USER FEEDBACK
// ============================================

export interface UserFeedback {
    type: "bug" | "feature" | "improvement" | "other"
    message: string
    email?: string
    screenshot?: string
    metadata?: Record<string, any>
}

export async function submitFeedback(feedback: UserFeedback): Promise<boolean> {
    try {
        await addDoc(collection(db, "userFeedback"), {
            ...feedback,
            userId: currentUserId,
            sessionId: getSessionId(),
            url: window.location.href,
            timestamp: Timestamp.now(),
        })
        return true
    } catch (e) {
        console.error("Failed to submit feedback:", e)
        return false
    }
}

// ============================================
// CACHING LAYER
// ============================================

interface CacheEntry<T> {
    data: T
    timestamp: number
    ttl: number
}

class CacheManager {
    private cache = new Map<string, CacheEntry<any>>()
    private storage: Storage | null = null

    constructor() {
        try {
            this.storage = window.localStorage
            this.loadFromStorage()
        } catch {
            this.storage = null
        }
    }

    private loadFromStorage() {
        if (!this.storage) return
        try {
            const keys = Object.keys(this.storage).filter(k => k.startsWith("cache_"))
            for (const key of keys) {
                const data = this.storage.getItem(key)
                if (data) {
                    const entry = JSON.parse(data) as CacheEntry<any>
                    if (this.isValid(entry)) {
                        this.cache.set(key.replace("cache_", ""), entry)
                    } else {
                        this.storage.removeItem(key)
                    }
                }
            }
        } catch {
            // Ignore storage errors
        }
    }

    private isValid(entry: CacheEntry<any>): boolean {
        return Date.now() - entry.timestamp < entry.ttl
    }

    get<T>(key: string): T | null {
        const entry = this.cache.get(key)
        if (entry && this.isValid(entry)) {
            return entry.data as T
        }
        this.cache.delete(key)
        return null
    }

    set<T>(key: string, data: T, ttlMs: number = 5 * 60 * 1000): void {
        const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            ttl: ttlMs,
        }
        this.cache.set(key, entry)

        if (this.storage) {
            try {
                this.storage.setItem(`cache_${key}`, JSON.stringify(entry))
            } catch {
                // Storage full, clear old entries
                this.clearExpired()
            }
        }
    }

    delete(key: string): void {
        this.cache.delete(key)
        this.storage?.removeItem(`cache_${key}`)
    }

    clearExpired(): void {
        for (const [key, entry] of this.cache.entries()) {
            if (!this.isValid(entry)) {
                this.delete(key)
            }
        }
    }

    clearAll(): void {
        this.cache.clear()
        if (this.storage) {
            const keys = Object.keys(this.storage).filter(k => k.startsWith("cache_"))
            for (const key of keys) {
                this.storage.removeItem(key)
            }
        }
    }
}

export const cache = new CacheManager()

// Cached fetch helper
export async function cachedFetch<T>(
    key: string,
    fetcher: () => Promise<T>,
    ttlMs: number = 5 * 60 * 1000
): Promise<T> {
    const cached = cache.get<T>(key)
    if (cached !== null) {
        return cached
    }

    const timer = createAPITimer(key)
    try {
        const data = await fetcher()
        cache.set(key, data, ttlMs)
        timer.end(true)
        return data
    } catch (error) {
        timer.end(false)
        throw error
    }
}
