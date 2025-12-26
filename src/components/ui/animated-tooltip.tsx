"use client"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { useState } from "react"

export function AnimatedTooltip({
    items,
}: {
    items: {
        id: number
        name: string
        designation: string
        image?: string
    }[]
}) {
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null)

    return (
        <div className="flex flex-row items-center justify-center">
            {items.map((item) => (
                <div
                    className="group relative -mr-4"
                    key={item.id}
                    onMouseEnter={() => setHoveredIndex(item.id)}
                    onMouseLeave={() => setHoveredIndex(null)}
                >
                    <AnimatePresence>
                        {hoveredIndex === item.id && (
                            <motion.div
                                initial={{ opacity: 0, y: 20, scale: 0.6 }}
                                animate={{
                                    opacity: 1,
                                    y: 0,
                                    scale: 1,
                                    transition: {
                                        type: "spring",
                                        stiffness: 260,
                                        damping: 10,
                                    },
                                }}
                                exit={{ opacity: 0, y: 20, scale: 0.6 }}
                                className="absolute -top-16 left-1/2 z-50 flex -translate-x-1/2 flex-col items-center justify-center rounded-md bg-black px-4 py-2 text-xs shadow-xl"
                            >
                                <div className="absolute -bottom-px left-1/2 z-30 h-px w-[20%] -translate-x-1/2 bg-gradient-to-r from-transparent via-emerald-500 to-transparent" />
                                <div className="absolute -bottom-px left-1/2 z-30 h-px w-[40%] -translate-x-1/2 bg-gradient-to-r from-transparent via-sky-500 to-transparent" />
                                <div className="relative z-30 whitespace-nowrap text-base font-bold text-white">
                                    {item.name}
                                </div>
                                <div className="text-xs text-white/80">{item.designation}</div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                    <div
                        className={cn(
                            "relative flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[hsl(var(--muted))] object-cover object-top transition-transform duration-300 group-hover:z-30 group-hover:scale-110"
                        )}
                    >
                        {item.image ? (
                            <img
                                src={item.image}
                                alt={item.name}
                                className="h-full w-full rounded-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-medium">
                                {item.name.charAt(0)}
                            </span>
                        )}
                    </div>
                </div>
            ))}
        </div>
    )
}
