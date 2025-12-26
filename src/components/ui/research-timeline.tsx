import { useMemo } from "react"
import { motion } from "framer-motion"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface TimelineItem {
    id: string
    date: string
    paper: string
    gap: string
    type: "data" | "compute" | "evaluation" | "methodology"
}

const mockTimelineData: TimelineItem[] = [
    {
        id: "1",
        date: "2024-03-15",
        paper: "Scaling Laws for Neural Language Models",
        gap: "Models fail to generalize to low-resource languages",
        type: "data"
    },
    {
        id: "2",
        date: "2024-03-14",
        paper: "Attention Is All You Need",
        gap: "Evaluation benchmarks don't reflect real-world complexity",
        type: "evaluation"
    },
    {
        id: "3",
        date: "2024-03-12",
        paper: "GPT-4 Technical Report",
        gap: "Training cost prevents scaling beyond 32k tokens",
        type: "compute"
    },
    {
        id: "4",
        date: "2024-03-10",
        paper: "Constitutional AI",
        gap: "Alignment methods don't scale without human feedback",
        type: "methodology"
    },
    {
        id: "5",
        date: "2024-03-08",
        paper: "LLaMA: Open Foundation Models",
        gap: "Compression degrades reasoning performance",
        type: "compute"
    },
    {
        id: "6",
        date: "2024-03-05",
        paper: "BERT: Pre-training Transformers",
        gap: "Evaluation suites miss domain-specific understanding",
        type: "evaluation"
    }
]

const typeColors: Record<string, { bg: string; text: string; label: string }> = {
    data: { bg: "bg-yellow-500/20", text: "text-yellow-500", label: "Data" },
    compute: { bg: "bg-red-500/20", text: "text-red-500", label: "Compute" },
    evaluation: { bg: "bg-green-500/20", text: "text-green-500", label: "Evaluation" },
    methodology: { bg: "bg-blue-500/20", text: "text-blue-500", label: "Methodology" }
}

export function ResearchTimeline({
    items = mockTimelineData,
    className = ""
}: {
    items?: TimelineItem[]
    className?: string
}) {
    // Group items by date
    const groupedItems = useMemo(() => {
        const groups: Record<string, TimelineItem[]> = {}
        items.forEach(item => {
            const dateKey = new Date(item.date).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric"
            })
            if (!groups[dateKey]) groups[dateKey] = []
            groups[dateKey].push(item)
        })
        return Object.entries(groups).sort((a, b) =>
            new Date(b[1][0].date).getTime() - new Date(a[1][0].date).getTime()
        )
    }, [items])

    return (
        <div className={`relative ${className}`}>
            {/* Vertical Line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-[hsl(var(--border))] via-[hsl(var(--brand-primary))] to-[hsl(var(--border))]" />

            <div className="space-y-8">
                {groupedItems.map(([date, dateItems], groupIdx) => (
                    <div key={date}>
                        {/* Date Header */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: groupIdx * 0.1 }}
                            className="flex items-center gap-4 mb-4"
                        >
                            <div className="relative z-10 flex h-12 w-12 items-center justify-center rounded-full border-2 border-[hsl(var(--border))] bg-[hsl(var(--background))]">
                                <span className="text-xs font-bold text-center leading-tight">
                                    {date.split(" ")[0]}
                                    <br />
                                    {date.split(" ")[1]}
                                </span>
                            </div>
                            <div className="text-sm text-[hsl(var(--muted-foreground))]">
                                {dateItems.length} gap{dateItems.length !== 1 ? "s" : ""} discovered
                            </div>
                        </motion.div>

                        {/* Items for this date */}
                        <div className="ml-14 space-y-3">
                            {dateItems.map((item, itemIdx) => {
                                const colors = typeColors[item.type]
                                return (
                                    <motion.div
                                        key={item.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: groupIdx * 0.1 + itemIdx * 0.05 }}
                                    >
                                        <Card className="card-hover">
                                            <CardContent className="py-4">
                                                <div className="flex items-start gap-3">
                                                    {/* Type indicator */}
                                                    <div className={`shrink-0 h-2 w-2 rounded-full mt-2 ${colors.bg}`}>
                                                        <div className={`h-full w-full rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                                                    </div>

                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <Badge
                                                                className={`${colors.bg} ${colors.text} text-[10px] border-0`}
                                                            >
                                                                {colors.label}
                                                            </Badge>
                                                            <span className="text-xs text-[hsl(var(--muted-foreground))]">
                                                                from {item.paper}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm">{item.gap}</p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    </motion.div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

            {/* End marker */}
            <div className="flex items-center gap-4 mt-8">
                <div className="relative z-10 flex h-6 w-6 items-center justify-center rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--background))] ml-3">
                    <div className="h-2 w-2 rounded-full bg-[hsl(var(--muted-foreground))]" />
                </div>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                    {items.length} gaps total
                </span>
            </div>
        </div>
    )
}

// Compact Timeline for sidebar
export function CompactTimeline({ items = mockTimelineData.slice(0, 4) }: { items?: TimelineItem[] }) {
    return (
        <div className="space-y-2">
            {items.map((item, idx) => {
                const colors = typeColors[item.type]
                return (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: idx * 0.1 }}
                        className="flex items-center gap-2 text-xs"
                    >
                        <div className={`h-1.5 w-1.5 rounded-full ${colors.text.replace('text-', 'bg-')}`} />
                        <span className="truncate flex-1">{item.gap.slice(0, 40)}...</span>
                        <span className="text-[hsl(var(--muted-foreground))] shrink-0">
                            {new Date(item.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </span>
                    </motion.div>
                )
            })}
        </div>
    )
}
