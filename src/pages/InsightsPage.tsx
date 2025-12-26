import { motion } from "framer-motion"
import {
    Lightbulb,
    TrendingUp,
    Database,
    Cpu,
    BarChart3,
    FlaskConical,
    ArrowRight,
    MessageSquare,
    Sparkles
} from "lucide-react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grid"

// Mock insights data
const themes = [
    {
        name: "Data Scarcity",
        count: 12,
        icon: Database,
        color: "text-yellow-500",
        bgColor: "bg-yellow-500/10",
        description: "Lack of diverse, high-quality training datasets",
    },
    {
        name: "Evaluation Gaps",
        count: 9,
        icon: BarChart3,
        color: "text-green-500",
        bgColor: "bg-green-500/10",
        description: "Benchmarks failing to capture real-world complexity",
    },
    {
        name: "Compute Constraints",
        count: 7,
        icon: Cpu,
        color: "text-red-500",
        bgColor: "bg-red-500/10",
        description: "Training and inference costs limiting scalability",
    },
    {
        name: "Methodology Limitations",
        count: 5,
        icon: FlaskConical,
        color: "text-blue-500",
        bgColor: "bg-blue-500/10",
        description: "Fundamental approach constraints",
    },
]

const suggestedQuestions = [
    {
        question: "Which gaps appear across multiple venues?",
        description: "Find problems that researchers from different communities have identified",
        icon: TrendingUp,
    },
    {
        question: "Which problems are now solvable with new techniques?",
        description: "Identify gaps that recent advances might address",
        icon: Sparkles,
    },
    {
        question: "Which gaps are tooling-related?",
        description: "Find opportunities for infrastructure and developer tools",
        icon: FlaskConical,
    },
    {
        question: "What are the most cited unsolved problems?",
        description: "Discover high-impact research directions",
        icon: MessageSquare,
    },
]

const trendingProblems = [
    {
        problem: "Models fail to generalize to low-resource languages",
        papers: 8,
        venues: ["NeurIPS", "ACL", "EMNLP"],
        trend: "rising",
    },
    {
        problem: "Evaluation benchmarks don't reflect real-world complexity",
        papers: 6,
        venues: ["ICML", "NeurIPS", "arXiv"],
        trend: "stable",
    },
    {
        problem: "Training costs prevent scaling to long contexts",
        papers: 5,
        venues: ["ICLR", "arXiv"],
        trend: "rising",
    },
    {
        problem: "Alignment methods don't scale without human feedback",
        papers: 4,
        venues: ["arXiv", "NeurIPS"],
        trend: "new",
    },
]

