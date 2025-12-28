import { useEffect, useRef, useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"

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
    const containerRef = useRef<HTMLDivElement>(null)
    const [dimensions, setDimensions] = useState({ width: 800, height: 500 })
    const [selectedNode, setSelectedNode] = useState<string | null>(null)

    // Robust resizing using ResizeObserver
    useEffect(() => {
        if (!containerRef.current) return

        const resizeObserver = new ResizeObserver((entries) => {
            for (const entry of entries) {
                const { width, height } = entry.contentRect
                if (width > 0 && height > 0) {
                    setDimensions({ width, height })
                }
            }
        })

        resizeObserver.observe(containerRef.current)
        return () => resizeObserver.disconnect()
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
            case "paper": return 32
            case "gap": return 24
            case "theme": return 48
        }
    }

    const handleNodeClick = (node: Node) => {
        setSelectedNode(node.id === selectedNode ? null : node.id)
        onNodeClick?.(node)
    }

    // Memoize connections to avoid double rendering if A->B and B->A exist (though our data is directed for now)
    // We strictly render lines from Source -> Target defined in connections
    const connections = useMemo(() => {
        const lines: { id: string, x1: number, y1: number, x2: number, y2: number, source: string, target: string }[] = []
        nodes.forEach(node => {
            node.connections.forEach(targetId => {
                const target = nodes.find(n => n.id === targetId)
                if (target) {
                    lines.push({
                        id: `${node.id}-${targetId}`,
                        x1: node.x,
                        y1: node.y,
                        x2: target.x,
                        y2: target.y,
                        source: node.id,
                        target: targetId
                    })
                }
            })
        })
        return lines
    }, [nodes])

    return (
        <div
            ref={containerRef}
            className={`relative w-full overflow-hidden rounded-xl border border-[hsl(var(--border))] bg-[#09090b] ${className}`}
        >
            <svg
                width="100%"
                height="100%"
                viewBox={`0 0 ${dimensions.width} ${dimensions.height}`}
                className="w-full h-full"
                preserveAspectRatio="none"
            >
                {/* Grid Background */}
                <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path
                            d="M 40 0 L 0 0 0 40"
                            fill="none"
                            stroke="hsl(var(--border))"
                            strokeWidth="0.5"
                            strokeOpacity="0.1"
                        />
                    </pattern>
                    <filter id="glow-node">
                        <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                    <marker
                        id="arrowhead"
                        markerWidth="10"
                        markerHeight="7"
                        refX="20"
                        refY="3.5"
                        orient="auto"
                    >
                        <polygon points="0 0, 10 3.5, 0 7" fill="hsl(var(--muted-foreground))" opacity="0.5" />
                    </marker>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />

                {/* Connections */}
                {connections.map(line => {
                    const isHighlighted = selectedNode === line.source || selectedNode === line.target || (selectedNode === null)

                    return (
                        <motion.line
                            key={line.id}
                            x1={line.x1 * dimensions.width}
                            y1={line.y1 * dimensions.height}
                            x2={line.x2 * dimensions.width}
                            y2={line.y2 * dimensions.height}
                            stroke={selectedNode && !isHighlighted ? "hsl(var(--muted-foreground))" : "hsl(var(--muted-foreground))"}
                            strokeWidth={isHighlighted && selectedNode ? 2 : 1}
                            strokeOpacity={isHighlighted ? 0.4 : 0.1}
                            initial={{ pathLength: 0, opacity: 0 }}
                            animate={{ pathLength: 1, opacity: isHighlighted ? 0.4 : 0.1 }}
                            transition={{ duration: 0.8, ease: "easeInOut" }}
                        />
                    )
                })}

                {/* Nodes */}
                {nodes.map((node, idx) => {
                    const size = getNodeSize(node.type)
                    const color = getNodeColor(node.type)
                    const isSelected = selectedNode === node.id

                    // Check if connected for dimming logic
                    const isConnected = selectedNode
                        ? node.id === selectedNode ||
                        nodes.find(n => n.id === selectedNode)?.connections.includes(node.id) ||
                        nodes.find(n => n.id === node.id)?.connections.includes(selectedNode)
                        : true

                    return (
                        <motion.g
                            key={node.id}
                            initial={{ opacity: 0, scale: 0 }}
                            animate={{
                                opacity: isConnected ? 1 : 0.2,
                                scale: isConnected ? 1 : 0.9
                            }}
                            transition={{ duration: 0.4, delay: idx * 0.05 }}
                            style={{ cursor: "pointer" }}
                            onClick={() => handleNodeClick(node)}
                        >
                            {/* Outer Glow Ring for Themes */}
                            {node.type === "theme" && (
                                <circle
                                    cx={node.x * dimensions.width}
                                    cy={node.y * dimensions.height}
                                    r={size * 1.5}
                                    fill="url(#glow-node)" // Use gradient or simpler fill
                                    fillOpacity="0.1"
                                    className="animate-pulse"
                                    stroke={color}
                                    strokeOpacity="0.2"
                                />
                            )}

                            {/* Main Node Circle */}
                            <motion.circle
                                cx={node.x * dimensions.width}
                                cy={node.y * dimensions.height}
                                r={isSelected ? size * 1.1 : size}
                                fill={color}
                                fillOpacity={node.type === "theme" ? 0.2 : 0.9}
                                stroke={node.type === "theme" ? color : "none"}
                                strokeWidth={node.type === "theme" ? 2 : 0}
                                filter={isSelected || node.type === "theme" ? "url(#glow-node)" : undefined}
                                whileHover={{ scale: 1.15 }}
                                transition={{ type: "spring", stiffness: 400, damping: 10 }}
                            />

                            {/* Inner Dot for Themes */}
                            {node.type === "theme" && (
                                <circle
                                    cx={node.x * dimensions.width}
                                    cy={node.y * dimensions.height}
                                    r={4}
                                    fill={color}
                                />
                            )}

                            {/* Label */}
                            <text
                                x={node.x * dimensions.width}
                                y={node.y * dimensions.height + size + 16}
                                textAnchor="middle"
                                fill="hsl(var(--foreground))"
                                fontSize={node.type === "theme" ? "12" : "11"}
                                fontWeight={node.type === "theme" ? "600" : "400"}
                                className="select-none pointer-events-none"
                                style={{
                                    textShadow: "0 2px 4px rgba(0,0,0,0.5)"
                                }}
                            >
                                {node.label}
                            </text>
                        </motion.g>
                    )
                })}
            </svg>

            {/* Legend Overlay */}
            <div className="absolute bottom-4 left-4 p-3 rounded-lg border border-white/5 bg-black/40 backdrop-blur-md flex gap-4 text-xs z-10">
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor("paper") }} />
                    <span className="text-gray-300 font-medium">Papers</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full border border-[hsl(var(--brand-secondary))]" style={{ backgroundColor: "rgba(124, 58, 237, 0.2)" }} />
                    <span className="text-gray-300 font-medium">Themes</span>
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: getNodeColor("gap") }} />
                    <span className="text-gray-300 font-medium">Gaps</span>
                </div>
            </div>

            {/* Selected Node Details Popup */}
            <AnimatePresence>
                {selectedNode && (
                    <motion.div
                        initial={{ opacity: 0, x: 20, scale: 0.95 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        exit={{ opacity: 0, x: 20, scale: 0.95 }}
                        className="absolute top-4 right-4 w-64 p-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card)/0.9)] backdrop-blur-xl shadow-2xl z-20"
                    >
                        {(() => {
                            const node = nodes.find(n => n.id === selectedNode)
                            if (!node) return null
                            return (
                                <>
                                    <div className="flex items-center justify-between mb-2">
                                        <span className="text-[10px] uppercase tracking-wider font-semibold text-[hsl(var(--muted-foreground))]">
                                            {node.type}
                                        </span>
                                        <div className="w-2 h-2 rounded-full" style={{ background: getNodeColor(node.type) }} />
                                    </div>
                                    <h4 className="font-semibold text-sm mb-2 leading-tight">
                                        {node.label}
                                    </h4>
                                    <div className="text-xs text-[hsl(var(--muted-foreground))]">
                                        Connected to {node.connections.length} other nodes
                                    </div>
                                </>
                            )
                        })()}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Generate structure that mimics the "Research Knowledge Graph" screenshot
export function generateMockNodes(): Node[] {
    return [
        // --- PAPERS (Top Row, Blue) ---
        { id: "p1", label: "Attention Is All You Need", type: "paper", x: 0.15, y: 0.20, connections: ["t1", "t2"] },
        { id: "p2", label: "BERT", type: "paper", x: 0.32, y: 0.20, connections: ["t1", "t3"] },
        { id: "p3", label: "GPT-4", type: "paper", x: 0.50, y: 0.20, connections: ["t2", "t3"] },
        { id: "p4", label: "LLaMA", type: "paper", x: 0.68, y: 0.20, connections: ["t2"] },
        { id: "p5", label: "Constitutional AI", type: "paper", x: 0.85, y: 0.20, connections: ["t3"] },

        // --- THEMES (Middle Row, Purple, Larger) ---
        { id: "t1", label: "Data Scarcity", type: "theme", x: 0.25, y: 0.50, connections: ["g1", "g3"] },
        { id: "t2", label: "Compute", type: "theme", x: 0.50, y: 0.50, connections: ["g2", "g3"] },
        { id: "t3", label: "Evaluation", type: "theme", x: 0.75, y: 0.50, connections: ["g4", "g5"] },

        // --- GAPS (Bottom Row, Red) ---
        { id: "g1", label: "Low-resource languages", type: "gap", x: 0.15, y: 0.80, connections: [] },
        { id: "g2", label: "Long context", type: "gap", x: 0.32, y: 0.80, connections: [] },
        { id: "g3", label: "Training costs", type: "gap", x: 0.50, y: 0.80, connections: [] },
        { id: "g4", label: "Evaluation gaps", type: "gap", x: 0.68, y: 0.80, connections: [] },
        { id: "g5", label: "Alignment scaling", type: "gap", x: 0.85, y: 0.80, connections: [] },
    ]
}
