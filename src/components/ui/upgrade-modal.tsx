// Upgrade Modal Component
// Shows when users hit quota limits or want to upgrade

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    X,
    Check,
    Sparkles,
    Zap,
    Users,
    Crown,
    ArrowRight,
    Loader2,
} from "lucide-react"
import { Button } from "./button"
import { useSubscription } from "@/context/SubscriptionContext"
import { TIER_LIMITS, getTierDisplayName, getTierPrice, type SubscriptionTier } from "@/lib/subscription"

const tiers: { tier: SubscriptionTier; icon: typeof Sparkles; gradient: string }[] = [
    { tier: "free", icon: Sparkles, gradient: "from-gray-500 to-gray-600" },
    { tier: "pro", icon: Zap, gradient: "from-blue-500 to-cyan-500" },
    { tier: "team", icon: Users, gradient: "from-purple-500 to-pink-500" },
    { tier: "enterprise", icon: Crown, gradient: "from-yellow-500 to-orange-500" },
]

export function UpgradeModal() {
    const { showUpgradeModal, setShowUpgradeModal, upgradeReason, tier: currentTier } = useSubscription()
    const [selectedTier, setSelectedTier] = useState<SubscriptionTier>("pro")
    const [isProcessing, setIsProcessing] = useState(false)

    const handleUpgrade = async () => {
        setIsProcessing(true)

        // TODO: Integrate with Stripe/LemonSqueezy
        // For now, simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500))

        // Open payment link (LemonSqueezy example)
        const paymentLinks: Record<SubscriptionTier, string> = {
            free: "",
            pro: "https://gapminer.lemonsqueezy.com/checkout/buy/pro",
            team: "https://gapminer.lemonsqueezy.com/checkout/buy/team",
            enterprise: "mailto:enterprise@gapminer.com",
        }

        const link = paymentLinks[selectedTier]
        if (link) {
            if (selectedTier === "enterprise") {
                window.location.href = link
            } else {
                window.open(link, "_blank")
            }
        }

        setIsProcessing(false)
        setShowUpgradeModal(false)
    }

    if (!showUpgradeModal) return null

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                    onClick={() => setShowUpgradeModal(false)}
                />

                {/* Modal */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="relative z-10 w-full max-w-4xl mx-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl overflow-hidden"
                >
                    {/* Close button */}
                    <button
                        onClick={() => setShowUpgradeModal(false)}
                        className="absolute top-4 right-4 p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors z-10"
                    >
                        <X className="h-5 w-5" />
                    </button>

                    {/* Header */}
                    <div className="p-8 pb-4 text-center border-b border-[hsl(var(--border))]">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--brand-primary))]/10 text-[hsl(var(--brand-primary))] text-sm font-medium mb-4">
                            <Sparkles className="h-4 w-4" />
                            Upgrade Your Plan
                        </div>
                        <h2 className="text-2xl font-bold mb-2">
                            Unlock More Research Power
                        </h2>
                        {upgradeReason && (
                            <p className="text-[hsl(var(--muted-foreground))] max-w-lg mx-auto">
                                {upgradeReason}
                            </p>
                        )}
                    </div>

                    {/* Pricing Grid */}
                    <div className="p-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                        {tiers.slice(1).map(({ tier, icon: Icon, gradient }) => {
                            const limits = TIER_LIMITS[tier]
                            const isSelected = selectedTier === tier
                            const isCurrent = currentTier === tier
                            const price = getTierPrice(tier)
                            const name = getTierDisplayName(tier)

                            return (
                                <button
                                    key={tier}
                                    onClick={() => setSelectedTier(tier)}
                                    disabled={isCurrent}
                                    className={`relative p-6 rounded-xl border-2 transition-all text-left ${isSelected
                                            ? "border-[hsl(var(--brand-primary))] bg-[hsl(var(--brand-primary))]/5"
                                            : "border-[hsl(var(--border))] hover:border-[hsl(var(--muted-foreground))]/50"
                                        } ${isCurrent ? "opacity-50 cursor-not-allowed" : ""}`}
                                >
                                    {tier === "pro" && !isCurrent && (
                                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-[hsl(var(--brand-primary))] text-white text-xs font-medium">
                                            Most Popular
                                        </div>
                                    )}

                                    <div className={`inline-flex p-2 rounded-lg bg-gradient-to-br ${gradient} mb-4`}>
                                        <Icon className="h-5 w-5 text-white" />
                                    </div>

                                    <h3 className="text-lg font-bold mb-1">{name}</h3>
                                    <div className="flex items-baseline gap-1 mb-4">
                                        <span className="text-3xl font-bold">{price}</span>
                                        {tier !== "enterprise" && (
                                            <span className="text-[hsl(var(--muted-foreground))]">/mo</span>
                                        )}
                                    </div>

                                    <ul className="space-y-2 text-sm">
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {limits.papersPerMonth === -1 ? "Unlimited" : limits.papersPerMonth} papers/month
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {limits.teamMembers === -1 ? "Unlimited" : limits.teamMembers} team member{limits.teamMembers !== 1 ? "s" : ""}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {limits.apiAccess ? "API access" : "No API access"}
                                        </li>
                                        <li className="flex items-center gap-2">
                                            <Check className="h-4 w-4 text-green-500" />
                                            {limits.priorityProcessing ? "Priority" : "Standard"} processing
                                        </li>
                                    </ul>

                                    {isCurrent && (
                                        <div className="mt-4 text-sm text-[hsl(var(--muted-foreground))]">
                                            Current Plan
                                        </div>
                                    )}
                                </button>
                            )
                        })}
                    </div>

                    {/* Footer */}
                    <div className="p-6 border-t border-[hsl(var(--border))] flex items-center justify-between bg-[hsl(var(--muted))]/50">
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                            ✨ 14-day money-back guarantee • Cancel anytime
                        </p>
                        <Button
                            onClick={handleUpgrade}
                            disabled={isProcessing || selectedTier === currentTier}
                            className="gap-2"
                        >
                            {isProcessing ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                <>
                                    Upgrade to {getTierDisplayName(selectedTier)}
                                    <ArrowRight className="h-4 w-4" />
                                </>
                            )}
                        </Button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}
