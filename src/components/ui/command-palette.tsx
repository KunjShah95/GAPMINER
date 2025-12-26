import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { useNavigate } from "react-router-dom"
import {
    Search,
    FileSearch,
    Lightbulb,
    BookOpen,
    Command,
    Moon,
    Sun,
    BarChart3,
    Sparkles,
    X
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CommandItem {
    id: string
    name: string
    description: string
    icon: React.ReactNode
    action: () => void
    shortcut?: string
    category: string
}

export function CommandPalette() {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState("")
    const navigate = useNavigate()

    const isDark = document.documentElement.classList.contains("dark")

    const toggleTheme = useCallback(() => {
        document.documentElement.classList.toggle("dark")
        localStorage.setItem("theme", isDark ? "light" : "dark")
        setIsOpen(false)
    }, [isDark])

    const commands: CommandItem[] = [
        {
            id: "home",
            name: "Go to Home",
            description: "Navigate to the homepage",
            icon: <BookOpen className="h-4 w-4" />,
            action: () => { navigate("/"); setIsOpen(false) },
            shortcut: "G H",
            category: "Navigation"
        },
        {
            id: "crawl",
            name: "Crawl Papers",
            description: "Start mining research papers",
            icon: <FileSearch className="h-4 w-4" />,
            action: () => { navigate("/crawl"); setIsOpen(false) },
            shortcut: "G C",
            category: "Navigation"
        },
        {
            id: "explore",
            name: "Explore Gaps",
            description: "Browse extracted research gaps",
            icon: <Search className="h-4 w-4" />,
            action: () => { navigate("/explore"); setIsOpen(false) },
            shortcut: "G E",
            category: "Navigation"
        },
        {
            id: "insights",
            name: "View Insights",
            description: "See cross-paper analysis",
            icon: <Lightbulb className="h-4 w-4" />,
            action: () => { navigate("/insights"); setIsOpen(false) },
            shortcut: "G I",
            category: "Navigation"
        },
        {
            id: "collections",
            name: "My Collections",
            description: "View saved research collections",
            icon: <BarChart3 className="h-4 w-4" />,
            action: () => { navigate("/collections"); setIsOpen(false) },
            shortcut: "G L",
            category: "Navigation"
        },
        {
            id: "assistant",
            name: "AI Research Assistant",
            description: "Chat with AI about research gaps",
            icon: <Sparkles className="h-4 w-4" />,
            action: () => { navigate("/assistant"); setIsOpen(false) },
            shortcut: "G A",
            category: "Navigation"
        },
        {
            id: "theme",
            name: "Toggle Theme",
            description: `Switch to ${isDark ? "light" : "dark"} mode`,
            icon: isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />,
            action: toggleTheme,
            shortcut: "T",
            category: "Preferences"
        }
    ]

    const filteredCommands = commands.filter(cmd =>
        cmd.name.toLowerCase().includes(query.toLowerCase()) ||
        cmd.description.toLowerCase().includes(query.toLowerCase())
    )

    // Group commands by category
    const groupedCommands = filteredCommands.reduce((acc, cmd) => {
        if (!acc[cmd.category]) acc[cmd.category] = []
        acc[cmd.category].push(cmd)
        return acc
    }, {} as Record<string, CommandItem[]>)

    // Keyboard shortcut to open
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "k") {
                e.preventDefault()
                setIsOpen(prev => !prev)
            }
            if (e.key === "Escape") {
                setIsOpen(false)
            }
        }
        document.addEventListener("keydown", handleKeyDown)
        return () => document.removeEventListener("keydown", handleKeyDown)
    }, [])

    return (
        <>
            {/* Trigger Button */}
            <button
                onClick={() => setIsOpen(true)}
                className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-[hsl(var(--muted-foreground))] border border-[hsl(var(--border))] rounded-lg hover:bg-[hsl(var(--accent))] transition-colors"
            >
                <Search className="h-4 w-4" />
                <span>Search...</span>
                <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border border-[hsl(var(--border))] bg-[hsl(var(--muted))] px-1.5 font-mono text-[10px] font-medium opacity-100">
                    <Command className="h-3 w-3" />K
                </kbd>
            </button>

            {/* Modal */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                        />

                        {/* Command Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: -20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: -20 }}
                            className="fixed top-[20%] left-1/2 -translate-x-1/2 z-50 w-full max-w-lg"
                        >
                            <div className="mx-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] shadow-2xl overflow-hidden">
                                {/* Search Input */}
                                <div className="flex items-center gap-3 px-4 py-3 border-b border-[hsl(var(--border))]">
                                    <Search className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
                                    <input
                                        type="text"
                                        placeholder="Type a command or search..."
                                        value={query}
                                        onChange={(e) => setQuery(e.target.value)}
                                        className="flex-1 bg-transparent outline-none text-[hsl(var(--foreground))] placeholder:text-[hsl(var(--muted-foreground))]"
                                        autoFocus
                                    />
                                    <button
                                        onClick={() => setIsOpen(false)}
                                        className="p-1 rounded-md hover:bg-[hsl(var(--accent))]"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </div>

                                {/* Commands List */}
                                <div className="max-h-[300px] overflow-y-auto py-2">
                                    {Object.entries(groupedCommands).map(([category, items]) => (
                                        <div key={category}>
                                            <div className="px-4 py-1.5 text-xs font-medium text-[hsl(var(--muted-foreground))]">
                                                {category}
                                            </div>
                                            {items.map((cmd) => (
                                                <button
                                                    key={cmd.id}
                                                    onClick={cmd.action}
                                                    className={cn(
                                                        "w-full flex items-center gap-3 px-4 py-2 hover:bg-[hsl(var(--accent))] transition-colors text-left"
                                                    )}
                                                >
                                                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--muted))]">
                                                        {cmd.icon}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-medium text-sm">{cmd.name}</div>
                                                        <div className="text-xs text-[hsl(var(--muted-foreground))] truncate">
                                                            {cmd.description}
                                                        </div>
                                                    </div>
                                                    {cmd.shortcut && (
                                                        <div className="flex gap-1">
                                                            {cmd.shortcut.split(" ").map((key, i) => (
                                                                <kbd
                                                                    key={i}
                                                                    className="px-1.5 py-0.5 text-[10px] font-mono bg-[hsl(var(--muted))] border border-[hsl(var(--border))] rounded"
                                                                >
                                                                    {key}
                                                                </kbd>
                                                            ))}
                                                        </div>
                                                    )}
                                                </button>
                                            ))}
                                        </div>
                                    ))}
                                    {filteredCommands.length === 0 && (
                                        <div className="px-4 py-8 text-center text-[hsl(var(--muted-foreground))]">
                                            No commands found
                                        </div>
                                    )}
                                </div>

                                {/* Footer */}
                                <div className="px-4 py-2 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))] flex items-center gap-4 text-xs text-[hsl(var(--muted-foreground))]">
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded text-[10px]">↑↓</kbd>
                                        Navigate
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded text-[10px]">↵</kbd>
                                        Select
                                    </span>
                                    <span className="flex items-center gap-1">
                                        <kbd className="px-1 py-0.5 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded text-[10px]">Esc</kbd>
                                        Close
                                    </span>
                                </div>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    )
}
