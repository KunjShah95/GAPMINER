// Subscription and Usage Service for GapMiner SaaS
// Manages user subscriptions, usage tracking, and quota enforcement

import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    increment,
} from "firebase/firestore"
import { db } from "./firebase"

// SUBSCRIPTION TIERS
export type SubscriptionTier = "free" | "pro" | "team" | "enterprise"

export interface TierLimits {
    papersPerMonth: number
    gapsPerPaper: number
    collectionsLimit: number
    teamMembers: number
    apiAccess: boolean
    priorityProcessing: boolean
    exportFormats: string[]
    historyRetention: number // days
}

export const TIER_LIMITS: Record<SubscriptionTier, TierLimits> = {
    free: {
        papersPerMonth: 50,
        gapsPerPaper: 10,
        collectionsLimit: 5,
        teamMembers: 1,
        apiAccess: false,
        priorityProcessing: false,
        exportFormats: ["csv"],
        historyRetention: 30,
    },
    pro: {
        papersPerMonth: 500,
        gapsPerPaper: 50,
        collectionsLimit: 50,
        teamMembers: 1,
        apiAccess: true,
        priorityProcessing: true,
        exportFormats: ["csv", "json", "pdf"],
        historyRetention: 365,
    },
    team: {
        papersPerMonth: 2000,
        gapsPerPaper: 100,
        collectionsLimit: 200,
        teamMembers: 10,
        apiAccess: true,
        priorityProcessing: true,
        exportFormats: ["csv", "json", "pdf", "markdown"],
        historyRetention: 730,
    },
    enterprise: {
        papersPerMonth: -1, // unlimited
        gapsPerPaper: -1, // unlimited
        collectionsLimit: -1, // unlimited
        teamMembers: -1, // unlimited
        apiAccess: true,
        priorityProcessing: true,
        exportFormats: ["csv", "json", "pdf", "markdown", "api"],
        historyRetention: -1, // unlimited
    },
}

