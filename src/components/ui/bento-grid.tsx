import { cn } from "@/lib/utils"

export function BentoGrid({
    className,
    children,
}: {
    className?: string
    children?: React.ReactNode
}) {
    return (
        <div
            className={cn(
                "grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3",
                className
            )}
        >
            {children}
        </div>
    )
}

export function BentoGridItem({
    className,
    title,
    description,
    header,
    icon,
}: {
    className?: string
    title?: string | React.ReactNode
    description?: string | React.ReactNode
    header?: React.ReactNode
    icon?: React.ReactNode
}) {
    return (
        <div
            className={cn(
                "group/bento row-span-1 flex flex-col justify-between space-y-4 rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:border-[hsl(var(--border))]/50",
                className
            )}
        >
            {header}
            <div className="transition-transform duration-300 group-hover/bento:translate-x-1">
                {icon}
                <div className="mt-2 font-sans font-bold text-[hsl(var(--foreground))]">
                    {title}
                </div>
                <div className="font-sans text-sm text-[hsl(var(--muted-foreground))]">
                    {description}
                </div>
            </div>
        </div>
    )
}
