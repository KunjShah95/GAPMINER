// React Context for Subscription State Management
// Provides subscription data and quota checking throughout the app

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import {
    getSubscription,
    getCurrentUsage,
    checkQuota,
    createSubscription,
    type Subscription,
    type UsageRecord,
    type SubscriptionTier,
    type QuotaCheck,
    TIER_LIMITS,
    getTierDisplayName,
} from "@/lib/subscription"

interface SubscriptionContextType {
    subscription: Subscription | null
    usage: UsageRecord | null
    isLoading: boolean
    tier: SubscriptionTier
    tierName: string
    limits: typeof TIER_LIMITS.free

    // Quota checking
    checkPaperQuota: () => Promise<QuotaCheck>
    checkApiQuota: () => Promise<QuotaCheck>

    // State refresh
    refreshSubscription: () => Promise<void>
    refreshUsage: () => Promise<void>

    // Upgrade modal
    showUpgradeModal: boolean
    setShowUpgradeModal: (show: boolean) => void
    upgradeReason: string
    triggerUpgrade: (reason: string) => void
}

const SubscriptionContext = createContext<SubscriptionContextType | undefined>(undefined)

export function SubscriptionProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth()
    const [subscription, setSubscription] = useState<Subscription | null>(null)
    const [usage, setUsage] = useState<UsageRecord | null>(null)
    const [isLoading, setIsLoading] = useState(true)
    const [showUpgradeModal, setShowUpgradeModal] = useState(false)
    const [upgradeReason, setUpgradeReason] = useState("")

    // Derived state
    const tier = subscription?.tier || "free"
    const limits = TIER_LIMITS[tier]
    const tierName = getTierDisplayName(tier)

    // Load subscription data
    const loadSubscriptionData = useCallback(async () => {
        if (!user) {
            setSubscription(null)
            setUsage(null)
            setIsLoading(false)
            return
        }

        try {
            let sub = await getSubscription(user.id)

            // Create subscription if it doesn't exist
            if (!sub) {
                await createSubscription(user.id, "free")
                sub = await getSubscription(user.id)
            }

            const usageData = await getCurrentUsage(user.id)

            setSubscription(sub)
            setUsage(usageData)
        } catch (error) {
            console.error("Failed to load subscription:", error)
        } finally {
            setIsLoading(false)
        }
    }, [user])

    useEffect(() => {
        if (isAuthenticated) {
            loadSubscriptionData()
        } else {
            setSubscription(null)
            setUsage(null)
            setIsLoading(false)
        }
    }, [isAuthenticated, loadSubscriptionData])

    // Quota checking functions
    const checkPaperQuota = useCallback(async (): Promise<QuotaCheck> => {
        if (!user) {
            return {
                allowed: false,
                remaining: 0,
                limit: 0,
                resetDate: new Date(),
                upgradeRequired: true,
            }
        }
        return checkQuota(user.id, "papers")
    }, [user])

    const checkApiQuota = useCallback(async (): Promise<QuotaCheck> => {
        if (!user) {
            return {
                allowed: false,
                remaining: 0,
                limit: 0,
                resetDate: new Date(),
                upgradeRequired: true,
            }
        }
        return checkQuota(user.id, "api")
    }, [user])

    // Refresh functions
    const refreshSubscription = useCallback(async () => {
        if (!user) return
        const sub = await getSubscription(user.id)
        setSubscription(sub)
    }, [user])

    const refreshUsage = useCallback(async () => {
        if (!user) return
        const usageData = await getCurrentUsage(user.id)
        setUsage(usageData)
    }, [user])

    // Trigger upgrade modal
    const triggerUpgrade = useCallback((reason: string) => {
        setUpgradeReason(reason)
        setShowUpgradeModal(true)
    }, [])

    return (
        <SubscriptionContext.Provider
            value={{
                subscription,
                usage,
                isLoading,
                tier,
                tierName,
                limits,
                checkPaperQuota,
                checkApiQuota,
                refreshSubscription,
                refreshUsage,
                showUpgradeModal,
                setShowUpgradeModal,
                upgradeReason,
                triggerUpgrade,
            }}
        >
            {children}
        </SubscriptionContext.Provider>
    )
}

export function useSubscription() {
    const context = useContext(SubscriptionContext)
    if (context === undefined) {
        throw new Error("useSubscription must be used within a SubscriptionProvider")
    }
    return context
}

// Hook for quota-gated actions
export function useQuotaGate() {
    const { checkPaperQuota, triggerUpgrade, refreshUsage } = useSubscription()

    const withPaperQuota = useCallback(
        async (action: () => Promise<unknown>): Promise<unknown | null> => {
            const quota = await checkPaperQuota()

            if (!quota.allowed) {
                triggerUpgrade(
                    `You've reached your monthly limit of ${quota.limit} papers. Upgrade to continue analyzing papers.`
                )
                return null
            }

            const result = await action()
            await refreshUsage()
            return result
        },
        [checkPaperQuota, triggerUpgrade, refreshUsage]
    )

    return { withPaperQuota }
}

