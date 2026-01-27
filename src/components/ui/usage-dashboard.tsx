// Usage Dashboard Component
// Displays current usage stats, quota progress, and subscription info

import { motion } from "framer-motion"
import {
    FileSearch,
    Zap,
    Download,
    Calendar,
    TrendingUp,
    AlertCircle,
    Crown,
    ArrowRight,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Button } from "./button"
import { Badge } from "./badge"
import { useSubscription } from "@/context/SubscriptionContext"

interface ProgressBarProps {
    value: number
    max: number
    label: string
    color: string
    icon: typeof FileSearch
}

function ProgressBar({ value, max, label, color, icon: Icon }: ProgressBarProps) {
    const percentage = max === -1 ? 0 : Math.min(100, Math.round((value / max) * 100))
    const isUnlimited = max === -1
    const isNearLimit = percentage >= 80 && !isUnlimited
    const isAtLimit = percentage >= 100 && !isUnlimited

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                    <span className="text-sm font-medium">{label}</span>
                </div>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {isUnlimited ? (
                        <span className="text-green-500">Unlimited</span>
                    ) : (
                        <>
                            {value.toLocaleString()} / {max.toLocaleString()}
                            {isNearLimit && (
                                <AlertCircle className="inline ml-1 h-3 w-3 text-yellow-500" />
                            )}
                        </>
                    )}
                </span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.5, ease: "easeOut" }}
                    className={`h-full rounded-full ${isAtLimit
                            ? "bg-red-500"
                            : isNearLimit
                                ? "bg-yellow-500"
                                : `bg-[${color}]`
                        }`}
                    style={{ backgroundColor: isAtLimit ? undefined : isNearLimit ? undefined : color }}
                />
            </div>
        </div>
    )
}

export function UsageDashboard() {
    const {
        subscription,
        usage,
        tier,
        tierName,
        limits,
        isLoading,
        triggerUpgrade,
    } = useSubscription()

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="animate-pulse space-y-4">
                        <div className="h-4 bg-[hsl(var(--muted))] rounded w-1/3" />
                        <div className="h-8 bg-[hsl(var(--muted))] rounded w-1/2" />
                        <div className="h-2 bg-[hsl(var(--muted))] rounded" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    const periodEnd = subscription?.currentPeriodEnd?.toDate()
    const daysRemaining = periodEnd
        ? Math.max(0, Math.ceil((periodEnd.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
        : 0

    const tierColors: Record<string, string> = {
        free: "hsl(var(--muted-foreground))",
        pro: "hsl(217, 91%, 60%)",
        team: "hsl(270, 91%, 65%)",
        enterprise: "hsl(45, 93%, 47%)",
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Usage Overview
                    </CardTitle>
                    <Badge
                        variant={tier === "free" ? "secondary" : "default"}
                        className="gap-1"
                    >
                        {tier !== "free" && <Crown className="h-3 w-3" />}
                        {tierName}
                    </Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Period Info */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-[hsl(var(--muted))]">
                    <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                        <span className="text-sm">
                            {daysRemaining} days until period reset
                        </span>
                    </div>
                    {periodEnd && (
                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                            Resets {periodEnd.toLocaleDateString()}
                        </span>
                    )}
                </div>

                {/* Usage Bars */}
                <div className="space-y-4">
                    <ProgressBar
                        value={usage?.papersProcessed || 0}
                        max={limits.papersPerMonth}
                        label="Papers Analyzed"
                        color={tierColors[tier]}
                        icon={FileSearch}
                    />
                    <ProgressBar
                        value={usage?.apiCalls || 0}
                        max={limits.apiAccess ? limits.papersPerMonth * 10 : 0}
                        label="API Calls"
                        color={tierColors[tier]}
                        icon={Zap}
                    />
                    <ProgressBar
                        value={usage?.exportCount || 0}
                        max={limits.papersPerMonth}
                        label="Exports"
                        color={tierColors[tier]}
                        icon={Download}
                    />
                </div>

                {/* Upgrade CTA for free users */}
                {tier === "free" && (
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="p-4 rounded-xl bg-gradient-to-r from-[hsl(var(--brand-primary))]/10 to-[hsl(var(--brand-secondary))]/10 border border-[hsl(var(--brand-primary))]/20"
                    >
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-semibold mb-1">Need more?</h4>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    Upgrade to Pro for unlimited papers and priority processing.
                                </p>
                            </div>
                            <Button
                                size="sm"
                                className="gap-1 shrink-0"
                                onClick={() => triggerUpgrade("Unlock more research power with Pro")}
                            >
                                Upgrade
                                <ArrowRight className="h-3 w-3" />
                            </Button>
                        </div>
                    </motion.div>
                )}

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[hsl(var(--border))]">
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {usage?.papersProcessed || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            Papers
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {usage?.gapsExtracted || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            Gaps Found
                        </div>
                    </div>
                    <div className="text-center">
                        <div className="text-2xl font-bold">
                            {usage?.exportCount || 0}
                        </div>
                        <div className="text-xs text-[hsl(var(--muted-foreground))]">
                            Exports
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Compact version for sidebar or header
export function UsageIndicator() {
    const { usage, limits, tier, triggerUpgrade } = useSubscription()
    const papersUsed = usage?.papersProcessed || 0
    const papersLimit = limits.papersPerMonth
    const percentage = papersLimit === -1 ? 0 : Math.min(100, Math.round((papersUsed / papersLimit) * 100))
    const isNearLimit = percentage >= 80

    if (tier !== "free") return null

    return (
        <button
            onClick={() => triggerUpgrade("Running low on paper credits")}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${isNearLimit
                    ? "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20"
                    : "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted-foreground))]/20"
                }`}
        >
            <FileSearch className="h-3 w-3" />
            {papersUsed}/{papersLimit} papers
            {isNearLimit && <AlertCircle className="h-3 w-3" />}
        </button>
    )
}
