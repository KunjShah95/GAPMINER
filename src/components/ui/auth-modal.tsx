import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { X, Mail, Lock, User, Eye, EyeOff, Sparkles, ArrowRight, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAuth } from "@/context/AuthContext"

export function AuthModal() {
    const {
        showAuthModal,
        setShowAuthModal,
        authModalMode,
        setAuthModalMode,
        login,
        register,
        loginWithGoogle
    } = useAuth()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [error, setError] = useState("")
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsLoading(true)

        try {
            if (authModalMode === "signin") {
                await login(email, password)
            } else {
                await register(name, email, password)
            }
            // Reset form
            setName("")
            setEmail("")
            setPassword("")
        } catch (err) {
            setError(err instanceof Error ? err.message : "An error occurred")
        } finally {
            setIsLoading(false)
        }
    }

    const switchMode = () => {
        setAuthModalMode(authModalMode === "signin" ? "register" : "signin")
        setError("")
    }

    const handleGoogleSignIn = async () => {
        setError("")
        setIsLoading(true)
        try {
            await loginWithGoogle()
        } catch (err) {
            setError(err instanceof Error ? err.message : "Failed to sign in with Google")
        } finally {
            setIsLoading(false)
        }
    }

    const handleClose = () => {
        setShowAuthModal(false)
        setError("")
        setName("")
        setEmail("")
        setPassword("")
    }

    return (
        <AnimatePresence>
            {showAuthModal && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm"
                        onClick={handleClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed z-[101] left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-md"
                    >
                        <div className="relative bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-2xl overflow-hidden">
                            {/* Gradient Header */}
                            <div className="relative h-24 bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] flex items-center justify-center">
                                <div className="absolute inset-0 dot-pattern opacity-20" />
                                <motion.div
                                    initial={{ scale: 0 }}
                                    animate={{ scale: 1 }}
                                    transition={{ delay: 0.1, type: "spring" }}
                                    className="relative flex h-16 w-16 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm"
                                >
                                    <Sparkles className="h-8 w-8 text-white" />
                                </motion.div>
                                <button
                                    onClick={handleClose}
                                    className="absolute top-4 right-4 p-1 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
                                >
                                    <X className="h-5 w-5 text-white" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 pt-8">
                                <motion.div
                                    key={authModalMode}
                                    initial={{ opacity: 0, x: authModalMode === "signin" ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <h2 className="text-2xl font-bold text-center mb-2">
                                        {authModalMode === "signin" ? "Welcome Back" : "Create Account"}
                                    </h2>
                                    <p className="text-center text-[hsl(var(--muted-foreground))] mb-6">
                                        {authModalMode === "signin"
                                            ? "Sign in to access your research dashboard"
                                            : "Join GapMiner to start discovering research gaps"}
                                    </p>

                                    <form onSubmit={handleSubmit} className="space-y-4">
                                        {authModalMode === "register" && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                exit={{ opacity: 0, height: 0 }}
                                            >
                                                <div className="relative">
                                                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                                    <Input
                                                        type="text"
                                                        placeholder="Full Name"
                                                        value={name}
                                                        onChange={(e) => setName(e.target.value)}
                                                        className="pl-10"
                                                    />
                                                </div>
                                            </motion.div>
                                        )}

                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                            <Input
                                                type="email"
                                                placeholder="Email Address"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                className="pl-10"
                                            />
                                        </div>

                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                            <Input
                                                type={showPassword ? "text" : "password"}
                                                placeholder="Password"
                                                value={password}
                                                onChange={(e) => setPassword(e.target.value)}
                                                className="pl-10 pr-10"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
                                            >
                                                {showPassword ? (
                                                    <EyeOff className="h-4 w-4" />
                                                ) : (
                                                    <Eye className="h-4 w-4" />
                                                )}
                                            </button>
                                        </div>

                                        {error && (
                                            <motion.div
                                                initial={{ opacity: 0, y: -10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-500 text-center"
                                            >
                                                {error}
                                            </motion.div>
                                        )}

                                        <Button
                                            type="submit"
                                            className="w-full gap-2"
                                            size="lg"
                                            disabled={isLoading}
                                        >
                                            {isLoading ? (
                                                <>
                                                    <Loader2 className="h-4 w-4 animate-spin" />
                                                    {authModalMode === "signin" ? "Signing in..." : "Creating account..."}
                                                </>
                                            ) : (
                                                <>
                                                    {authModalMode === "signin" ? "Sign In" : "Create Account"}
                                                    <ArrowRight className="h-4 w-4" />
                                                </>
                                            )}
                                        </Button>
                                    </form>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-[hsl(var(--border))]" />
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-[hsl(var(--card))] px-2 text-[hsl(var(--muted-foreground))]">
                                                or continue with
                                            </span>
                                        </div>
                                    </div>

                                    {/* Google Sign In */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full gap-2"
                                        size="lg"
                                        onClick={handleGoogleSignIn}
                                        disabled={isLoading}
                                    >
                                        <svg className="h-5 w-5" viewBox="0 0 24 24">
                                            <path
                                                fill="currentColor"
                                                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                                            />
                                            <path
                                                fill="currentColor"
                                                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                            />
                                        </svg>
                                        Continue with Google
                                    </Button>

                                    <div className="mt-6 text-center">
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {authModalMode === "signin"
                                                ? "Don't have an account?"
                                                : "Already have an account?"}
                                            <button
                                                onClick={switchMode}
                                                className="ml-1 text-[hsl(var(--brand-primary))] hover:underline font-medium"
                                            >
                                                {authModalMode === "signin" ? "Sign up" : "Sign in"}
                                            </button>
                                        </p>
                                    </div>
                                </motion.div>
                            </div>

                            {/* Footer Note */}
                            <div className="px-6 py-4 bg-[hsl(var(--muted))] border-t border-[hsl(var(--border))]">
                                <p className="text-xs text-center text-[hsl(var(--muted-foreground))]">
                                    By continuing, you agree to our Terms of Service and Privacy Policy
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    )
}
