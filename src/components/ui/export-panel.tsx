import { useState } from "react"
import {
    Download,
    FileJson,
    FileSpreadsheet,
    Check,
    Share2,
    Mail,
    Link2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { cn } from "@/lib/utils"

interface Gap {
    id: string
    problem: string
    paper: string
    venue: string
    type: "data" | "compute" | "evaluation" | "methodology"
    date: string
}

const mockGaps: Gap[] = [
    {
        id: "1",
        problem: "Models fail to generalize to low-resource languages due to lack of diverse annotated datasets",
        paper: "Scaling Laws for Neural Language Models",
        venue: "NeurIPS 2024",
        type: "data",
        date: "2024-03-15"
    },
    {
        id: "2",
        problem: "Evaluation benchmarks do not reflect real-world conversational complexity",
        paper: "Attention Is All You Need",
        venue: "NeurIPS 2017",
        type: "evaluation",
        date: "2024-03-14"
    },
    {
        id: "3",
        problem: "Training cost prevents scaling to long-context inputs beyond 32k tokens",
        paper: "GPT-4 Technical Report",
        venue: "arXiv",
        type: "compute",
        date: "2024-03-12"
    }
]

export function ExportPanel({
    gaps = mockGaps,
    className = ""
}: {
    gaps?: Gap[]
    className?: string
}) {
    const [selectedFormat, setSelectedFormat] = useState<"csv" | "json" | "bibtex">("csv")
    const [copied, setCopied] = useState(false)
    const [exported, setExported] = useState(false)

    const formatOptions = [
        {
            id: "csv" as const,
            name: "CSV",
            icon: FileSpreadsheet,
            description: "Excel-compatible spreadsheet"
        },
        {
            id: "json" as const,
            name: "JSON",
            icon: FileJson,
            description: "Structured data format"
        }
    ]

    const generateCSV = () => {
        const headers = ["Problem", "Paper", "Venue", "Type", "Date"]
        const rows = gaps.map(g => [
            `"${g.problem.replace(/"/g, '""')}"`,
            `"${g.paper}"`,
            g.venue,
            g.type,
            g.date
        ])
        return [headers.join(","), ...rows.map(r => r.join(","))].join("\n")
    }

    const generateJSON = () => {
        return JSON.stringify(gaps, null, 2)
    }

    const handleExport = () => {
        const content = selectedFormat === "csv" ? generateCSV() : generateJSON()
        const mimeType = selectedFormat === "csv" ? "text/csv" : "application/json"
        const filename = `research-gaps.${selectedFormat}`

        const blob = new Blob([content], { type: mimeType })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = filename
        a.click()
        URL.revokeObjectURL(url)

        setExported(true)
        setTimeout(() => setExported(false), 2000)
    }

    const handleCopyLink = async () => {
        await navigator.clipboard.writeText(window.location.href)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <Card className={className}>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Download className="h-5 w-5" />
                    Export & Share
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Export Format Selection */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Export Format</h4>
                    <div className="flex gap-2">
                        {formatOptions.map((format) => {
                            const Icon = format.icon
                            return (
                                <button
                                    key={format.id}
                                    onClick={() => setSelectedFormat(format.id)}
                                    className={cn(
                                        "flex-1 p-3 rounded-lg border transition-all text-left",
                                        selectedFormat === format.id
                                            ? "border-[hsl(var(--ring))] bg-[hsl(var(--accent))]"
                                            : "border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]"
                                    )}
                                >
                                    <div className="flex items-center gap-2 mb-1">
                                        <Icon className="h-4 w-4" />
                                        <span className="font-medium text-sm">{format.name}</span>
                                    </div>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        {format.description}
                                    </p>
                                </button>
                            )
                        })}
                    </div>
                </div>

                {/* Preview */}
                <div>
                    <h4 className="text-sm font-medium mb-3">Preview</h4>
                    <div className="relative">
                        <pre className="bg-[hsl(var(--muted))] p-3 rounded-lg text-xs overflow-x-auto max-h-[150px] overflow-y-auto">
                            {selectedFormat === "csv" ? generateCSV().slice(0, 300) + "..." : generateJSON().slice(0, 300) + "..."}
                        </pre>
                    </div>
                </div>

                {/* Export Button */}
                <Button onClick={handleExport} className="w-full gap-2">
                    {exported ? (
                        <>
                            <Check className="h-4 w-4" />
                            Exported!
                        </>
                    ) : (
                        <>
                            <Download className="h-4 w-4" />
                            Export {gaps.length} Gaps as {selectedFormat.toUpperCase()}
                        </>
                    )}
                </Button>

                <div className="border-t border-[hsl(var(--border))] pt-4">
                    <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                        <Share2 className="h-4 w-4" />
                        Share
                    </h4>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            className="flex-1 gap-2"
                            onClick={handleCopyLink}
                        >
                            {copied ? (
                                <>
                                    <Check className="h-3 w-3" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Link2 className="h-3 w-3" />
                                    Copy Link
                                </>
                            )}
                        </Button>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Mail className="h-3 w-3" />
                            Email
                        </Button>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

// Quick export button component
export function QuickExportButton({ gaps }: { gaps: Gap[] }) {
    const [exported, setExported] = useState(false)

    const handleQuickExport = () => {
        const content = JSON.stringify(gaps, null, 2)
        const blob = new Blob([content], { type: "application/json" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = "research-gaps.json"
        a.click()
        URL.revokeObjectURL(url)

        setExported(true)
        setTimeout(() => setExported(false), 2000)
    }

    return (
        <Button variant="outline" size="sm" className="gap-2" onClick={handleQuickExport}>
            {exported ? (
                <>
                    <Check className="h-4 w-4" />
                    Exported!
                </>
            ) : (
                <>
                    <Download className="h-4 w-4" />
                    Export
                </>
            )}
        </Button>
    )
}
