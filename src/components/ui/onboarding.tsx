// Onboarding Flow Component
// Guides new users through initial setup and feature discovery

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Sparkles,
    FileSearch,
    Lightbulb,
    Users,
    Zap,
    ChevronRight,
    ChevronLeft,
    Check,
    X,
    Rocket,
    Target,
    Brain,
} from "lucide-react"
import { Button } from "./button"
import { Badge } from "./badge"
import { useAuth } from "@/context/AuthContext"

interface OnboardingStep {
    id: string
    title: string
    description: string
    icon: typeof Sparkles
    color: string
    action?: () => void
    actionLabel?: string
}

const ONBOARDING_STORAGE_KEY = "gapminer_onboarding_complete"
const ONBOARDING_STEP_KEY = "gapminer_onboarding_step"

export function OnboardingFlow({ onComplete }: { onComplete?: () => void }) {
    const { user } = useAuth()
    const [currentStep, setCurrentStep] = useState(0)
    const [isVisible, setIsVisible] = useState(false)

    useEffect(() => {
        // Check if onboarding is completed
        const isComplete = localStorage.getItem(ONBOARDING_STORAGE_KEY)
        if (!isComplete && user) {
            setIsVisible(true)
            // Restore step
            const savedStep = localStorage.getItem(ONBOARDING_STEP_KEY)
            if (savedStep) {
                setCurrentStep(parseInt(savedStep, 10))
            }
        }
    }, [user])

    const steps: OnboardingStep[] = [
        {
            id: "welcome",
            title: "Welcome to GapMiner",
            description: "Your AI-powered research gap analysis platform. Discover unexplored research opportunities in seconds.",
            icon: Rocket,
            color: "hsl(var(--brand-primary))",
        },
        {
            id: "crawl",
            title: "Analyze Research Papers",
            description: "Paste any academic paper URL and our AI will extract key insights, methodologies, and identify research gaps.",
            icon: FileSearch,
            color: "hsl(var(--gap-data))",
            actionLabel: "Try a sample paper",
        },
        {
            id: "gaps",
            title: "Discover Research Gaps",
            description: "AI identifies unexplored areas, methodology limitations, and opportunities for new research directions.",
            icon: Lightbulb,
            color: "hsl(45, 93%, 47%)",
        },
        {
            id: "recommendations",
            title: "Smart Recommendations",
            description: "Get personalized paper suggestions and research trend predictions based on your interests.",
            icon: Brain,
            color: "hsl(var(--brand-secondary))",
        },
        {
            id: "teams",
            title: "Collaborate with Teams",
            description: "Invite colleagues, share collections, and work together on research gap analysis projects.",
            icon: Users,
            color: "hsl(217, 91%, 60%)",
        },
        {
            id: "complete",
            title: "You're All Set!",
            description: "Start exploring research gaps and accelerate your academic discovery journey.",
            icon: Target,
            color: "hsl(120, 60%, 50%)",
            actionLabel: "Get Started",
        },
    ]

    function handleNext() {
        if (currentStep < steps.length - 1) {
            const nextStep = currentStep + 1
            setCurrentStep(nextStep)
            localStorage.setItem(ONBOARDING_STEP_KEY, nextStep.toString())
        } else {
            completeOnboarding()
        }
    }

    function handlePrevious() {
        if (currentStep > 0) {
            const prevStep = currentStep - 1
            setCurrentStep(prevStep)
            localStorage.setItem(ONBOARDING_STEP_KEY, prevStep.toString())
        }
    }

    function handleSkip() {
        completeOnboarding()
    }

    function completeOnboarding() {
        localStorage.setItem(ONBOARDING_STORAGE_KEY, "true")
        localStorage.removeItem(ONBOARDING_STEP_KEY)
        setIsVisible(false)
        onComplete?.()
    }

    if (!isVisible) return null

    const step = steps[currentStep]
    const Icon = step.icon
    const isLastStep = currentStep === steps.length - 1

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center">
                {/* Backdrop */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/70 backdrop-blur-md"
                />

                {/* Content */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="relative z-10 w-full max-w-lg mx-4"
                >
                    {/* Skip button */}
                    <button
                        onClick={handleSkip}
                        className="absolute -top-12 right-0 text-white/60 hover:text-white text-sm flex items-center gap-1 transition-colors"
                    >
                        Skip tour
                        <X className="h-4 w-4" />
                    </button>

                    <div className="bg-[hsl(var(--card))] rounded-2xl border border-[hsl(var(--border))] shadow-2xl overflow-hidden">
                        {/* Progress */}
                        <div className="flex gap-1 p-4 pb-0">
                            {steps.map((_, idx) => (
                                <div
                                    key={idx}
                                    className={`h-1 flex-1 rounded-full transition-colors ${idx <= currentStep
                                            ? "bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                                            : "bg-[hsl(var(--muted))]"
                                        }`}
                                />
                            ))}
                        </div>

                        {/* Step content */}
                        <div className="p-8 text-center">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={step.id}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    {/* Icon */}
                                    <motion.div
                                        className="h-20 w-20 rounded-2xl flex items-center justify-center mx-auto mb-6"
                                        style={{ backgroundColor: step.color + "20" }}
                                        initial={{ scale: 0.8 }}
                                        animate={{ scale: 1 }}
                                        transition={{ delay: 0.1 }}
                                    >
                                        <Icon className="h-10 w-10" style={{ color: step.color }} />
                                    </motion.div>

                                    {/* Text */}
                                    <h2 className="text-2xl font-bold mb-3">{step.title}</h2>
                                    <p className="text-[hsl(var(--muted-foreground))] max-w-sm mx-auto">
                                        {step.description}
                                    </p>

                                    {/* Step indicator */}
                                    <Badge variant="secondary" className="mt-6">
                                        Step {currentStep + 1} of {steps.length}
                                    </Badge>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Navigation */}
                        <div className="p-6 pt-0 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                onClick={handlePrevious}
                                disabled={currentStep === 0}
                                className="gap-2"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </Button>

                            <Button
                                onClick={handleNext}
                                className="gap-2 min-w-[120px]"
                            >
                                {isLastStep ? (
                                    <>
                                        <Zap className="h-4 w-4" />
                                        Get Started
                                    </>
                                ) : (
                                    <>
                                        Next
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    )
}

// Contextual tooltip for feature discovery
export function FeatureTooltip({
    feature,
    children,
    position = "bottom",
}: {
    feature: string
    children: React.ReactNode
    position?: "top" | "bottom" | "left" | "right"
}) {
    const [isVisible, setIsVisible] = useState(false)
    const [isDismissed, setIsDismissed] = useState(false)

    useEffect(() => {
        const dismissed = localStorage.getItem(`tooltip_dismissed_${feature}`)
        if (dismissed) {
            setIsDismissed(true)
        } else {
            // Show after a delay
            const timer = setTimeout(() => setIsVisible(true), 2000)
            return () => clearTimeout(timer)
        }
    }, [feature])

    function handleDismiss() {
        localStorage.setItem(`tooltip_dismissed_${feature}`, "true")
        setIsDismissed(true)
        setIsVisible(false)
    }

    const positionClasses = {
        top: "bottom-full left-1/2 -translate-x-1/2 mb-2",
        bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
        left: "right-full top-1/2 -translate-y-1/2 mr-2",
        right: "left-full top-1/2 -translate-y-1/2 ml-2",
    }

    return (
        <div className="relative inline-block">
            {children}
            <AnimatePresence>
                {isVisible && !isDismissed && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9 }}
                        className={`absolute z-50 ${positionClasses[position]}`}
                    >
                        <div className="bg-[hsl(var(--card))] border border-[hsl(var(--brand-primary))]/30 rounded-lg shadow-lg p-3 max-w-xs">
                            <div className="flex items-start gap-2">
                                <Sparkles className="h-4 w-4 text-[hsl(var(--brand-primary))] shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <p className="text-sm font-medium mb-1">New Feature!</p>
                                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                                        Try out {feature} to enhance your research workflow.
                                    </p>
                                </div>
                                <button
                                    onClick={handleDismiss}
                                    className="text-[hsl(var(--muted-foreground))] hover:text-foreground"
                                >
                                    <X className="h-3 w-3" />
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

// Checklist for getting started
export function GettingStartedChecklist() {
    const [tasks, setTasks] = useState([
        { id: "profile", label: "Complete your profile", completed: false },
        { id: "first_paper", label: "Analyze your first paper", completed: false },
        { id: "collection", label: "Create a collection", completed: false },
        { id: "team", label: "Invite a team member", completed: false },
    ])

    useEffect(() => {
        // Load completion state
        const saved = localStorage.getItem("gapminer_onboarding_tasks")
        if (saved) {
            setTasks(JSON.parse(saved))
        }
    }, [])

    function toggleTask(id: string) {
        const updated = tasks.map(t =>
            t.id === id ? { ...t, completed: !t.completed } : t
        )
        setTasks(updated)
        localStorage.setItem("gapminer_onboarding_tasks", JSON.stringify(updated))
    }

    const completedCount = tasks.filter(t => t.completed).length
    const progress = (completedCount / tasks.length) * 100

    if (completedCount === tasks.length) return null

    return (
        <div className="p-4 rounded-xl bg-gradient-to-br from-[hsl(var(--brand-primary))]/5 to-[hsl(var(--brand-secondary))]/5 border border-[hsl(var(--brand-primary))]/10">
            <div className="flex items-center gap-3 mb-3">
                <div className="h-8 w-8 rounded-lg bg-[hsl(var(--brand-primary))]/10 flex items-center justify-center">
                    <Rocket className="h-4 w-4 text-[hsl(var(--brand-primary))]" />
                </div>
                <div className="flex-1">
                    <h3 className="text-sm font-medium">Getting Started</h3>
                    <p className="text-xs text-[hsl(var(--muted-foreground))]">
                        {completedCount}/{tasks.length} completed
                    </p>
                </div>
            </div>

            <div className="h-1.5 rounded-full bg-[hsl(var(--muted))] mb-3 overflow-hidden">
                <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))]"
                    initial={{ width: 0 }}
                    animate={{ width: `${progress}%` }}
                />
            </div>

            <div className="space-y-2">
                {tasks.map(task => (
                    <button
                        key={task.id}
                        onClick={() => toggleTask(task.id)}
                        className={`w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors ${task.completed
                                ? "text-[hsl(var(--muted-foreground))] line-through"
                                : "hover:bg-[hsl(var(--muted))]/50"
                            }`}
                    >
                        <div
                            className={`h-4 w-4 rounded-full border flex items-center justify-center ${task.completed
                                    ? "bg-green-500 border-green-500"
                                    : "border-[hsl(var(--border))]"
                                }`}
                        >
                            {task.completed && <Check className="h-3 w-3 text-white" />}
                        </div>
                        {task.label}
                    </button>
                ))}
            </div>
        </div>
    )
}