// SUBSCRIPTION TYPES
export interface Subscription {
    id?: string
    userId: string
    tier: SubscriptionTier
    status: "active" | "canceled" | "past_due" | "trialing"
    trialEndsAt?: Timestamp
    currentPeriodStart: Timestamp
    currentPeriodEnd: Timestamp
    cancelAtPeriodEnd: boolean
    paymentProvider?: "stripe" | "lemonsqueezy"
    externalSubscriptionId?: string
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface UsageRecord {
    id?: string
    userId: string
    periodStart: Timestamp
    periodEnd: Timestamp
    papersProcessed: number
    gapsExtracted: number
    apiCalls: number
    exportCount: number
    lastUpdated: Timestamp
}

export interface UsageEvent {
    id?: string
    userId: string
    eventType: "paper_crawl" | "gap_extract" | "api_call" | "export" | "assistant_query"
    resourceId?: string
    metadata?: Record<string, any>
    createdAt: Timestamp
}

// Collection references
const SUBSCRIPTIONS = "subscriptions"
const USAGE_RECORDS = "usageRecords"
const USAGE_EVENTS = "usageEvents"

// SUBSCRIPTION MANAGEMENT

export async function createSubscription(
    userId: string,
    tier: SubscriptionTier = "free",
    trialDays: number = 14
): Promise<string> {
    const now = Timestamp.now()
    const trialEnd = new Date()
    trialEnd.setDate(trialEnd.getDate() + trialDays)

    const periodEnd = new Date()
    periodEnd.setMonth(periodEnd.getMonth() + 1)

    const subscription: Omit<Subscription, "id"> = {
        userId,
        tier,
        status: tier === "free" ? "active" : "trialing",
        trialEndsAt: tier !== "free" ? Timestamp.fromDate(trialEnd) : undefined,
        currentPeriodStart: now,
        currentPeriodEnd: Timestamp.fromDate(periodEnd),
        cancelAtPeriodEnd: false,
        createdAt: now,
        updatedAt: now,
    }

    const docRef = await addDoc(collection(db, SUBSCRIPTIONS), subscription)

    // Initialize usage record for this period
    await initializeUsageRecord(userId, now, Timestamp.fromDate(periodEnd))

    return docRef.id
}

export async function getSubscription(userId: string): Promise<Subscription | null> {
    const q = query(
        collection(db, SUBSCRIPTIONS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as Subscription
}

export async function updateSubscription(
    userId: string,
    updates: Partial<Subscription>
): Promise<void> {
    const subscription = await getSubscription(userId)
    if (!subscription?.id) throw new Error("No subscription found")

    await updateDoc(doc(db, SUBSCRIPTIONS, subscription.id), {
        ...updates,
        updatedAt: Timestamp.now(),
    })
}

export async function upgradeSubscription(
    userId: string,
    newTier: SubscriptionTier,
    paymentProvider: "stripe" | "lemonsqueezy",
    externalId: string
): Promise<void> {
    await updateSubscription(userId, {
        tier: newTier,
        status: "active",
        paymentProvider,
        externalSubscriptionId: externalId,
    })
}

export async function cancelSubscription(userId: string): Promise<void> {
    await updateSubscription(userId, {
        cancelAtPeriodEnd: true,
    })
}

// USAGE TRACKING

async function initializeUsageRecord(
    userId: string,
    periodStart: Timestamp,
    periodEnd: Timestamp
): Promise<string> {
    const usage: Omit<UsageRecord, "id"> = {
        userId,
        periodStart,
        periodEnd,
        papersProcessed: 0,
        gapsExtracted: 0,
        apiCalls: 0,
        exportCount: 0,
        lastUpdated: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, USAGE_RECORDS), usage)
    return docRef.id
}

export async function getCurrentUsage(userId: string): Promise<UsageRecord | null> {
    const now = Timestamp.now()
    const q = query(
        collection(db, USAGE_RECORDS),
        where("userId", "==", userId),
        where("periodEnd", ">", now),
        orderBy("periodEnd", "desc")
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const doc = snapshot.docs[0]
    return { id: doc.id, ...doc.data() } as UsageRecord
}

export async function incrementUsage(
    userId: string,
    field: keyof Pick<UsageRecord, "papersProcessed" | "gapsExtracted" | "apiCalls" | "exportCount">,
    amount: number = 1
): Promise<void> {
    const usage = await getCurrentUsage(userId)
    if (!usage?.id) {
        // Create new usage record if none exists
        const subscription = await getSubscription(userId)
        if (subscription) {
            await initializeUsageRecord(
                userId,
                subscription.currentPeriodStart,
                subscription.currentPeriodEnd
            )
        }
        return
    }

    await updateDoc(doc(db, USAGE_RECORDS, usage.id), {
        [field]: increment(amount),
        lastUpdated: Timestamp.now(),
    })
}

export async function logUsageEvent(
    userId: string,
    eventType: UsageEvent["eventType"],
    resourceId?: string,
    metadata?: Record<string, any>
): Promise<void> {
    const event: Omit<UsageEvent, "id"> = {
        userId,
        eventType,
        resourceId,
        metadata,
        createdAt: Timestamp.now(),
    }

    await addDoc(collection(db, USAGE_EVENTS), event)

    // Increment appropriate counter
    switch (eventType) {
        case "paper_crawl":
            await incrementUsage(userId, "papersProcessed")
            break
        case "api_call":
            await incrementUsage(userId, "apiCalls")
            break
        case "export":
            await incrementUsage(userId, "exportCount")
            break
    }
}

// QUOTA ENFORCEMENT

export interface QuotaCheck {
    allowed: boolean
    remaining: number
    limit: number
    resetDate: Date
    upgradeRequired: boolean
}

export async function checkQuota(
    userId: string,
    resource: "papers" | "gaps" | "collections" | "api"
): Promise<QuotaCheck> {
    const subscription = await getSubscription(userId)
    const tier = subscription?.tier || "free"
    const limits = TIER_LIMITS[tier]
    const usage = await getCurrentUsage(userId)

    let current = 0
    let limit = 0

    switch (resource) {
        case "papers":
            current = usage?.papersProcessed || 0
            limit = limits.papersPerMonth
            break
        case "gaps":
            current = usage?.gapsExtracted || 0
            limit = limits.gapsPerPaper * (usage?.papersProcessed || 0)
            break
        case "api":
            current = usage?.apiCalls || 0
            limit = limits.apiAccess ? -1 : 0
            break
        case "collections":
            // This would need a separate count query
            limit = limits.collectionsLimit
            break
    }

    const isUnlimited = limit === -1
    const allowed = isUnlimited || current < limit
    const remaining = isUnlimited ? -1 : Math.max(0, limit - current)
    const resetDate = subscription?.currentPeriodEnd?.toDate() || new Date()

    return {
        allowed,
        remaining,
        limit,
        resetDate,
        upgradeRequired: !allowed && tier !== "enterprise",
    }
}

// USAGE ANALYTICS

export interface UsageAnalytics {
    currentPeriod: UsageRecord | null
    subscription: Subscription | null
    limits: TierLimits
    quotaPercentages: {
        papers: number
        apiCalls: number
        exports: number
    }
}

export async function getUserAnalytics(userId: string): Promise<UsageAnalytics> {
    const [subscription, usage] = await Promise.all([
        getSubscription(userId),
        getCurrentUsage(userId),
    ])

    const tier = subscription?.tier || "free"
    const limits = TIER_LIMITS[tier]

    const calcPercentage = (current: number, limit: number) => {
        if (limit === -1) return 0 // unlimited
        if (limit === 0) return 100
        return Math.min(100, Math.round((current / limit) * 100))
    }

    return {
        currentPeriod: usage,
        subscription,
        limits,
        quotaPercentages: {
            papers: calcPercentage(usage?.papersProcessed || 0, limits.papersPerMonth),
            apiCalls: calcPercentage(usage?.apiCalls || 0, limits.papersPerMonth * 10),
            exports: calcPercentage(usage?.exportCount || 0, limits.papersPerMonth),
        },
    }
}

// HOOKS FOR COMPONENTS

export function getTierDisplayName(tier: SubscriptionTier): string {
    const names: Record<SubscriptionTier, string> = {
        free: "Starter",
        pro: "Pro",
        team: "Team",
        enterprise: "Enterprise",
    }
    return names[tier]
}

export function getTierPrice(tier: SubscriptionTier): string {
    const prices: Record<SubscriptionTier, string> = {
        free: "$0",
        pro: "$29",
        team: "$99",
        enterprise: "Custom",
    }
    return prices[tier]
}
