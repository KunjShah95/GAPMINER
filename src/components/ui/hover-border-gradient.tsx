"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"
import React from "react"

export function HoverBorderGradient({
    children,
    className,
    containerClassName,
    as: Component = "button",
    ...props
}: {
    children: React.ReactNode
    className?: string
    containerClassName?: string
    as?: React.ElementType
    [key: string]: unknown
}) {
    return (
        <Component
            className={cn(
                "group relative flex items-center justify-center overflow-hidden rounded-xl p-[1px] transition-all duration-300",
                containerClassName
            )}
            {...props}
        >
            {/* Animated gradient border */}
            <motion.div
                className="absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        "linear-gradient(90deg, #3b82f6, #8b5cf6, #06b6d4, #3b82f6)",
                    backgroundSize: "300% 100%",
                }}
                animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                }}
                transition={{
                    duration: 3,
                    repeat: Infinity,
                    ease: "linear",
                }}
            />
            {/* Static border */}
            <div className="absolute inset-0 rounded-xl border border-[hsl(var(--border))] group-hover:border-transparent" />
            {/* Content */}
            <div
                className={cn(
                    "relative z-10 rounded-[11px] bg-[hsl(var(--background))] px-6 py-3 text-sm font-medium transition-colors",
                    className
                )}
            >
                {children}
            </div>
        </Component>
    )
}
