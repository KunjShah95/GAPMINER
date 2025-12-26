import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    FileSearch,
    Loader2,
    CheckCircle2,
    XCircle,
    ChevronDown,
    ChevronRight,
    ExternalLink,
    AlertCircle,
    Copy,
    Check,
    Save
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { crawlAndAnalyze } from "@/lib/api"
import { saveCrawlResult, type Gap } from "@/lib/firestore"
import { useAuth } from "@/context/AuthContext"

interface PaperResult {
    url: string
    title: string
    venue?: string
    status: "pending" | "crawling" | "analyzing" | "success" | "error"
    error?: string
    gaps: Gap[]
    content?: string
}

export function CrawlPage() {
    const { user } = useAuth()
    const [urls, setUrls] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)
    const [progress, setProgress] = useState(0)
    const [results, setResults] = useState<PaperResult[]>([])
    const [expandedPapers, setExpandedPapers] = useState<Set<string>>(new Set())
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [savingId, setSavingId] = useState<string | null>(null)
    const [savedIds, setSavedIds] = useState<Set<string>>(new Set())

    const handleCrawl = async () => {
        const urlList = urls
            .split("\n")
            .map((u) => u.trim())
            .filter((u) => u.length > 0)

        if (urlList.length === 0) return

        setIsProcessing(true)
        setProgress(0)
        setResults([])
        setSavedIds(new Set())

        // Initialize all papers as pending
        const initialResults: PaperResult[] = urlList.map((url) => ({
            url,
            title: "Loading...",
            status: "pending",
            gaps: [],
        }))
        setResults(initialResults)

        // Process each URL using real API
        for (let i = 0; i < urlList.length; i++) {
            const url = urlList[i]

            // Update status to crawling
            setResults((prev) =>
                prev.map((r, idx) =>
                    idx === i ? { ...r, status: "crawling" } : r
                )
            )

            try {
                // Call real Firecrawl + Gemini API
                const result = await crawlAndAnalyze(url)

                if (result.status === "success") {
                    setResults((prev) =>
                        prev.map((r, idx) =>
                            idx === i
                                ? {
                                    ...r,
                                    status: "success",
                                    title: result.title,
                                    venue: result.venue,
                                    gaps: result.gaps,
                                    content: result.content,
                                }
                                : r
                        )
                    )
                } else {
                    setResults((prev) =>
                        prev.map((r, idx) =>
                            idx === i
                                ? {
                                    ...r,
                                    status: "error",
                                    error: result.error || "Failed to process paper",
                                }
                                : r
                        )
                    )
                }
            } catch (error) {
                setResults((prev) =>
                    prev.map((r, idx) =>
                        idx === i
                            ? {
                                ...r,
                                status: "error",
                                error: error instanceof Error ? error.message : "Unknown error",
                            }
                            : r
                    )
                )
            }

            setProgress(((i + 1) / urlList.length) * 100)
        }

        setIsProcessing(false)
        // Expand all successful papers
        setExpandedPapers(new Set(urlList))
    }

    const togglePaper = (url: string) => {
        setExpandedPapers((prev) => {
            const next = new Set(prev)
            if (next.has(url)) {
                next.delete(url)
            } else {
                next.add(url)
            }
            return next
        })
    }

    const copyToClipboard = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    const handleSaveResult = async (paper: PaperResult) => {
        if (!user || savedIds.has(paper.url)) return

        setSavingId(paper.url)
        try {
            await saveCrawlResult({
                userId: user.id,
                url: paper.url,
                title: paper.title,
                venue: paper.venue,
                content: paper.content || "",
                gaps: paper.gaps,
            })
            setSavedIds((prev) => new Set(prev).add(paper.url))
        } catch (error) {
            console.error("Failed to save result:", error)
        } finally {
            setSavingId(null)
        }
    }

    const totalGaps = results.reduce((acc, r) => acc + r.gaps.length, 0)
    const successCount = results.filter((r) => r.status === "success").length

    return (
        <div className="min-h-screen py-12">
            <div className="container-wide">
                {/* Header */}
                <div className="mb-12">
                    <div className="section-number mb-4">BATCH CRAWL</div>
                    <h1 className="heading-section mb-4">
                        Extract Research Gaps
                        <br />
                        <span className="gradient-text">from Multiple Papers</span>
                    </h1>
                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
                        Paste your paper URLs below (one per line) and we'll automatically
                        extract unsolved problems and limitations from each paper using AI.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Input Section */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileSearch className="h-5 w-5" />
                                    Paper URLs
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <Textarea
                                    placeholder={`https://arxiv.org/abs/2403.XXXX
https://openreview.net/forum?id=XXXX
https://aclanthology.org/...`}
                                    value={urls}
                                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setUrls(e.target.value)}
                                    className="min-h-[200px]"
                                    disabled={isProcessing}
                                />
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        {urls.split("\n").filter((u) => u.trim()).length} URL(s) entered
                                    </p>
                                    <Button
                                        onClick={handleCrawl}
                                        disabled={isProcessing || !urls.trim()}
                                        className="gap-2"
                                    >
                                        {isProcessing ? (
                                            <>
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                                Processing...
                                            </>
                                        ) : (
                                            <>
                                                <FileSearch className="h-4 w-4" />
                                                Batch Crawl Papers
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Progress */}
                        {isProcessing && (
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-sm">
                                            <span>Processing papers...</span>
                                            <span className="font-medium">
                                                {Math.round(progress)}%
                                            </span>
                                        </div>
                                        <Progress value={progress} />
                                        <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                            Crawling content with Firecrawl, analyzing gaps with Gemini AI...
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        )}

                        {/* Stats */}
                        {results.length > 0 && !isProcessing && (
                            <div className="grid grid-cols-3 gap-4">
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold">{results.length}</div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            Papers
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-green-500">
                                            {successCount}
                                        </div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            Successful
                                        </div>
                                    </CardContent>
                                </Card>
                                <Card>
                                    <CardContent className="pt-6 text-center">
                                        <div className="text-3xl font-bold text-[hsl(var(--brand-primary))]">
                                            {totalGaps}
                                        </div>
                                        <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                            Gaps Found
                                        </div>
                                    </CardContent>
                                </Card>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    <div className="space-y-4">
                        <h2 className="font-semibold text-lg">Results</h2>

                        {results.length === 0 ? (
                            <Card className="border-dashed">
                                <CardContent className="py-12 text-center">
                                    <FileSearch className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-50" />
                                    <p className="text-[hsl(var(--muted-foreground))]">
                                        Results will appear here after crawling
                                    </p>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                                <AnimatePresence>
                                    {results.map((paper, idx) => (
                                        <motion.div
                                            key={paper.url}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                        >
                                            <Card
                                                className={cn(
                                                    "transition-all",
                                                    paper.status === "success" && "border-green-500/30",
                                                    paper.status === "error" && "border-red-500/30",
                                                    (paper.status === "crawling" || paper.status === "analyzing") && "border-blue-500/30"
                                                )}
                                            >
                                                <CardContent className="pt-4">
                                                    {/* Paper Header */}
                                                    <div
                                                        className="flex items-start gap-3 cursor-pointer"
                                                        onClick={() => paper.status === "success" && togglePaper(paper.url)}
                                                    >
                                                        {/* Status Icon */}
                                                        <div className="mt-1">
                                                            {paper.status === "pending" && (
                                                                <div className="h-5 w-5 rounded-full border-2 border-[hsl(var(--muted-foreground))]" />
                                                            )}
                                                            {(paper.status === "crawling" || paper.status === "analyzing") && (
                                                                <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                                                            )}
                                                            {paper.status === "success" && (
                                                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                                                            )}
                                                            {paper.status === "error" && (
                                                                <XCircle className="h-5 w-5 text-red-500" />
                                                            )}
                                                        </div>

                                                        {/* Paper Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center gap-2">
                                                                <h3 className="font-medium truncate">
                                                                    {paper.title}
                                                                </h3>
                                                                {paper.venue && (
                                                                    <Badge variant="secondary" className="shrink-0">
                                                                        {paper.venue}
                                                                    </Badge>
                                                                )}
                                                            </div>
                                                            <a
                                                                href={paper.url}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="text-xs text-[hsl(var(--muted-foreground))] hover:underline flex items-center gap-1 mt-1"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                {paper.url.slice(0, 50)}...
                                                                <ExternalLink className="h-3 w-3" />
                                                            </a>
                                                            {paper.error && (
                                                                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                                                                    <AlertCircle className="h-3 w-3" />
                                                                    {paper.error}
                                                                </p>
                                                            )}
                                                        </div>

                                                        {/* Actions */}
                                                        <div className="flex items-center gap-2">
                                                            {paper.status === "success" && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleSaveResult(paper)
                                                                    }}
                                                                    disabled={savingId === paper.url || savedIds.has(paper.url)}
                                                                    title={savedIds.has(paper.url) ? "Saved" : "Save to Firestore"}
                                                                >
                                                                    {savingId === paper.url ? (
                                                                        <Loader2 className="h-4 w-4 animate-spin" />
                                                                    ) : savedIds.has(paper.url) ? (
                                                                        <Check className="h-4 w-4 text-green-500" />
                                                                    ) : (
                                                                        <Save className="h-4 w-4" />
                                                                    )}
                                                                </Button>
                                                            )}
                                                            {paper.status === "success" && paper.gaps.length > 0 && (
                                                                <>
                                                                    <Badge variant="outline">
                                                                        {paper.gaps.length} gap{paper.gaps.length !== 1 ? "s" : ""}
                                                                    </Badge>
                                                                    {expandedPapers.has(paper.url) ? (
                                                                        <ChevronDown className="h-4 w-4" />
                                                                    ) : (
                                                                        <ChevronRight className="h-4 w-4" />
                                                                    )}
                                                                </>
                                                            )}
                                                        </div>
                                                    </div>

                                                    {/* Gaps List */}
                                                    <AnimatePresence>
                                                        {expandedPapers.has(paper.url) && paper.gaps.length > 0 && (
                                                            <motion.div
                                                                initial={{ height: 0, opacity: 0 }}
                                                                animate={{ height: "auto", opacity: 1 }}
                                                                exit={{ height: 0, opacity: 0 }}
                                                                className="overflow-hidden"
                                                            >
                                                                <div className="mt-4 space-y-3 pl-8 border-l-2 border-[hsl(var(--border))]">
                                                                    {paper.gaps.map((gap) => (
                                                                        <div
                                                                            key={gap.id}
                                                                            className="p-3 rounded-lg bg-[hsl(var(--muted))] relative group"
                                                                        >
                                                                            <div className="flex items-start justify-between gap-2">
                                                                                <div>
                                                                                    <div className="flex items-center gap-2 mb-2">
                                                                                        <Badge
                                                                                            variant={gap.type as "data" | "compute" | "evaluation" | "methodology"}
                                                                                        >
                                                                                            {gap.type}
                                                                                        </Badge>
                                                                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                                            {Math.round(gap.confidence * 100)}% confidence
                                                                                        </span>
                                                                                    </div>
                                                                                    <p className="text-sm">{gap.problem}</p>
                                                                                </div>
                                                                                <Button
                                                                                    variant="ghost"
                                                                                    size="icon"
                                                                                    className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                                                                    onClick={() => copyToClipboard(gap.problem, gap.id)}
                                                                                >
                                                                                    {copiedId === gap.id ? (
                                                                                        <Check className="h-4 w-4 text-green-500" />
                                                                                    ) : (
                                                                                        <Copy className="h-4 w-4" />
                                                                                    )}
                                                                                </Button>
                                                                            </div>
                                                                        </div>
                                                                    ))}
                                                                </div>
                                                            </motion.div>
                                                        )}
                                                    </AnimatePresence>
                                                </CardContent>
                                            </Card>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
