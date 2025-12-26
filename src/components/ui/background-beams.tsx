"use client"
import { cn } from "@/lib/utils"
import { motion } from "framer-motion"

export function BackgroundBeams({ className }: { className?: string }) {
    const beams = [
        { id: 1, x: "10%", delay: 0 },
        { id: 2, x: "30%", delay: 0.4 },
        { id: 3, x: "50%", delay: 0.8 },
        { id: 4, x: "70%", delay: 1.2 },
        { id: 5, x: "90%", delay: 1.6 },
    ]

    return (
        <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
            <svg
                className="absolute inset-0 h-full w-full"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient id="beam-gradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="rgba(100, 100, 255, 0)" />
                        <stop offset="50%" stopColor="rgba(100, 100, 255, 0.3)" />
                        <stop offset="100%" stopColor="rgba(100, 100, 255, 0)" />
                    </linearGradient>
                </defs>
                {beams.map((beam) => (
                    <motion.line
                        key={beam.id}
                        x1={beam.x}
                        y1="0%"
                        x2={beam.x}
                        y2="100%"
                        stroke="url(#beam-gradient)"
                        strokeWidth="1"
                        initial={{ pathLength: 0, opacity: 0 }}
                        animate={{ pathLength: 1, opacity: [0, 0.5, 0] }}
                        transition={{
                            duration: 4,
                            delay: beam.delay,
                            repeat: Infinity,
                            repeatDelay: 2,
                            ease: "easeInOut",
                        }}
                    />
                ))}
            </svg>
            {/* Grid pattern */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, currentColor 1px, transparent 1px),
            linear-gradient(to bottom, currentColor 1px, transparent 1px)
          `,
                    backgroundSize: '60px 60px',
                }}
            />
        </div>
    )
}
