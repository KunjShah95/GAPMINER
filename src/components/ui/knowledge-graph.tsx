import { useEffect, useRef, useState } from "react"
import { motion } from "framer-motion"

interface Node {
    id: string
    label: string
    type: "paper" | "gap" | "theme"
    x: number
    y: number
    connections: string[]
}

interface KnowledgeGraphProps {
    nodes: Node[]
    onNodeClick?: (node: Node) => void
    className?: string
}

export function KnowledgeGraph({ nodes, onNodeClick, className = "" }: KnowledgeGraphProps) {
    const svgRef = useRef<SVGSVGElement>(null)
    const [selectedNode, setSelectedNode] = useState<string | null>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 })

    useEffect(() => {
        const updateDimensions = () => {
            if (svgRef.current?.parentElement) {
                const { width, height } = svgRef.current.parentElement.getBoundingClientRect()
                setDimensions({ width, height: Math.max(height, 400) })
            }
        }
        updateDimensions()
        window.addEventListener("resize", updateDimensions)
        return () => window.removeEventListener("resize", updateDimensions)
    }, [])

    const getNodeColor = (type: Node["type"]) => {
        switch (type) {
            case "paper": return "hsl(var(--brand-primary))"
            case "gap": return "hsl(var(--gap-compute))"
            case "theme": return "hsl(var(--brand-secondary))"
        }
    }

    const getNodeSize = (type: Node["type"]) => {
        switch (type) {
            case "paper": return 30
            case "gap": return 20
            case "theme": return 40
        }
    }

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node.id === selectedNode ? null : node.id)
        onNodeClick?.(node)
    }

    return (
        <div className={`relative w-full overflow-hidden rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] ${className}`}>
            <svg
                ref={svgRef}
                width={dimensions.width}
                height={dimensions.height}
                className="w-full"
            >
                {/* Grid Background */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="0.5"
                            opacity="0.5"
                        />
                    </pattern>
                    {/* Glow filter */}
                    <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Connections */}
                {nodes.map(node =>
                    node.connections.map(targetId => {
                        const target = nodes.find(n => n.id === targetId)
                        if (!target) return null
                        const isHighlighted = selectedNode === node.id || selectedNode === targetId

                        return (
                            <motion.line
                                key={`${node.id}-${targetId}`}
                                x1={node.x * dimensions.width}
                                y1={node.y * dimensions.height}
                                x2={target.x * dimensions.width}
                                y2={target.y * dimensions.height}
                                stroke={isHighlighted ? "hsl(var(--brand-primary))" : "hsl(var(--muted-foreground))"}
                                strokeWidth={isHighlighted ? 2 : 1}
                                strokeOpacity={isHighlighted ? 0.8 : 0.2}
                                initial={{ pathLength: 0 }}
                                animate={{ pathLength: 1 }}
                                transition={{ duration: 1, delay: 0.5 }}
                            />
                        )
                    })
                )}

                {/* Nodes */}
                {nodes.map((node, idx) => {
                    const size = getNodeSize(node.type)
                    const color = getNodeColor(node.type)
                    const isSelected = selectedNode === node.id
                    const isConnected = selectedNode
                        ? nodes.find(n => n.id === selectedNode)?.connections.includes(node.id)
                        : false

                    return (
                        <motion.g
                            key={node.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5, delay: idx * 0.05 }}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleNodeClick(node)}
                        >
                            {/* Node circle */}
                            <motion.circle
                                cx={node.x * dimensions.width}
                                cy={node.y * dimensions.height}
                                r={isSelected ? size * 1.2 : size}
                                fill={color}
                                fillOpacity={isSelected || isConnected || !selectedNode ? 0.9 : 0.3}
                                filter={isSelected ? "url(#glow)" : undefined}
                                whileHover={{ scale: 1.1 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            />

                            {/* Inner ring for themes */}
                            {node.type === "theme" && (
                                <circle
                                    cx={node.x * dimensions.width}
                                    cy={node.y * dimensions.height}
                                    r={size * 0.6}
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="2"
                                    opacity="0.5"
                                />
                            )}

                            {/* Label */}
                            <text
                                x={node.x * dimensions.width}
                                y={node.y * dimensions.height + size + 15}
                                textAnchor="middle"
                                fill="hsl(var(--foreground))"
                                fontSize="11"
                                fontWeight={isSelected ? "600" : "400"}
                                opacity={isSelected || isConnected || !selectedNode ? 1 : 0.5}
                            >
                                {node.label.length > 20 ? node.label.slice(0, 20) + "..." : node.label}
                            </text>
                        </motion.g>
                    )
                })}
            </svg>

            {/* Legend */}
            <div className="absolute bottom-4 left-4 flex gap-4 text-xs">
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor("paper") }} />
                    <span className="text-[hsl(var(--muted-foreground))]">Papers</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor("gap") }} />
                    <span className="text-[hsl(var(--muted-foreground))]">Gaps</span>
                </div>
                <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: getNodeColor("theme") }} />
                    <span className="text-[hsl(var(--muted-foreground))]">Themes</span>
                </div>
            </div>

            {/* Selected Node Info */}
            {selectedNode && (
                <motion.div
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="absolute top-4 right-4 p-3 rounded-lg bg-[hsl(var(--background))] border border-[hsl(var(--border))] shadow-lg max-w-xs"
                >
                    <h4 className="font-medium text-sm mb-1">
                        {nodes.find(n => n.id === selectedNode)?.label}
                    </h4>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {nodes.find(n => n.id === selectedNode)?.connections.length} connections
                    </p>
                </motion.div>
            )}
        </div>
    )
}

// Generate mock nodes for demo
export function generateMockNodes(): Node[] {
    const papers = [
        "Attention Is All You Need",
        "BERT",
        "GPT-4",
        "LLaMA",
        "Constitutional AI"
    ]

    const gaps = [
        "Low-resource languages",
        "Long context",
        "Training costs",
        "Evaluation gaps",
        "Alignment scaling"
    ]

    const themes = [
        "Data Scarcity",
        "Compute",
        "Evaluation"
    ]

    const nodes: Node[] = []

    // Add themes (center-ish)
    themes.forEach((theme, i) => {
        nodes.push({
            id: `theme-${i}`,
            label: theme,
            type: "theme",
            x: 0.3 + (i * 0.2),
            y: 0.5,
            connections: []
        })
    })

    // Add papers (top)
    papers.forEach((paper, i) => {
        const themeIdx = i % themes.length
        nodes.push({
            id: `paper-${i}`,
            label: paper,
            type: "paper",
            x: 0.15 + (i * 0.18),
            y: 0.2,
            connections: [`theme-${themeIdx}`]
        })
        nodes[themeIdx].connections.push(`paper-${i}`)
    })

    // Add gaps (bottom)
    gaps.forEach((gap, i) => {
        const themeIdx = i % themes.length
        const paperIdx = i % papers.length
        nodes.push({
            id: `gap-${i}`,
            label: gap,
            type: "gap",
            x: 0.15 + (i * 0.18),
            y: 0.8,
            connections: [`theme-${themeIdx}`, `paper-${paperIdx}`]
        })
        nodes[themeIdx].connections.push(`gap-${i}`)
    })

    return nodes
}