export function InsightsPage() {
    return (
        <div className="min-h-screen py-12">
            <div className="container-wide">
                {/* Header */}
                <div className="mb-12">
                    <div className="section-number mb-4">INSIGHTS</div>
                    <h1 className="heading-section mb-4">
                        Cross-Paper Analysis
                        <br />
                        <span className="gradient-text">& Research Themes</span>
                    </h1>
                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
                        Discover repeating patterns across papers to identify high-impact
                        research directions and unsolved problems that matter.
                    </p>
                </div>

                {/* Repeating Themes */}
                <section className="mb-16">
                    <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Repeating Research Themes
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {themes.map((theme, idx) => {
                            const Icon = theme.icon
                            return (
                                <motion.div
                                    key={theme.name}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                >
                                    <Card className="card-hover h-full">
                                        <CardContent className="pt-6">
                                            <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${theme.bgColor} mb-4`}>
                                                <Icon className={`h-6 w-6 ${theme.color}`} />
                                            </div>
                                            <div className="flex items-center justify-between mb-2">
                                                <h3 className="font-semibold">{theme.name}</h3>
                                                <Badge variant="secondary">{theme.count} papers</Badge>
                                            </div>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                {theme.description}
                                            </p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                </section>

                {/* Trending Problems */}
                <section className="mb-16">
                    <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
                        <Lightbulb className="h-5 w-5" />
                        Trending Unsolved Problems
                    </h2>
                    <div className="space-y-4">
                        {trendingProblems.map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="card-hover">
                                    <CardContent className="py-4">
                                        <div className="flex items-start gap-4">
                                            {/* Rank */}
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))] font-mono font-bold">
                                                #{idx + 1}
                                            </div>

                                            {/* Content */}
                                            <div className="flex-1 min-w-0">
                                                <p className="font-medium mb-2">{item.problem}</p>
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <Badge variant="outline" className="text-xs">
                                                        {item.papers} papers
                                                    </Badge>
                                                    {item.venues.map((venue) => (
                                                        <Badge key={venue} variant="secondary" className="text-xs">
                                                            {venue}
                                                        </Badge>
                                                    ))}
                                                    {item.trend === "rising" && (
                                                        <Badge className="bg-green-500/10 text-green-500 border-green-500/30 text-xs">
                                                            ↑ Rising
                                                        </Badge>
                                                    )}
                                                    {item.trend === "new" && (
                                                        <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/30 text-xs">
                                                            ✦ New
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>

                                            {/* Arrow */}
                                            <ArrowRight className="h-5 w-5 text-[hsl(var(--muted-foreground))] shrink-0" />
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Suggested Questions */}
                <section className="mb-16">
                    <h2 className="font-semibold text-xl mb-6 flex items-center gap-2">
                        <MessageSquare className="h-5 w-5" />
                        Questions You Can Ask
                    </h2>
                    <BentoGrid className="grid-cols-1 md:grid-cols-2">
                        {suggestedQuestions.map((item, idx) => {
                            const Icon = item.icon
                            return (
                                <BentoGridItem
                                    key={idx}
                                    title={item.question}
                                    description={item.description}
                                    icon={<Icon className="h-5 w-5 text-[hsl(var(--brand-primary))]" />}
                                    header={
                                        <div className="flex h-24 items-center justify-center rounded-lg bg-gradient-to-br from-[hsl(var(--brand-primary))]/10 to-[hsl(var(--brand-secondary))]/10">
                                            <Icon className="h-10 w-10 text-[hsl(var(--brand-primary))]" />
                                        </div>
                                    }
                                    className="cursor-pointer"
                                />
                            )
                        })}
                    </BentoGrid>
                </section>

                {/* Coming Soon */}
                <section>
                    <Card className="border-dashed bg-gradient-to-br from-[hsl(var(--brand-primary))]/5 to-[hsl(var(--brand-secondary))]/5">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                                Coming Soon: AI-Powered Analysis
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-[hsl(var(--muted-foreground))] mb-6">
                                We're building intelligent clustering and question-answering features
                                that will help you discover deeper insights across your research corpus.
                            </p>
                            <div className="flex flex-wrap gap-3">
                                <Badge variant="outline" className="gap-1">
                                    <Database className="h-3 w-3" />
                                    Semantic Clustering
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <MessageSquare className="h-3 w-3" />
                                    Natural Language Queries
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <TrendingUp className="h-3 w-3" />
                                    Trend Analysis
                                </Badge>
                                <Badge variant="outline" className="gap-1">
                                    <Lightbulb className="h-3 w-3" />
                                    Research Suggestions
                                </Badge>
                            </div>
                        </CardContent>
                    </Card>
                </section>

                {/* CTA */}
                <section className="mt-16 text-center">
                    <h2 className="heading-section mb-4">
                        Ready to find your next research direction?
                    </h2>
                    <p className="text-[hsl(var(--muted-foreground))] mb-8 max-w-xl mx-auto">
                        Start by crawling more papers to expand your insight database.
                    </p>
                    <Link to="/crawl">
                        <Button size="lg" className="gap-2">
                            <Lightbulb className="h-5 w-5" />
                            Crawl More Papers
                            <ArrowRight className="h-5 w-5" />
                        </Button>
                    </Link>
                </section>
            </div>
        </div>
    )
}
