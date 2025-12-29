import { Link, useLocation, useNavigate } from "react-router-dom"
import { FileSearch, Github, Twitter, Linkedin, Mail, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/context/AuthContext"

export function Footer() {
    const location = useLocation()
    const navigate = useNavigate()
    const { isAuthenticated, setShowAuthModal, setAuthModalMode } = useAuth()

    const scrollToSection = (href: string) => {
        if (location.pathname !== "/") {
            navigate("/")
            setTimeout(() => {
                document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
            }, 100)
        } else {
            document.querySelector(href)?.scrollIntoView({ behavior: "smooth" })
        }
    }

    const handleGetStarted = () => {
        if (isAuthenticated) {
            navigate("/explore")
        } else {
            setAuthModalMode("register")
            setShowAuthModal(true)
        }
    }

    return (
        <footer className="border-t border-[hsl(var(--border))] bg-[hsl(var(--background))]">
            <div className="container-wide py-16">
                <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-5">
                    {/* Brand */}
                    <div className="lg:col-span-2">
                        <Link to="/" className="flex items-center gap-2 mb-4">
                            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[hsl(var(--primary))] text-[hsl(var(--primary-foreground))]">
                                <FileSearch className="h-5 w-5" />
                            </div>
                            <span className="text-xl font-bold tracking-tight">
                                Gap<span className="text-[hsl(var(--brand-primary))]">Miner</span>
                            </span>
                        </Link>
                        <p className="text-sm text-[hsl(var(--muted-foreground))] max-w-sm mb-6">
                            AI-powered research gap discovery platform. Automatically extract limitations
                            and unsolved problems from academic papers to find your next breakthrough idea.
                        </p>
                        <Button size="sm" className="gap-2" onClick={handleGetStarted}>
                            {isAuthenticated ? "Go to Explore" : "Get Started Free"}
                            <ArrowRight className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-semibold mb-4">Navigation</h4>
                        <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                            <li>
                                <button
                                    onClick={() => scrollToSection("#about")}
                                    className="hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    About Us
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection("#features")}
                                    className="hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    Features
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection("#how-it-works")}
                                    className="hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    How It Works
                                </button>
                            </li>
                            <li>
                                <button
                                    onClick={() => scrollToSection("#contact")}
                                    className="hover:text-[hsl(var(--foreground))] transition-colors"
                                >
                                    Contact
                                </button>
                            </li>
                        </ul>
                    </div>

                    {/* Product */}
                    <div>
                        <h4 className="font-semibold mb-4">Product</h4>
                        <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                            <li>
                                <Link to="/explore" className="hover:text-[hsl(var(--foreground))] transition-colors">
                                    Explore Gaps
                                </Link>
                            </li>
                            <li>
                                <Link to="/crawl" className="hover:text-[hsl(var(--foreground))] transition-colors">
                                    Batch Crawl
                                </Link>
                            </li>
                            <li>
                                <Link to="/explore" className="hover:text-[hsl(var(--foreground))] transition-colors">
                                    Explore Gaps
                                </Link>
                            </li>
                            <li>
                                <Link to="/insights" className="hover:text-[hsl(var(--foreground))] transition-colors">
                                    Insights
                                </Link>
                            </li>
                            <li>
                                <Link to="/assistant" className="hover:text-[hsl(var(--foreground))] transition-colors">
                                    AI Assistant
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Supported Sources */}
                    <div>
                        <h4 className="font-semibold mb-4">Supported Sources</h4>
                        <ul className="space-y-3 text-sm text-[hsl(var(--muted-foreground))]">
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                arXiv
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                OpenReview
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                NeurIPS / ICML
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
                                ACL Anthology
                            </li>
                            <li className="flex items-center gap-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-yellow-500" />
                                More coming soon
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Bottom */}
                <div className="mt-16 pt-8 border-t border-[hsl(var(--border))] flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
                        <p>© 2024 GapMiner. All rights reserved.</p>
                        <div className="flex items-center gap-4">
                            <button className="hover:text-[hsl(var(--foreground))] transition-colors">
                                Privacy Policy
                            </button>
                            <button className="hover:text-[hsl(var(--foreground))] transition-colors">
                                Terms of Service
                            </button>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <a
                            href="mailto:kunjkshahdeveloper@gmail.com"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <Mail className="h-5 w-5" />
                        </a>
                        <a
                            href="https://github.com/KunjShah95"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <Github className="h-5 w-5" />
                        </a>
                        <a
                            href="https://x.com/kunjshah_dev"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <Twitter className="h-5 w-5" />
                        </a>
                        <a
                            href="https://linkedin.com/in/kunjshah05"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
                        >
                            <Linkedin className="h-5 w-5" />
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    )
}
