import { Link, useNavigate } from "react-router-dom"
import { motion, useInView, AnimatePresence } from "framer-motion"
import { useRef, useState } from "react"
import {
    FileSearch,
    Search,
    Lightbulb,
    ArrowRight,
    Sparkles,
    Zap,
    Target,
    LogIn,
    UserPlus,
    Users,
    Globe,
    BookOpen,
    Brain,
    Layers,
    Mail,
    Send,
    CheckCircle2,
    GraduationCap,
    Building2,
    Award,
    TrendingUp,
    Clock,
    Shield,
    MessageSquare,
    MapPin,
    Check,
    Plus,
    Minus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { BackgroundBeams } from "@/components/ui/background-beams"
import { TextGenerateEffect } from "@/components/ui/text-generate-effect"
import { HoverBorderGradient } from "@/components/ui/hover-border-gradient"
import { useAuth } from "@/context/AuthContext"


// Stats data
const stats = [
    { value: "50K+", label: "Papers Analyzed", icon: BookOpen },
    { value: "200K+", label: "Gaps Discovered", icon: Lightbulb },
    { value: "10K+", label: "Researchers", icon: Users },
    { value: "98%", label: "Accuracy Rate", icon: Target },
]

// Features data
const features = [
    {
        icon: FileSearch,
        title: "Batch Paper Crawling",
        description: "Paste multiple URLs and extract limitations from papers in parallel. Support for arXiv, OpenReview, NeurIPS, ACL, and more.",
        color: "from-blue-500 to-cyan-500",
    },
    {
        icon: Brain,
        title: "AI-Powered Extraction",
        description: "Gemini-powered analysis transforms raw limitations into clean, actionable problem statements automatically.",
        color: "from-purple-500 to-pink-500",
    },
    {
        icon: Search,
        title: "Smart Gap Exploration",
        description: "Browse extracted gaps with powerful filters by keyword, venue, problem type, and research area.",
        color: "from-cyan-500 to-blue-500",
    },
    {
        icon: Layers,
        title: "Cross-Paper Insights",
        description: "Discover recurring themes across papers to find high-impact research directions others might miss.",
        color: "from-yellow-500 to-orange-500",
    },
    {
        icon: Zap,
        title: "Research Acceleration",
        description: "Turn weeks of literature review into minutes of automated discovery and analysis.",
        color: "from-green-500 to-emerald-500",
    },
    {
        icon: Shield,
        title: "Secure & Private",
        description: "Your research data is encrypted and never shared. Full control over your collections and exports.",
        color: "from-red-500 to-rose-500",
    },
]

// How it works steps
const howItWorks = [
    {
        step: "01",
        title: "Paste Paper URLs",
        description: "Simply paste one or more research paper URLs from arXiv, OpenReview, or conference websites.",
        icon: Globe,
    },
    {
        step: "02",
        title: "AI Analyzes",
        description: "Our AI engine automatically extracts limitations, future work, and research gaps from each paper.",
        icon: Brain,
    },
    {
        step: "03",
        title: "Explore & Export",
        description: "Browse, filter, and export discovered gaps. Build collections and track research themes.",
        icon: Sparkles,
    },
]

// Testimonials
const testimonials = [
    {
        quote: "GapMiner saved me weeks of literature review. I found my PhD topic in just one afternoon!",
        author: "Dr. Sarah Chen",
        role: "ML Researcher, Stanford",
        avatar: "SC",
    },
    {
        quote: "The cross-paper insights feature is incredible. It surfaces patterns I never would have noticed manually.",
        author: "Prof. James Miller",
        role: "Computer Science, MIT",
        avatar: "JM",
    },
    {
        quote: "As a research lab director, GapMiner has become an essential tool for our team's literature review process.",
        author: "Dr. Emily Johnson",
        role: "Research Director, DeepMind",
        avatar: "EJ",
    },
]

// Trusted by organizations
const trustedBy = [
    "Stanford", "MIT", "DeepMind", "OpenAI", "Google Research", "Meta AI"
]

// Pricing data
const pricing = [
    {
        name: "Starter",
        price: "$0",
        description: "Perfect for individual researchers starting their journey.",
        features: [
            "50 papers per month",
            "Basic AI analysis",
            "Standard extraction",
            "Export to CSV",
            "Community support"
        ],
        cta: "Start for Free",
        popular: false
    },
    {
        name: "Pro",
        price: "$29",
        description: "For serious researchers needing deeper insights.",
        features: [
            "Unlimited papers",
            "Advanced AI insights",
            "Cross-paper analysis",
            "Priority extraction",
            "PDF reports",
            "Email support"
        ],
        cta: "Get Pro",
        popular: true
    },
    {
        name: "Team",
        price: "$99",
        description: "Collaborative power for research labs and groups.",
        features: [
            "Everything in Pro",
            "5 Team members",
            "Collaborative collections",
            "Shared comments",
            "API access",
            "Dedicated support"
        ],
        cta: "Contact Sales",
        popular: false
    }
]

// FAQ data
const faqs = [
    {
        question: "How does the AI analysis work?",
        answer: "GapMiner uses advanced large language models (LLMs) to read and understand research papers. It specifically identifies limitations mentioned by authors and infers potential future work based on the context of the research."
    },
    {
        question: "Is my research data secure?",
        answer: "Yes, absolutely. We use enterprise-grade encryption for all data. Your search history and collections are private to you and are never used to train our public models."
    },
    {
        question: "Can I export the results?",
        answer: "Yes! You can export your findings in various formats including CSV, JSON, and PDF reports. This makes it easy to integrate GapMiner into your existing literature review workflow."
    },
    {
        question: "What sources do you support?",
        answer: "We currently support direct PDF URLs, arXiv links, OpenReview, ACL Anthology, and most major publisher pages. We are constantly adding support for more repositories."
    }
]

const FAQItem = ({ question, answer }: { question: string, answer: string }) => {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border border-[hsl(var(--border))] rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center justify-between w-full p-4 text-left font-medium bg-[hsl(var(--card))] hover:bg-[hsl(var(--muted))] transition-colors"
            >
                {question}
                {isOpen ? <Minus className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="p-4 pt-0 bg-[hsl(var(--card))] text-[hsl(var(--muted-foreground))]">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export function HomePage() {
    const { isAuthenticated, user, setShowAuthModal, setAuthModalMode } = useAuth()
    const navigate = useNavigate()
    const [contactForm, setContactForm] = useState({ name: "", email: "", message: "" })
    const [contactSubmitted, setContactSubmitted] = useState(false)

    // Refs for scroll animations
    const aboutRef = useRef(null)
    const featuresRef = useRef(null)
    const howItWorksRef = useRef(null)
    const pricingRef = useRef(null)
    const faqRef = useRef(null)
    const contactRef = useRef(null)

    const aboutInView = useInView(aboutRef, { once: true, margin: "-100px" })
    const featuresInView = useInView(featuresRef, { once: true, margin: "-100px" })
    const howItWorksInView = useInView(howItWorksRef, { once: true, margin: "-100px" })
    const pricingInView = useInView(pricingRef, { once: true, margin: "-100px" })
    const faqInView = useInView(faqRef, { once: true, margin: "-100px" })
    const contactInView = useInView(contactRef, { once: true, margin: "-100px" })

    const handleSignIn = () => {
        setAuthModalMode("signin")
        setShowAuthModal(true)
    }

    const handleRegister = () => {
        setAuthModalMode("register")
        setShowAuthModal(true)
    }

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/explore")
        } else {
            setAuthModalMode("register")
            setShowAuthModal(true)
        }
    }

    const handleContactSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // Simulate form submission
        setTimeout(() => {
            setContactSubmitted(true)
            setContactForm({ name: "", email: "", message: "" })
        }, 500)
    }

    const scrollToSection = (id: string) => {
        document.getElementById(id)?.scrollIntoView({ behavior: "smooth" })
    }

    return (
        <div className="relative">
            {/* ============================================
                HERO SECTION
            ============================================ */}
            <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
                <BackgroundBeams className="opacity-40" />

                {/* Floating Elements */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <motion.div
                        animate={{ y: [0, -20, 0], rotate: [0, 5, 0] }}
                        transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                        className="absolute top-1/4 left-[10%] w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/10"
                    />
                    <motion.div
                        animate={{ y: [0, 20, 0], rotate: [0, -5, 0] }}
                        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut", delay: 1 }}
                        className="absolute top-1/3 right-[15%] w-16 h-16 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 backdrop-blur-sm border border-white/10"
                    />
                    <motion.div
                        animate={{ y: [0, -15, 0] }}
                        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 2 }}
                        className="absolute bottom-1/3 left-[20%] w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 backdrop-blur-sm border border-white/10"
                    />
                </div>

                <div className="container-wide relative z-10 py-20">
                    <div className="text-center max-w-5xl mx-auto">
                        {/* Badge */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsl(var(--brand-primary))]/10 border border-[hsl(var(--brand-primary))]/20 text-sm text-[hsl(var(--brand-primary))] font-medium mb-8"
                        >
                            <Sparkles className="h-4 w-4" />
                            AI-Powered Research Gap Discovery
                        </motion.div>

                        {/* Main Heading */}
                        <motion.h1
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.1 }}
                            className="text-5xl md:text-6xl lg:text-7xl font-bold tracking-tight mb-6"
                        >
                            Discover What Research
                            <br />
                            <span className="gradient-text">Couldn't Solve</span>
                        </motion.h1>

                        {/* Subtitle */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                            className="max-w-2xl mx-auto mb-10"
                        >
                            <TextGenerateEffect
                                words="GapMiner uses AI to extract limitations and unsolved problems from research papers, helping you find your next breakthrough idea in minutes, not weeks."
                                className="text-xl text-[hsl(var(--muted-foreground))]"
                            />
                        </motion.div>

                        {/* CTA Buttons */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.4 }}
                            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
                        >
                            {isAuthenticated ? (
                                <>
                                    <Link to="/explore">
                                        <HoverBorderGradient
                                            containerClassName="rounded-xl"
                                            className="flex items-center gap-2 font-semibold px-8 py-3"
                                        >
                                            <Search className="h-5 w-5" />
                                            Go to Explore
                                            <ArrowRight className="h-4 w-4" />
                                        </HoverBorderGradient>
                                    </Link>
                                </>
                            ) : (
                                <>
                                    <HoverBorderGradient
                                        containerClassName="rounded-xl"
                                        className="flex items-center gap-2 font-semibold px-8 py-3 cursor-pointer"
                                        onClick={handleGetStarted}
                                    >
                                        <Sparkles className="h-5 w-5" />
                                        Start Free Trial
                                        <ArrowRight className="h-4 w-4" />
                                    </HoverBorderGradient>
                                    <Button
                                        variant="outline"
                                        size="lg"
                                        className="gap-2 px-8"
                                        onClick={handleSignIn}
                                    >
                                        <LogIn className="h-5 w-5" />
                                        Sign In
                                    </Button>
                                </>
                            )}
                        </motion.div>

                        {/* Trust Badge */}
                        {isAuthenticated ? (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-sm text-[hsl(var(--muted-foreground))]"
                            >
                                Welcome back, <span className="font-semibold text-[hsl(var(--foreground))]">{user?.name}</span>! 🎉
                            </motion.p>
                        ) : (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.6 }}
                                className="text-sm text-[hsl(var(--muted-foreground))]"
                            >
                                ✨ No credit card required • 14-day free trial • Cancel anytime
                            </motion.p>
                        )}

                        {/* Stats */}
                        <motion.div
                            initial={{ opacity: 0, y: 30 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6, delay: 0.8 }}
                            className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-16 pt-16 border-t border-[hsl(var(--border))]"
                        >
                            {stats.map((stat, idx) => (
                                <div key={idx} className="text-center">
                                    <div className="flex justify-center mb-2">
                                        <stat.icon className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
                                    </div>
                                    <div className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</div>
                                    <div className="text-sm text-[hsl(var(--muted-foreground))]">{stat.label}</div>
                                </div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Scroll Indicator */}
                <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.2 }}
                    onClick={() => scrollToSection("about")}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors cursor-pointer"
                >
                    <span className="text-xs">Scroll to explore</span>
                    <div className="h-10 w-6 rounded-full border-2 border-current flex items-start justify-center p-1 scroll-indicator" />
                </motion.button>
            </section>

            {/* ============================================
                ABOUT US SECTION
            ============================================ */}
            <section id="about" ref={aboutRef} className="py-24 bg-[hsl(var(--muted))]">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={aboutInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="section-number mb-4">01 / ABOUT US</div>
                        <div className="grid lg:grid-cols-2 gap-12 items-center">
                            <div>
                                <h2 className="heading-section mb-6">
                                    We're on a mission to
                                    <br />
                                    <span className="gradient-text">accelerate scientific discovery</span>
                                </h2>
                                <p className="text-lg text-[hsl(var(--muted-foreground))] mb-6">
                                    GapMiner was born from a simple frustration: spending weeks reading research papers
                                    just to find what problems remain unsolved. We built the tool we wished existed.
                                </p>
                                <p className="text-[hsl(var(--muted-foreground))] mb-8">
                                    Our AI-powered platform automatically extracts limitations, future work suggestions,
                                    and research gaps from academic papers. Whether you're a PhD student looking for a thesis
                                    topic, a researcher seeking new directions, or a lab manager exploring opportunities,
                                    GapMiner helps you discover what's unsolved.
                                </p>

                                {/* Mission Cards */}
                                <div className="grid sm:grid-cols-2 gap-4">
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-primary))]/10">
                                            <GraduationCap className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">For Researchers</h4>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Find novel research directions faster</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3 p-4 rounded-xl bg-[hsl(var(--card))] border border-[hsl(var(--border))]">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[hsl(var(--brand-secondary))]/10">
                                            <Building2 className="h-5 w-5 text-[hsl(var(--brand-secondary))]" />
                                        </div>
                                        <div>
                                            <h4 className="font-semibold mb-1">For Organizations</h4>
                                            <p className="text-sm text-[hsl(var(--muted-foreground))]">Scale your research capabilities</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Visual Element */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))]/20 to-[hsl(var(--brand-secondary))]/20 rounded-3xl blur-3xl" />
                                <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-3xl p-8 space-y-6">
                                    {/* Achievement badges */}
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                        <Award className="h-8 w-8 text-yellow-500" />
                                        <div>
                                            <div className="font-semibold">Trusted by Top Universities</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Used by researchers at Stanford, MIT, and more</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                        <TrendingUp className="h-8 w-8 text-green-500" />
                                        <div>
                                            <div className="font-semibold">10x Faster Discovery</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Reduce literature review time dramatically</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4 p-4 rounded-xl bg-[hsl(var(--muted))]">
                                        <Clock className="h-8 w-8 text-blue-500" />
                                        <div>
                                            <div className="font-semibold">Real-Time Updates</div>
                                            <div className="text-sm text-[hsl(var(--muted-foreground))]">Continuously updated with new research</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                FEATURES SECTION
            ============================================ */}
            <section id="features" ref={featuresRef} className="py-24">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="section-number mb-4">02 / FEATURES</div>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-section mb-4">
                                Everything you need to
                                <br />
                                <span className="gradient-text">accelerate research discovery</span>
                            </h2>
                            <p className="text-lg text-[hsl(var(--muted-foreground))]">
                                Powerful features designed specifically for researchers, academics, and anyone exploring the frontiers of knowledge.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {features.map((feature, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={featuresInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                >
                                    <Card className="card-hover h-full group">
                                        <CardContent className="pt-6">
                                            <div className={`flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-to-br ${feature.color} mb-4 group-hover:scale-110 transition-transform`}>
                                                <feature.icon className="h-7 w-7 text-white" />
                                            </div>
                                            <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                                            <p className="text-[hsl(var(--muted-foreground))]">{feature.description}</p>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                HOW IT WORKS SECTION
            ============================================ */}
            <section id="how-it-works" ref={howItWorksRef} className="py-24 bg-[hsl(var(--muted))]">
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="section-number mb-4">03 / HOW IT WORKS</div>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-section mb-4">
                                Three simple steps to
                                <br />
                                <span className="gradient-text">discover research gaps</span>
                            </h2>
                            <p className="text-lg text-[hsl(var(--muted-foreground))]">
                                Get started in minutes. No complex setup required.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {howItWorks.map((step, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: idx * 0.15 }}
                                    className="relative"
                                >
                                    {/* Connector Line */}
                                    {idx < howItWorks.length - 1 && (
                                        <div className="hidden md:block absolute top-16 left-[60%] w-[80%] h-0.5 bg-gradient-to-r from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] opacity-30" />
                                    )}

                                    <div className="text-center">
                                        <div className="relative inline-flex mb-6">
                                            <div className="flex h-32 w-32 items-center justify-center rounded-3xl bg-gradient-to-br from-[hsl(var(--brand-primary))]/10 to-[hsl(var(--brand-secondary))]/10 border border-[hsl(var(--border))]">
                                                <step.icon className="h-12 w-12 text-[hsl(var(--brand-primary))]" />
                                            </div>
                                            <div className="absolute -top-2 -right-2 flex h-10 w-10 items-center justify-center rounded-full bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] font-bold text-lg">
                                                {step.step}
                                            </div>
                                        </div>
                                        <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                                        <p className="text-[hsl(var(--muted-foreground))]">{step.description}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>

                        {/* CTA */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={howItWorksInView ? { opacity: 1, y: 0 } : {}}
                            transition={{ duration: 0.4, delay: 0.5 }}
                            className="text-center mt-12"
                        >
                            <Button size="xl" className="gap-2" onClick={handleGetStarted}>
                                <Sparkles className="h-5 w-5" />
                                Try It Now — It's Free
                                <ArrowRight className="h-5 w-5" />
                            </Button>
                        </motion.div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                TESTIMONIALS SECTION
            ============================================ */}
            <section className="py-24">
                <div className="container-wide">
                    <div className="section-number mb-4">04 / TESTIMONIALS</div>
                    <div className="text-center max-w-3xl mx-auto mb-16">
                        <h2 className="heading-section mb-4">
                            Loved by researchers
                            <br />
                            <span className="gradient-text">around the world</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-3 gap-6">
                        {testimonials.map((testimonial, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.4, delay: idx * 0.1 }}
                            >
                                <Card className="h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex gap-1 mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <svg key={i} className="h-5 w-5 text-yellow-500 fill-current" viewBox="0 0 20 20">
                                                    <path d="M10 15l-5.878 3.09 1.123-6.545L.489 6.91l6.572-.955L10 0l2.939 5.955 6.572.955-4.756 4.635 1.123 6.545z" />
                                                </svg>
                                            ))}
                                        </div>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-6 italic">"{testimonial.quote}"</p>
                                        <div className="flex items-center gap-3">
                                            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] text-white font-semibold text-sm">
                                                {testimonial.avatar}
                                            </div>
                                            <div>
                                                <div className="font-semibold">{testimonial.author}</div>
                                                <div className="text-sm text-[hsl(var(--muted-foreground))]">{testimonial.role}</div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        ))}
                    </div>

                    {/* Trusted By */}
                    <div className="mt-16 text-center">
                        <p className="text-sm text-[hsl(var(--muted-foreground))] mb-6">Trusted by researchers at leading institutions</p>
                        <div className="flex flex-wrap items-center justify-center gap-8 opacity-60">
                            {trustedBy.map((org, idx) => (
                                <div key={idx} className="text-lg font-semibold text-[hsl(var(--muted-foreground))]">
                                    {org}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>




            <section id="pricing" ref={pricingRef} className="py-24 bg-[hsl(var(--muted))]" >
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="section-number mb-4">05 / PRICING</div>
                        <div className="text-center max-w-3xl mx-auto mb-16">
                            <h2 className="heading-section mb-4">
                                Simple, transparent
                                <br />
                                <span className="gradient-text">pricing for everyone</span>
                            </h2>
                            <p className="text-lg text-[hsl(var(--muted-foreground))]">
                                Choose the plan that best fits your research needs.
                            </p>
                        </div>

                        <div className="grid md:grid-cols-3 gap-8">
                            {pricing.map((plan, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={pricingInView ? { opacity: 1, y: 0 } : {}}
                                    transition={{ duration: 0.4, delay: idx * 0.1 }}
                                >
                                    <div className={`relative h-full p-8 rounded-2xl border ${plan.popular ? 'border-[hsl(var(--brand-primary))] bg-[hsl(var(--card))] shadow-lg shadow-[hsl(var(--brand-primary))]/20' : 'border-[hsl(var(--border))] bg-[hsl(var(--card))]'}`}>
                                        {plan.popular && (
                                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[hsl(var(--brand-primary))] text-white text-sm font-medium">
                                                Most Popular
                                            </div>
                                        )}
                                        <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                                        <div className="flex items-baseline gap-1 mb-4">
                                            <span className="text-4xl font-bold">{plan.price}</span>
                                            <span className="text-[hsl(var(--muted-foreground))]">/month</span>
                                        </div>
                                        <p className="text-[hsl(var(--muted-foreground))] mb-6">{plan.description}</p>

                                        <ul className="space-y-4 mb-8">
                                            {plan.features.map((feature, fIdx) => (
                                                <li key={fIdx} className="flex items-start gap-3">
                                                    <Check className="h-5 w-5 text-[hsl(var(--brand-primary))] shrink-0" />
                                                    <span className="text-sm">{feature}</span>
                                                </li>
                                            ))}
                                        </ul>

                                        <Button
                                            className={`w-full ${plan.popular ? '' : 'bg-[hsl(var(--muted))] text-[hsl(var(--foreground))] hover:bg-[hsl(var(--muted-foreground))]/20'}`}
                                            variant={plan.popular ? "default" : "outline"}
                                            onClick={handleGetStarted}
                                        >
                                            {plan.cta}
                                        </Button>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                FAQ SECTION
            ============================================ */}
            <section id="faq" ref={faqRef} className="py-24" >
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={faqInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >
                        <div className="section-number mb-4">06 / FAQ</div>
                        <div className="grid md:grid-cols-2 gap-12">
                            <div>
                                <h2 className="heading-section mb-6">
                                    Frequently asked
                                    <br />
                                    <span className="gradient-text">questions</span>
                                </h2>
                                <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8">
                                    Can't find the answer you're looking for? Reach out to our team.
                                </p>
                                <Button variant="outline" className="gap-2" onClick={() => scrollToSection("contact")}>
                                    <MessageSquare className="h-4 w-4" />
                                    Contact Support
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {faqs.map((faq, idx) => (
                                    <FAQItem key={idx} question={faq.question} answer={faq.answer} />
                                ))}
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                CONTACT US SECTION
            ============================================ */}
            <section id="contact" ref={contactRef} className="py-24 bg-[hsl(var(--muted))]" >
                <div className="container-wide">
                    <motion.div
                        initial={{ opacity: 0, y: 40 }}
                        animate={contactInView ? { opacity: 1, y: 0 } : {}}
                        transition={{ duration: 0.6 }}
                    >

                        <div className="section-number mb-4">07 / CONTACT US</div>
                        <div className="grid lg:grid-cols-2 gap-12">
                            <div>
                                <h2 className="heading-section mb-6">
                                    Have questions?
                                    <br />
                                    <span className="gradient-text">We'd love to hear from you</span>
                                </h2>
                                <p className="text-lg text-[hsl(var(--muted-foreground))] mb-8">
                                    Whether you have a question about features, pricing, or anything else, our team is ready to answer all your questions.
                                </p>

                                {/* Contact Info */}
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-primary))]/10">
                                            <Mail className="h-5 w-5 text-[hsl(var(--brand-primary))]" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Email</div>
                                            <div className="text-[hsl(var(--muted-foreground))]">kunjkshahdeveloper@gmail.com</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[hsl(var(--brand-secondary))]/10">
                                            <MessageSquare className="h-5 w-5 text-[hsl(var(--brand-secondary))]" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Live Chat</div>
                                            <div className="text-[hsl(var(--muted-foreground))]">Available Mon-Fri, 9am-6pm PST</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-500/10">
                                            <MapPin className="h-5 w-5 text-green-500" />
                                        </div>
                                        <div>
                                            <div className="font-semibold">Location</div>
                                            <div className="text-[hsl(var(--muted-foreground))]">San Francisco, CA</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Contact Form */}
                            <div className="relative">
                                <div className="absolute inset-0 bg-gradient-to-br from-[hsl(var(--brand-primary))]/10 to-[hsl(var(--brand-secondary))]/10 rounded-3xl blur-2xl" />
                                <Card className="relative">
                                    <CardContent className="pt-6">
                                        {contactSubmitted ? (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.9 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                className="flex flex-col items-center justify-center py-12 text-center"
                                            >
                                                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-500/10 mb-4">
                                                    <CheckCircle2 className="h-8 w-8 text-green-500" />
                                                </div>
                                                <h3 className="text-xl font-semibold mb-2">Message Sent!</h3>
                                                <p className="text-[hsl(var(--muted-foreground))]">
                                                    We'll get back to you as soon as possible.
                                                </p>
                                                <Button
                                                    variant="outline"
                                                    className="mt-6"
                                                    onClick={() => setContactSubmitted(false)}
                                                >
                                                    Send Another Message
                                                </Button>
                                            </motion.div>
                                        ) : (
                                            <form onSubmit={handleContactSubmit} className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Name</label>
                                                    <Input
                                                        placeholder="Your name"
                                                        value={contactForm.name}
                                                        onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Email</label>
                                                    <Input
                                                        type="email"
                                                        placeholder="your@email.com"
                                                        value={contactForm.email}
                                                        onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-sm font-medium mb-2">Message</label>
                                                    <Textarea
                                                        placeholder="How can we help you?"
                                                        rows={4}
                                                        value={contactForm.message}
                                                        onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                                                        required
                                                    />
                                                </div>
                                                <Button type="submit" className="w-full gap-2" size="lg">
                                                    <Send className="h-4 w-4" />
                                                    Send Message
                                                </Button>
                                            </form>
                                        )}
                                    </CardContent>
                                </Card>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* ============================================
                FINAL CTA SECTION
            ============================================ */}
            <section className="py-24 bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))] relative overflow-hidden" >
                {/* Background Pattern */}
                < div className="absolute inset-0 dot-pattern opacity-10" />

                <div className="container-wide text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-4xl md:text-5xl font-bold mb-6">
                            Ready to discover what's unsolved?
                        </h2>
                        <p className="text-xl opacity-80 max-w-2xl mx-auto mb-10">
                            Join thousands of researchers who are already using GapMiner to find their next breakthrough idea.
                        </p>
                        {isAuthenticated ? (
                            <Link to="/explore">
                                <Button
                                    size="xl"
                                    variant="secondary"
                                    className="gap-2 bg-white text-black hover:bg-white/90"
                                >
                                    <Search className="h-5 w-5" />
                                    Go to Explore
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                            </Link>
                        ) : (
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button
                                    size="xl"
                                    variant="secondary"
                                    className="gap-2 bg-white text-black hover:bg-white/90"
                                    onClick={handleRegister}
                                >
                                    <UserPlus className="h-5 w-5" />
                                    Create Free Account
                                    <ArrowRight className="h-5 w-5" />
                                </Button>
                                <Button
                                    size="lg"
                                    variant="ghost"
                                    className="gap-2 text-white/80 hover:text-white hover:bg-white/10"
                                    onClick={handleSignIn}
                                >
                                    <LogIn className="h-5 w-5" />
                                    Sign In
                                </Button>
                            </div>
                        )}
                    </motion.div>
                </div>
            </section>
        </div>
    )
}
