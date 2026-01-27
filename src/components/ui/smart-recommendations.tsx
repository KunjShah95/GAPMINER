// Smart Recommendations Component
// Displays AI-powered research recommendations with actions

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Lightbulb,
    FileSearch,
    TrendingUp,
    Beaker,
    ChevronRight,
    RefreshCw,
    ThumbsUp,
    ThumbsDown,
    Sparkles,
} from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { useAuth } from "@/context/AuthContext"
import {
    getUserRecommendations,
    dismissRecommendation,
    actionRecommendation,
    generateRecommendations,
    type SmartRecommendation,
} from "@/lib/ai-pipeline"

export function SmartRecommendations() {
    const { user } = useAuth()
    const [recommendations, setRecommendations] = useState<SmartRecommendation[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isGenerating, setIsGenerating] = useState(false)

    useEffect(() => {
        if (user) {
            loadRecommendations()
        }
    }, [user])

    async function loadRecommendations() {
        if (!user) return
        try {
            const recs = await getUserRecommendations(user.id)
            setRecommendations(recs)
        } catch (error) {
            console.error("Failed to load recommendations:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleGenerate() {
        if (!user) return
        setIsGenerating(true)
        try {
            const newRecs = await generateRecommendations(user.id, [], [])
            setRecommendations(prev => [...newRecs, ...prev])
        } catch (error) {
            console.error("Failed to generate recommendations:", error)
        } finally {
            setIsGenerating(false)
        }
    }

    async function handleDismiss(recId: string) {
        try {
            await dismissRecommendation(recId)
            setRecommendations(prev => prev.filter(r => r.id !== recId))
        } catch (error) {
            console.error("Failed to dismiss:", error)
        }
    }

    async function handleAction(recId: string) {
        try {
            await actionRecommendation(recId)
            setRecommendations(prev => prev.filter(r => r.id !== recId))
        } catch (error) {
            console.error("Failed to action:", error)
        }
    }

    const typeIcons: Record<string, typeof Lightbulb> = {
        paper: FileSearch,
        gap: Lightbulb,
        topic: TrendingUp,
        methodology: Beaker,
    }

    const typeColors: Record<string, string> = {
        paper: "hsl(var(--brand-primary))",
        gap: "hsl(45, 93%, 47%)",
        topic: "hsl(120, 60%, 50%)",
        methodology: "hsl(var(--brand-secondary))",
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <div className="animate-pulse flex space-x-4">
                            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))]" />
                            <div className="space-y-2">
                                <div className="h-4 w-32 rounded bg-[hsl(var(--muted))]" />
                                <div className="h-3 w-48 rounded bg-[hsl(var(--muted))]" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                        Smart Recommendations
                    </CardTitle>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleGenerate}
                        disabled={isGenerating}
                        className="gap-2"
                    >
                        {isGenerating ? (
                            <RefreshCw className="h-4 w-4 animate-spin" />
                        ) : (
                            <RefreshCw className="h-4 w-4" />
                        )}
                        Refresh
                    </Button>
                </div>
            </CardHeader>
            <CardContent>
                {recommendations.length === 0 ? (
                    <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                        <Lightbulb className="h-10 w-10 mx-auto mb-3 opacity-50" />
                        <p className="mb-4">No recommendations yet</p>
                        <Button onClick={handleGenerate} disabled={isGenerating}>
                            Generate Recommendations
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-3">
                        <AnimatePresence mode="popLayout">
                            {recommendations.map((rec, idx) => {
                                const Icon = typeIcons[rec.type] || Lightbulb
                                const color = typeColors[rec.type] || "hsl(var(--brand-primary))"
                                return (
                                    <motion.div
                                        key={rec.id}
                                        layout
                                        initial={{ opacity: 0, x: -20 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 20 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))]/50 transition-colors"
                                    >
                                        <div className="flex items-start gap-4">
                                            <div
                                                className="h-10 w-10 rounded-lg flex items-center justify-center shrink-0"
                                                style={{ backgroundColor: color + "20" }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color }} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="flex items-start justify-between gap-2 mb-1">
                                                    <h4 className="font-medium">{rec.title}</h4>
                                                    <Badge
                                                        variant="secondary"
                                                        className="shrink-0 text-xs"
                                                    >
                                                        {Math.round(rec.score * 100)}% match
                                                    </Badge>
                                                </div>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))] mb-2">
                                                    {rec.description}
                                                </p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))] italic">
                                                    {rec.reasoning}
                                                </p>
                                                <div className="flex items-center gap-2 mt-3">
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAction(rec.id!)}
                                                        className="gap-1"
                                                    >
                                                        <ThumbsUp className="h-3 w-3" />
                                                        Explore
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleDismiss(rec.id!)}
                                                        className="gap-1 text-[hsl(var(--muted-foreground))]"
                                                    >
                                                        <ThumbsDown className="h-3 w-3" />
                                                        Dismiss
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    </motion.div>
                                )
                            })}
                        </AnimatePresence>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// Compact recommendation card for sidebar
export function RecommendationCard({ recommendation }: { recommendation: SmartRecommendation }) {
    const Icon = {
        paper: FileSearch,
        gap: Lightbulb,
        topic: TrendingUp,
        methodology: Beaker,
    }[recommendation.type] || Lightbulb

    return (
        <div className="p-3 rounded-lg bg-gradient-to-r from-[hsl(var(--brand-primary))]/5 to-[hsl(var(--brand-secondary))]/5 border border-[hsl(var(--brand-primary))]/10">
            <div className="flex items-center gap-2 mb-2">
                <Icon className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                <span className="text-xs font-medium uppercase text-[hsl(var(--brand-primary))]">
                    {recommendation.type} suggestion
                </span>
            </div>
            <p className="text-sm font-medium mb-1">{recommendation.title}</p>
            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2">
                {recommendation.description}
            </p>
            <Button variant="ghost" size="sm" className="mt-2 w-full justify-between text-xs">
                View details
                <ChevronRight className="h-3 w-3" />
            </Button>
        </div>
    )
}
