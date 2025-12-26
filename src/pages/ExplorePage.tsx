import { useState, useMemo } from "react"
import { motion } from "framer-motion"
import {
    Search,
    Filter,
    ExternalLink,
    SlidersHorizontal,
    X,
    Database,
    Cpu,
    BarChart3,
    FlaskConical
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// Mock data for the explore page
const mockGaps = [
    {
        id: "1",
        paper: "Scaling Laws for Neural Language Models",
        url: "https://arxiv.org/abs/2001.08361",
        venue: "NeurIPS 2024",
        problem: "Models fail to generalize to low-resource languages due to lack of diverse annotated datasets and representation imbalance in training corpora.",
        type: "data" as const,
        date: "2024-03-15",
    },
    {
        id: "2",
        paper: "Attention Is All You Need",
        url: "https://arxiv.org/abs/1706.03762",
        venue: "NeurIPS 2017",
        problem: "Evaluation benchmarks do not reflect real-world conversational complexity, leading to overestimated performance metrics.",
        type: "evaluation" as const,
        date: "2024-03-14",
    },
    {
        id: "3",
        paper: "GPT-4 Technical Report",
        url: "https://arxiv.org/abs/2303.08774",
        venue: "arXiv",
        problem: "Training cost prevents scaling to long-context inputs beyond 32k tokens without significant compute infrastructure.",
        type: "compute" as const,
        date: "2024-03-12",
    },
    {
        id: "4",
        paper: "Constitutional AI",
        url: "https://arxiv.org/abs/2212.08073",
        venue: "ACL 2023",
        problem: "Current alignment methods rely heavily on human feedback which is expensive, inconsistent, and doesn't scale effectively.",
        type: "methodology" as const,
        date: "2024-03-10",
    },
    {
        id: "5",
        paper: "LLaMA: Open Foundation Models",
        url: "https://arxiv.org/abs/2302.13971",
        venue: "ICML 2024",
        problem: "Model compression techniques significantly degrade performance on reasoning tasks, limiting deployment on edge devices.",
        type: "compute" as const,
        date: "2024-03-08",
    },
    {
        id: "6",
        paper: "Retrieval-Augmented Generation",
        url: "https://arxiv.org/abs/2005.11401",
        venue: "NeurIPS 2020",
        problem: "Retrieved documents often contain outdated or contradictory information, leading to factual inconsistencies in generated outputs.",
        type: "data" as const,
        date: "2024-03-06",
    },
    {
        id: "7",
        paper: "Chain-of-Thought Prompting",
        url: "https://arxiv.org/abs/2201.11903",
        venue: "NeurIPS 2022",
        problem: "CoT prompting increases inference latency by 3-5x, making it impractical for real-time applications.",
        type: "compute" as const,
        date: "2024-03-04",
    },
    {
        id: "8",
        paper: "BERT: Pre-training Transformers",
        url: "https://arxiv.org/abs/1810.04805",
        venue: "NAACL 2019",
        problem: "Existing evaluation suites fail to capture nuanced semantic understanding in domain-specific contexts.",
        type: "evaluation" as const,
        date: "2024-03-02",
    },
]

const typeConfig = {
    data: {
        label: "Data",
        icon: Database,
        color: "tag-data",
    },
    compute: {
        label: "Compute",
        icon: Cpu,
        color: "tag-compute",
    },
    evaluation: {
        label: "Evaluation",
        icon: BarChart3,
        color: "tag-evaluation",
    },
    methodology: {
        label: "Methodology",
        icon: FlaskConical,
        color: "tag-methodology",
    },
}

const venues = ["All", "NeurIPS", "ACL", "ICML", "ICLR", "arXiv"]

export function ExplorePage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedTypes, setSelectedTypes] = useState<Set<string>>(new Set())
    const [selectedVenue, setSelectedVenue] = useState("All")
    const [showFilters, setShowFilters] = useState(false)

    const filteredGaps = useMemo(() => {
        return mockGaps.filter((gap) => {
            // Search filter
            const matchesSearch =
                !searchQuery ||
                gap.problem.toLowerCase().includes(searchQuery.toLowerCase()) ||
                gap.paper.toLowerCase().includes(searchQuery.toLowerCase())

            // Type filter
            const matchesType =
                selectedTypes.size === 0 || selectedTypes.has(gap.type)

            // Venue filter
            const matchesVenue =
                selectedVenue === "All" || gap.venue.includes(selectedVenue)

            return matchesSearch && matchesType && matchesVenue
        })
    }, [searchQuery, selectedTypes, selectedVenue])

    const toggleType = (type: string) => {
        setSelectedTypes((prev) => {
            const next = new Set(prev)
            if (next.has(type)) {
                next.delete(type)
            } else {
                next.add(type)
            }
            return next
        })
    }

    const clearFilters = () => {
        setSearchQuery("")
        setSelectedTypes(new Set())
        setSelectedVenue("All")
    }

    const hasActiveFilters =
        searchQuery || selectedTypes.size > 0 || selectedVenue !== "All"

    return (
        <div className="min-h-screen py-12">
            <div className="container-wide">
                {/* Header */}
                <div className="mb-8">
                    <div className="section-number mb-4">EXPLORE</div>
                    <h1 className="heading-section mb-4">
                        Browse Research Gaps
                    </h1>
                    <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
                        Scan through extracted limitations from crawled papers.
                        Filter by type, venue, or keyword to find relevant research opportunities.
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="mb-8 space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                placeholder="Search gaps or papers..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={() => setShowFilters(!showFilters)}
                        >
                            <SlidersHorizontal className="h-4 w-4" />
                            Filters
                            {hasActiveFilters && (
                                <Badge variant="secondary" className="ml-1">
                                    Active
                                </Badge>
                            )}
                        </Button>
                        {hasActiveFilters && (
                            <Button variant="ghost" className="gap-2" onClick={clearFilters}>
                                <X className="h-4 w-4" />
                                Clear
                            </Button>
                        )}
                    </div>

                    {/* Filter Panel */}
                    {showFilters && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                        >
                            <Card>
                                <CardContent className="pt-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Type Filter */}
                                        <div>
                                            <h3 className="font-medium mb-3 flex items-center gap-2">
                                                <Filter className="h-4 w-4" />
                                                Gap Type
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {Object.entries(typeConfig).map(([key, config]) => {
                                                    const Icon = config.icon
                                                    const isSelected = selectedTypes.has(key)
                                                    return (
                                                        <Button
                                                            key={key}
                                                            variant={isSelected ? "default" : "outline"}
                                                            size="sm"
                                                            className="gap-1"
                                                            onClick={() => toggleType(key)}
                                                        >
                                                            <Icon className="h-3 w-3" />
                                                            {config.label}
                                                        </Button>
                                                    )
                                                })}
                                            </div>
                                        </div>

                                        {/* Venue Filter */}
                                        <div>
                                            <h3 className="font-medium mb-3">Venue</h3>
                                            <div className="flex flex-wrap gap-2">
                                                {venues.map((venue) => (
                                                    <Button
                                                        key={venue}
                                                        variant={selectedVenue === venue ? "default" : "outline"}
                                                        size="sm"
                                                        onClick={() => setSelectedVenue(venue)}
                                                    >
                                                        {venue}
                                                    </Button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </motion.div>
                    )}
                </div>

                {/* Results Count */}
                <div className="mb-6 flex items-center justify-between">
                    <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        Showing {filteredGaps.length} of {mockGaps.length} research gaps
                    </p>
                </div>

                {/* Gap Cards Grid */}
                {filteredGaps.length === 0 ? (
                    <Card className="border-dashed">
                        <CardContent className="py-16 text-center">
                            <Search className="h-12 w-12 mx-auto mb-4 text-[hsl(var(--muted-foreground))] opacity-50" />
                            <h3 className="font-semibold mb-2">No gaps found</h3>
                            <p className="text-[hsl(var(--muted-foreground))]">
                                Try adjusting your search or filters
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredGaps.map((gap, idx) => {
                            const config = typeConfig[gap.type]
                            const Icon = config.icon

                            return (
                                <motion.div
                                    key={gap.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                >
                                    <Card className="h-full card-hover">
                                        <CardContent className="pt-6 h-full flex flex-col">
                                            {/* Header */}
                                            <div className="flex items-start justify-between gap-2 mb-3">
                                                <Badge
                                                    className={cn(config.color, "gap-1")}
                                                >
                                                    <Icon className="h-3 w-3" />
                                                    {config.label}
                                                </Badge>
                                                <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                    {gap.venue}
                                                </span>
                                            </div>

                                            {/* Problem */}
                                            <p className="text-sm flex-1 mb-4">{gap.problem}</p>

                                            {/* Paper Link */}
                                            <div className="pt-4 border-t border-[hsl(var(--border))]">
                                                <a
                                                    href={gap.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex items-center gap-2 text-xs text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors group"
                                                >
                                                    <span className="truncate">{gap.paper}</span>
                                                    <ExternalLink className="h-3 w-3 shrink-0 group-hover:translate-x-0.5 transition-transform" />
                                                </a>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
