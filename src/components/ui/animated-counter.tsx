import { useEffect, useRef, useState } from "react"
import { motion, useInView, useSpring, useTransform } from "framer-motion"

interface AnimatedCounterProps {
    value: number
    formatValue?: (value: number) => string
    className?: string
}

export function AnimatedCounter({
    value,
    formatValue = (v) => Math.round(v).toString(),
    className = ""
}: AnimatedCounterProps) {
    const ref = useRef<HTMLSpanElement>(null)
    const isInView = useInView(ref, { once: true, margin: "-100px" })
    const [hasAnimated, setHasAnimated] = useState(false)

    const spring = useSpring(0, {
        stiffness: 100,
        damping: 30,
        restDelta: 0.001
    })

    const display = useTransform(spring, (current) => formatValue(current))

    useEffect(() => {
        if (isInView && !hasAnimated) {
            spring.set(value)
            setHasAnimated(true)
        }
    }, [isInView, hasAnimated, spring, value])

    return (
        <motion.span ref={ref} className={className}>
            {display}
        </motion.span>
    )
}

// Percentage Counter with indicator
export function PercentageCounter({
    value,
    label,
    color = "hsl(var(--brand-primary))"
}: {
    value: number
    label: string
    color?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true })

    return (
        <div ref={ref} className="space-y-2">
            <div className="flex items-center justify-between text-sm">
                <span className="text-[hsl(var(--muted-foreground))]">{label}</span>
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={isInView ? { opacity: 1 } : {}}
                    className="font-semibold"
                >
                    <AnimatedCounter value={value} formatValue={(v) => `${Math.round(v)}%`} />
                </motion.span>
            </div>
            <div className="h-2 rounded-full bg-[hsl(var(--muted))] overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${value}%` } : {}}
                    transition={{ duration: 1, ease: "easeOut", delay: 0.3 }}
                    className="h-full rounded-full"
                    style={{ backgroundColor: color }}
                />
            </div>
        </div>
    )
}

// Circular Progress
export function CircularProgress({
    value,
    size = 120,
    strokeWidth = 8,
    label
}: {
    value: number
    size?: number
    strokeWidth?: number
    label?: string
}) {
    const ref = useRef<HTMLDivElement>(null)
    const isInView = useInView(ref, { once: true })

    const radius = (size - strokeWidth) / 2
    const circumference = radius * 2 * Math.PI
    const offset = circumference - (value / 100) * circumference

    return (
        <div ref={ref} className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="hsl(var(--muted))"
                    strokeWidth={strokeWidth}
                    fill="none"
                />
                {/* Progress circle */}
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="url(#gradient)"
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeLinecap="round"
                    initial={{ strokeDasharray: circumference, strokeDashoffset: circumference }}
                    animate={isInView ? { strokeDashoffset: offset } : {}}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
                <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="hsl(var(--brand-primary))" />
                        <stop offset="100%" stopColor="hsl(var(--brand-secondary))" />
                    </linearGradient>
                </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <AnimatedCounter
                    value={value}
                    formatValue={(v) => `${Math.round(v)}%`}
                    className="text-2xl font-bold"
                />
                {label && (
                    <span className="text-xs text-[hsl(var(--muted-foreground))]">{label}</span>
                )}
            </div>
        </div>
    )
}
