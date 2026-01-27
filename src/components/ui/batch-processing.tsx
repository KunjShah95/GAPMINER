// Batch Processing Dashboard Component
// UI for managing batch AI jobs and viewing results

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Zap,
    Clock,
    CheckCircle2,
    XCircle,
    Loader2,
    FileSearch,
    Brain,
    TrendingUp,
    Network,
    ChevronRight,
    Sparkles,
    RefreshCw,
    Play,
    X,
} from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { useAuth } from "@/context/AuthContext"
import {
    getUserBatchJobs,
    createBatchJob,
    cancelBatchJob,
    type BatchJob,
    type AIInsight,
} from "@/lib/ai-pipeline"

interface BatchProcessingDashboardProps {
    onJobComplete?: (job: BatchJob) => void
}

export function BatchProcessingDashboard({ onJobComplete }: BatchProcessingDashboardProps) {
    const { user } = useAuth()
    const [jobs, setJobs] = useState<BatchJob[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [selectedJob, setSelectedJob] = useState<BatchJob | null>(null)

    useEffect(() => {
        if (user) {
            loadJobs()
            // Poll for updates
            const interval = setInterval(loadJobs, 5000)
            return () => clearInterval(interval)
        }
    }, [user])

    async function loadJobs() {
        if (!user) return
        try {
            const userJobs = await getUserBatchJobs(user.id)
            setJobs(userJobs)

            // Check for completed jobs
            const justCompleted = userJobs.find(
                j => j.status === "completed" &&
                    jobs.find(old => old.id === j.id && old.status === "processing")
            )
            if (justCompleted && onJobComplete) {
                onJobComplete(justCompleted)
            }
        } catch (error) {
            console.error("Failed to load jobs:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function handleCreateJob(type: BatchJob["type"], paperIds: string[]) {
        if (!user) return
        try {
            await createBatchJob(user.id, type, { paperIds })
            await loadJobs()
        } catch (error) {
            console.error("Failed to create job:", error)
        }
    }

    async function handleCancelJob(jobId: string) {
        try {
            await cancelBatchJob(jobId)
            await loadJobs()
        } catch (error) {
            console.error("Failed to cancel job:", error)
        }
    }

    const jobTypes = [
        { type: "gap_extraction" as const, label: "Gap Extraction", icon: FileSearch, color: "hsl(var(--brand-primary))" },
        { type: "summarization" as const, label: "Summarization", icon: Brain, color: "hsl(var(--brand-secondary))" },
        { type: "citation_analysis" as const, label: "Citation Analysis", icon: Network, color: "hsl(var(--gap-data))" },
        { type: "trend_analysis" as const, label: "Trend Analysis", icon: TrendingUp, color: "hsl(120, 60%, 50%)" },
    ]

    const getStatusIcon = (status: BatchJob["status"]) => {
        switch (status) {
            case "queued": return <Clock className="h-4 w-4 text-yellow-500" />
            case "processing": return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
            case "completed": return <CheckCircle2 className="h-4 w-4 text-green-500" />
            case "failed": return <XCircle className="h-4 w-4 text-red-500" />
        }
    }

    const getStatusBadge = (status: BatchJob["status"]) => {
        const styles: Record<string, string> = {
            queued: "bg-yellow-500/10 text-yellow-600",
            processing: "bg-blue-500/10 text-blue-600",
            completed: "bg-green-500/10 text-green-600",
            failed: "bg-red-500/10 text-red-600",
        }
        return styles[status]
    }

    if (isLoading) {
        return (
            <Card>
                <CardContent className="pt-6">
                    <div className="flex items-center justify-center py-8">
                        <Loader2 className="h-6 w-6 animate-spin text-[hsl(var(--brand-primary))]" />
                    </div>
                </CardContent>
            </Card>
        )
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Zap className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                        AI Processing Queue
                    </h2>
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Batch process papers with advanced AI analysis
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={loadJobs}>
                        <RefreshCw className="h-4 w-4" />
                    </Button>
                    <Button size="sm" onClick={() => { }} className="gap-2">
                        <Play className="h-4 w-4" />
                        New Job
                    </Button>
                </div>
            </div>

            {/* Job Types Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {jobTypes.map(({ type, label, icon: Icon, color }) => (
                    <button
                        key={type}
                        onClick={() => handleCreateJob(type, ["paper-1", "paper-2", "paper-3"])}
                        className="p-4 rounded-xl border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))] transition-colors text-left group"
                    >
                        <div
                            className="h-10 w-10 rounded-lg flex items-center justify-center mb-3 transition-colors"
                            style={{ backgroundColor: color + "20" }}
                        >
                            <Icon className="h-5 w-5" style={{ color }} />
                        </div>
                        <p className="font-medium text-sm">{label}</p>
                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                            Run on selected papers
                        </p>
                    </button>
                ))}
            </div>

            {/* Active Jobs */}
            <Card>
                <CardHeader className="pb-3">
                    <CardTitle className="text-base">Active Jobs</CardTitle>
                </CardHeader>
                <CardContent>
                    {jobs.length === 0 ? (
                        <div className="text-center py-8 text-[hsl(var(--muted-foreground))]">
                            <Sparkles className="h-10 w-10 mx-auto mb-3 opacity-50" />
                            <p>No active jobs</p>
                            <p className="text-sm">Start a new batch processing job above</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {jobs.map((job, idx) => (
                                <motion.div
                                    key={job.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="p-4 rounded-lg border border-[hsl(var(--border))] hover:border-[hsl(var(--brand-primary))]/50 transition-colors cursor-pointer"
                                    onClick={() => setSelectedJob(job)}
                                >
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="flex items-center gap-3">
                                            {getStatusIcon(job.status)}
                                            <div>
                                                <p className="font-medium text-sm capitalize">
                                                    {job.type.replace("_", " ")}
                                                </p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {job.totalItems} items
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <Badge className={getStatusBadge(job.status)}>
                                                {job.status}
                                            </Badge>
                                            {job.status === "processing" && (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleCancelJob(job.id!)
                                                    }}
                                                >
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            )}
                                            <ChevronRight className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                        </div>
                                    </div>
                                    {(job.status === "processing" || job.status === "queued") && (
                                        <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                                            <motion.div
                                                className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                                                initial={{ width: 0 }}
                                                animate={{ width: `${job.progress}%` }}
                                                transition={{ duration: 0.3 }}
                                            />
                                        </div>
                                    )}
                                    {job.status === "completed" && job.outputData?.insights && (
                                        <div className="flex gap-2 mt-2">
                                            {job.outputData.insights.slice(0, 2).map(insight => (
                                                <Badge key={insight.id} variant="secondary" className="text-xs">
                                                    {insight.type}: {insight.title.slice(0, 20)}...
                                                </Badge>
                                            ))}
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Job Details Modal */}
            <AnimatePresence>
                {selectedJob && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                            onClick={() => setSelectedJob(null)}
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            className="relative z-10 w-full max-w-2xl mx-4 bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-xl max-h-[80vh] overflow-hidden"
                        >
                            <div className="p-6 border-b border-[hsl(var(--border))]">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        {getStatusIcon(selectedJob.status)}
                                        <div>
                                            <h3 className="font-bold capitalize">
                                                {selectedJob.type.replace("_", " ")} Job
                                            </h3>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                Created {selectedJob.createdAt.toDate().toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedJob(null)}
                                        className="p-2 rounded-lg hover:bg-[hsl(var(--muted))] transition-colors"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>
                            <div className="p-6 overflow-y-auto max-h-[60vh]">
                                {/* Progress */}
                                <div className="mb-6">
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-sm font-medium">Progress</span>
                                        <span className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {selectedJob.completedItems}/{selectedJob.totalItems}
                                        </span>
                                    </div>
                                    <div className="h-3 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                                            style={{ width: `${selectedJob.progress}%` }}
                                        />
                                    </div>
                                </div>

                                {/* Insights */}
                                {selectedJob.outputData?.insights && (
                                    <div>
                                        <h4 className="font-medium mb-3 flex items-center gap-2">
                                            <Sparkles className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                                            AI Insights
                                        </h4>
                                        <div className="space-y-3">
                                            {selectedJob.outputData.insights.map((insight: AIInsight) => (
                                                <div
                                                    key={insight.id}
                                                    className="p-4 rounded-lg bg-[hsl(var(--muted))]"
                                                >
                                                    <div className="flex items-start justify-between mb-2">
                                                        <Badge variant="secondary" className="capitalize">
                                                            {insight.type}
                                                        </Badge>
                                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                            {Math.round(insight.confidence * 100)}% confidence
                                                        </span>
                                                    </div>
                                                    <h5 className="font-medium mb-1">{insight.title}</h5>
                                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                        {insight.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Error */}
                                {selectedJob.error && (
                                    <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-600">
                                        <p className="font-medium mb-1">Error</p>
                                        <p className="text-sm">{selectedJob.error}</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Compact job indicator for header/sidebar
export function BatchJobIndicator() {
    const { user } = useAuth()
    const [activeJobs, setActiveJobs] = useState(0)

    useEffect(() => {
        if (!user) return

        async function checkJobs() {
            const jobs = await getUserBatchJobs(user!.id)
            setActiveJobs(jobs.filter(j => j.status === "processing" || j.status === "queued").length)
        }

        checkJobs()
        const interval = setInterval(checkJobs, 10000)
        return () => clearInterval(interval)
    }, [user])

    if (activeJobs === 0) return null

    return (
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-500/10 text-blue-600 text-xs font-medium">
            <Loader2 className="h-3 w-3 animate-spin" />
            {activeJobs} job{activeJobs > 1 ? "s" : ""} running
        </div>
    )
}
