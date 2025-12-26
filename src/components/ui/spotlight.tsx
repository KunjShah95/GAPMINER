"use client"
import { cn } from "@/lib/utils"
import { useRef, useState, useEffect } from "react"

interface SpotlightProps {
    className?: string
    fill?: string
}

export function Spotlight({ className, fill }: SpotlightProps) {
    const divRef = useRef<HTMLDivElement>(null)
    const [position, setPosition] = useState({ x: 0, y: 0 })
    const [opacity, setOpacity] = useState(0)

    useEffect(() => {
        setOpacity(1)
    }, [])

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!divRef.current) return
        const rect = divRef.current.getBoundingClientRect()
        setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top })
    }

    return (
        <div
            ref={divRef}
            onMouseMove={handleMouseMove}
            className={cn(
                "pointer-events-none absolute inset-0 z-0 overflow-hidden",
                className
            )}
        >
            <div
                className="absolute inset-0 transition-opacity duration-500"
                style={{ opacity }}
            >
                <div
                    className="absolute h-[500px] w-[500px] rounded-full blur-[100px]"
                    style={{
                        background: fill || "rgba(100, 100, 255, 0.15)",
                        left: position.x - 250,
                        top: position.y - 250,
                        transition: "left 0.2s ease, top 0.2s ease",
                    }}
                />
            </div>
        </div>
    )
}
