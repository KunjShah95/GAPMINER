import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import {
    FileSearch,
    TrendingUp,
    Lightbulb,
    BarChart3,
    ArrowRight,
    Activity,
    Target,
    Layers,
    Sparkles
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCounter, CircularProgress, PercentageCounter } from "@/components/ui/animated-counter"
import { KnowledgeGraph, generateMockNodes } from "@/components/ui/knowledge-graph"
import { CompactTimeline } from "@/components/ui/research-timeline"

const stats = [
    {
        label: "Papers Analyzed",
        value: 47,
        icon: FileSearch,
        trend: "+12 this week",
        color: "hsl(var(--brand-primary))"
    },
    {
        label: "Gaps Discovered",
        value: 156,
        icon: Lightbulb,
        trend: "+28 this week",
        color: "hsl(var(--gap-data))"
    },
    {
        label: "Research Themes",
        value: 12,
        icon: Layers,
        trend: "+3 this week",
        color: "hsl(var(--brand-secondary))"
    },
    {
        label: "Collections",
        value: 8,
        icon: Target,
        trend: "+2 this week",
        color: "hsl(var(--gap-evaluation))"
    }
]

const typeBreakdown = [
    { label: "Data Scarcity", value: 35, color: "hsl(var(--gap-data))" },
    { label: "Compute Limits", value: 28, color: "hsl(var(--gap-compute))" },
    { label: "Evaluation Gaps", value: 22, color: "hsl(var(--gap-evaluation))" },
    { label: "Methodology", value: 15, color: "hsl(var(--gap-methodology))" }
]

const recentActivity = [
    { action: "Crawled", target: "Scaling Laws for Neural Language Models", time: "2 hours ago" },
    { action: "Added to", target: "NLP Research collection", time: "3 hours ago" },
    { action: "Exported", target: "15 gaps as CSV", time: "5 hours ago" },
    { action: "Crawled", target: "Attention Is All You Need", time: "1 day ago" }
]

export function DashboardPage() {
    const graphNodes = generateMockNodes()

    return (
        <div className="min-h-screen py-12">
            <div className="container-wide">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <div className="section-number mb-4">DASHBOARD</div>
                        <h1 className="heading-section mb-4">
                            Research
                            <br />
                            <span className="gradient-text">Overview</span>
                        </h1>
                        <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
                            Track your research gap discovery progress and explore patterns across papers.
                        </p>
                    </div>
                    <Link to="/crawl">
                        <Button className="gap-2">
                            <FileSearch className="h-4 w-4" />
                            Crawl Papers
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </Link>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {stats.map((stat, idx) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="card-hover h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: stat.color + "20" }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color: stat.color }} />
                                            </div>
                                            <Badge variant="secondary" className="text-[10px]">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                {stat.trend}
                                            </Badge>
                                        </div>
                                        <div className="text-3xl font-bold mb-1">
                                            <AnimatedCounter value={stat.value} />
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {stat.label}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                    {/* Knowledge Graph */}
                    <div className="lg:col-span-2">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="flex items-center gap-2">
                                    <Sparkles className="h-5 w-5" />
                                    Research Knowledge Graph
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                <KnowledgeGraph
                                    nodes={graphNodes}
                                    className="h-[350px] border-0"
                                />
                            </CardContent>
                        </Card>
                    </div>

                    {/* Gap Type Breakdown */}
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2">
                                <BarChart3 className="h-5 w-5" />
                                Gap Type Breakdown
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex justify-center mb-6">
                                <CircularProgress value={72} label="Quality" />
                            </div>
                            <div className="space-y-4">
                                {typeBreakdown.map((type) => (
                                    <PercentageCounter
                                        key={type.label}
                                        value={type.value}
                                        label={type.label}
                                        color={type.color}
                                    />
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Recent Activity */}
                    <Card>
                        <CardHeader className="pb-3">
                            <CardTitle className="flex items-center gap-2">
                                <Activity className="h-5 w-5" />
                                Recent Activity
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {recentActivity.map((activity, idx) => (
                                    <motion.div
                                        key={idx}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="flex items-center gap-3"
                                    >
                                        <div className="h-2 w-2 rounded-full bg-[hsl(var(--brand-primary))]" />
                                        <div className="flex-1">
                                            <p className="text-sm">
                                                <span className="font-medium">{activity.action}</span>{" "}
                                                <span className="text-[hsl(var(--muted-foreground))]">
                                                    {activity.target}
                                                </span>
                                            </p>
                                        </div>
                                        <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                            {activity.time}
                                        </span>
                                    </motion.div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    {/* Timeline Preview */}
                    <Card>
                        <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                                <CardTitle className="flex items-center gap-2">
                                    <Lightbulb className="h-5 w-5" />
                                    Recent Discoveries
                                </CardTitle>
                                <Link to="/insights">
                                    <Button variant="ghost" size="sm" className="gap-1 text-xs">
                                        View All
                                        <ArrowRight className="h-3 w-3" />
                                    </Button>
                                </Link>
                            </div>
                        </CardHeader>
                        <CardContent>
                            <CompactTimeline />
                        </CardContent>
                    </Card>
                </div>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Link to="/crawl">
                        <Card className="card-hover cursor-pointer">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-primary))]/10">
                                    <FileSearch className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Crawl New Papers</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Extract gaps from URLs
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/explore">
                        <Card className="card-hover cursor-pointer">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--gap-evaluation))]/10">
                                    <BarChart3 className="h-6 w-6 text-[hsl(var(--gap-evaluation))]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Explore Gaps</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Browse and filter discoveries
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                    <Link to="/assistant">
                        <Card className="card-hover cursor-pointer">
                            <CardContent className="pt-6 flex items-center gap-4">
                                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-secondary))]/10">
                                    <Sparkles className="h-6 w-6 text-[hsl(var(--brand-secondary))]" />
                                </div>
                                <div>
                                    <h3 className="font-semibold">Ask AI Assistant</h3>
                                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                        Get research insights
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </Link>
                </div>
            </div>
        </div>
    )
}
