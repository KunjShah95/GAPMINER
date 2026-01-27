// Citation Network Visualization Component
// Renders an interactive graph of paper connections using D3-like physics or SVG

import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Network,
    ZoomIn,
    ZoomOut,
    Maximize2,
    Filter,
    Search,
    Download,
    Share2,
    Info,
    ChevronRight,
    Loader2,
} from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { Badge } from "./badge"
import { Input } from "./input"

interface Node {
    id: string
    title: string
    author: string
    year: number
    citations: number
    type: "root" | "citation" | "reference"
    x?: number
    y?: number
}

interface Link {
    source: string
    target: string
    strength: number
}

interface CitationNetworkProps {
    paperId?: string
    height?: number
}

export function CitationNetwork({ paperId, height = 500 }: CitationNetworkProps) {
    const [isLoading, setIsLoading] = useState(true)
    const [selectedNode, setSelectedNode] = useState<Node | null>(null)
    const [searchQuery, setSearchQuery] = useState("")
    const [zoom, setZoom] = useState(1)

    // Mock data generation
    const { nodes, links } = useMemo(() => {
        const nodes: Node[] = [
            { id: "root", title: "Original Research Paper", author: "Main Author et al.", year: 2024, citations: 45, type: "root" },
            { id: "c1", title: "Cross-domain Analysis of LLMs", author: "Smith et al.", year: 2023, citations: 120, type: "citation" },
            { id: "c2", title: "Attention Mechanisms Revisted", author: "Doe et al.", year: 2022, citations: 340, type: "reference" },
            { id: "c3", title: "Neural Network Architecture", author: "Johnson et al.", year: 2021, citations: 560, type: "reference" },
            { id: "c4", title: "Scale and Efficiency", author: "Williams et al.", year: 2024, citations: 12, type: "citation" },
            { id: "c5", title: "Future of Generative AI", author: "Brown et al.", year: 2023, citations: 89, type: "citation" },
        ]

        const links: Link[] = [
            { source: "root", target: "c1", strength: 0.8 },
            { source: "c2", target: "root", strength: 0.9 },
            { source: "c3", target: "root", strength: 0.7 },
            { source: "root", target: "c4", strength: 0.5 },
            { source: "root", target: "c5", strength: 0.6 },
            { source: "c2", target: "c3", strength: 0.4 },
        ]

        // Assign random initial positions
        nodes.forEach((n, i) => {
            n.x = 250 + Math.cos((i / nodes.length) * Math.PI * 2) * 150
            n.y = 250 + Math.sin((i / nodes.length) * Math.PI * 2) * 150
        })

        if (nodes[0]) {
            nodes[0].x = 250
            nodes[0].y = 250
        }

        return { nodes, links }
    }, [paperId])

    useEffect(() => {
        const timer = setTimeout(() => setIsLoading(false), 1500)
        return () => clearTimeout(timer)
    }, [])

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node)
    }

    const filteredNodes = nodes.filter(n =>
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.author.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <Card className="overflow-hidden">
            <CardHeader className="border-b border-[hsl(var(--border))]">
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Network className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                        Citation Network
                    </CardTitle>
                    <div className="flex gap-2">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                            <Input
                                placeholder="Search papers..."
                                className="pl-9 h-9 w-48 text-xs"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                        <Button variant="outline" size="sm" className="gap-2">
                            <Filter className="h-4 w-4" />
                            Filters
                        </Button>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-0 relative">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4" style={{ height }}>
                        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--brand-primary))]" />
                        <p className="text-sm text-[hsl(var(--muted-foreground))]">Mapping citations...</p>
                    </div>
                ) : (
                    <div className="flex" style={{ height }}>
                        {/* Interactive Graph Area */}
                        <div className="flex-1 relative bg-[hsl(var(--background))] overflow-hidden cursor-grab active:cursor-grabbing">
                            {/* Grid Background */}
                            <div
                                className="absolute inset-0 opacity-[0.03]"
                                style={{
                                    backgroundImage: "radial-gradient(circle, currentColor 1px, transparent 1px)",
                                    backgroundSize: "24px 24px"
                                }}
                            />

                            <svg
                                className="w-full h-full"
                                viewBox="0 0 500 500"
                                style={{ transform: `scale(${zoom})`, transformOrigin: "center" }}
                            >
                                {/* Links */}
                                {links.map((link, idx) => {
                                    const source = nodes.find(n => n.id === link.source)
                                    const target = nodes.find(n => n.id === link.target)
                                    if (!source || !target) return null

                                    return (
                                        <line
                                            key={idx}
                                            x1={source.x}
                                            y1={source.y}
                                            x2={target.x}
                                            y2={target.y}
                                            stroke="hsl(var(--border))"
                                            strokeWidth={link.strength * 2}
                                            strokeDasharray={link.source === "root" ? "" : "4 2"}
                                            className="transition-all duration-300"
                                        />
                                    )
                                })}

                                {/* Nodes */}
                                {filteredNodes.map((node) => (
                                    <g
                                        key={node.id}
                                        className="cursor-pointer group"
                                        onClick={() => handleNodeClick(node)}
                                    >
                                        <circle
                                            cx={node.x}
                                            cy={node.y}
                                            r={node.type === "root" ? 12 : 8}
                                            fill={
                                                node.id === selectedNode?.id
                                                    ? "hsl(var(--brand-primary))"
                                                    : node.type === "root"
                                                        ? "hsl(var(--brand-secondary))"
                                                        : "hsl(var(--card))"
                                            }
                                            stroke={
                                                node.id === selectedNode?.id
                                                    ? "white"
                                                    : "hsl(var(--brand-primary))"
                                            }
                                            strokeWidth="2"
                                            className="transition-all duration-300 group-hover:r-[14]"
                                        />
                                        <text
                                            x={node.x}
                                            y={node.y! + 20}
                                            textAnchor="middle"
                                            className="text-[10px] fill-[hsl(var(--foreground))] font-medium pointer-events-none select-none"
                                        >
                                            {node.title.split(" ").slice(0, 2).join(" ")}...
                                        </text>
                                    </g>
                                ))}
                            </svg>

                            {/* Controls */}
                            <div className="absolute bottom-4 left-4 flex flex-col gap-2">
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => setZoom(z => Math.min(2, z + 0.2))}>
                                    <ZoomIn className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={() => setZoom(z => Math.max(0.5, z - 0.2))}>
                                    <ZoomOut className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                                    <Maximize2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Sidebar */}
                        <div className="w-80 border-l border-[hsl(var(--border))] flex flex-col">
                            <div className="p-4 border-b border-[hsl(var(--border))]">
                                <h3 className="text-sm font-bold flex items-center gap-2">
                                    <Info className="h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    Paper Details
                                </h3>
                            </div>
                            <div className="flex-1 overflow-y-auto p-4">
                                <AnimatePresence mode="wait">
                                    {selectedNode ? (
                                        <motion.div
                                            key={selectedNode.id}
                                            initial={{ opacity: 0, x: 20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            exit={{ opacity: 0, x: -20 }}
                                            className="space-y-4"
                                        >
                                            <div>
                                                <Badge variant="secondary" className="mb-2">
                                                    {selectedNode.type}
                                                </Badge>
                                                <h4 className="text-base font-bold leading-tight mb-2">
                                                    {selectedNode.title}
                                                </h4>
                                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                                    {selectedNode.author} • {selectedNode.year}
                                                </p>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div className="p-3 rounded-lg bg-[hsl(var(--muted))] text-center">
                                                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Citations</p>
                                                    <p className="text-lg font-bold">{selectedNode.citations}</p>
                                                </div>
                                                <div className="p-3 rounded-lg bg-[hsl(var(--muted))] text-center">
                                                    <p className="text-[10px] uppercase font-bold text-[hsl(var(--muted-foreground))]">Impact</p>
                                                    <p className="text-lg font-bold">{(selectedNode.citations / 50).toFixed(1)}</p>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Button className="w-full gap-2 text-xs">
                                                    View Full Analysis
                                                    <ChevronRight className="h-3 w-3" />
                                                </Button>
                                                <Button variant="outline" className="w-full gap-2 text-xs">
                                                    <Download className="h-3 w-3" />
                                                    Download PDF
                                                </Button>
                                            </div>

                                            <div className="pt-4 mt-4 border-t border-[hsl(var(--border))]">
                                                <h5 className="text-xs font-bold uppercase text-[hsl(var(--muted-foreground))] mb-3">Key Connections</h5>
                                                <div className="space-y-2">
                                                    {links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id).map((l, i) => {
                                                        const otherId = l.source === selectedNode.id ? l.target : l.source
                                                        const other = nodes.find(n => n.id === otherId)
                                                        return (
                                                            <div key={i} className="flex items-center justify-between text-xs p-2 rounded hover:bg-[hsl(var(--muted))] cursor-pointer transition-colors">
                                                                <span className="truncate flex-1 pr-2">{other?.title}</span>
                                                                <Badge variant="outline" className="text-[10px] py-0">{(l.strength * 100).toFixed(0)}%</Badge>
                                                            </div>
                                                        )
                                                    })}
                                                </div>
                                            </div>
                                        </motion.div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-12 text-center">
                                            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center mb-4">
                                                <Network className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                                            </div>
                                            <p className="text-sm font-medium">Select a node</p>
                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">Click on a circle to view paper details</p>
                                        </div>
                                    )}
                                </AnimatePresence>
                            </div>
                            <div className="p-4 bg-[hsl(var(--muted))/30 flex gap-2">
                                <Button variant="ghost" size="sm" className="flex-1 gap-2 text-[10px]">
                                    <Share2 className="h-3 w-3" />
                                    Share Map
                                </Button>
                                <Button variant="ghost" size="sm" className="flex-1 gap-2 text-[10px]">
                                    <Download className="h-3 w-3" />
                                    Export PNG
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
