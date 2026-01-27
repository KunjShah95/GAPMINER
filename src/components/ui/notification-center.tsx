// Notification Center UI Component
// Global notification panel with real-time updates and activity feed

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
    Bell,
    BellOff,
    Check,
    CheckCheck,
    X,
    Zap,
    Users,
    FileText,
    TrendingUp,
    Settings,
    Clock,
} from "lucide-react"
import { Button } from "./button"
import { Card, CardContent, CardHeader, CardTitle } from "./card"
import { useAuth } from "@/context/AuthContext"
import {
    getNotifications,
    markAsRead,
    markAllAsRead,
    getUnreadCount,
    type UserNotification,
    type NotificationType,
} from "@/lib/notifications"

export function NotificationCenter() {
    const { user } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [notifications, setNotifications] = useState<UserNotification[]>([])
    const [unreadCount, setUnreadCount] = useState(0)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        if (user) {
            loadNotifications()
            const interval = setInterval(updateUnreadCount, 30000)
            return () => clearInterval(interval)
        }
    }, [user])

    async function loadNotifications() {
        if (!user) return
        setIsLoading(true)
        try {
            const data = await getNotifications(user.id)
            setNotifications(data)
            await updateUnreadCount()
        } catch (error) {
            console.error("Failed to load notifications:", error)
        } finally {
            setIsLoading(false)
        }
    }

    async function updateUnreadCount() {
        if (!user) return
        const count = await getUnreadCount(user.id)
        setUnreadCount(count)
    }

    async function handleMarkAsRead(id: string) {
        await markAsRead(id)
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n))
        await updateUnreadCount()
    }

    async function handleMarkAllAsRead() {
        if (!user) return
        await markAllAsRead(user.id)
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
        setUnreadCount(0)
    }

    const typeConfig: Record<NotificationType, { icon: typeof Bell; color: string }> = {
        new_paper: { icon: FileText, color: "hsl(var(--brand-primary))" },
        gap_found: { icon: Zap, color: "hsl(45, 93%, 47%)" },
        team_invite: { icon: Users, color: "hsl(217, 91%, 60%)" },
        subscription_alert: { icon: Bell, color: "hsl(0, 84%, 60%)" },
        system_update: { icon: Settings, color: "hsl(280, 60%, 50%)" },
        weekly_digest: { icon: TrendingUp, color: "hsl(142, 71%, 45%)" },
    }

    return (
        <div className="relative">
            {/* Trigger */}
            <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                    setIsOpen(!isOpen)
                    if (!isOpen) loadNotifications()
                }}
                className="relative"
            >
                <Bell className="h-5 w-5" />
                {unreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-red-500 text-[10px] font-bold text-white flex items-center justify-center ring-2 ring-[hsl(var(--background))]">
                        {unreadCount > 9 ? "9+" : unreadCount}
                    </span>
                )}
            </Button>

            {/* Dropdown Panel */}
            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-96 z-50 bg-[hsl(var(--card))] border border-[hsl(var(--border))] rounded-2xl shadow-xl overflow-hidden"
                        >
                            <Card className="border-0 rounded-none shadow-none">
                                <CardHeader className="p-4 border-b border-[hsl(var(--border))] flex flex-row items-center justify-between space-y-0">
                                    <CardTitle className="text-sm font-bold">Notifications</CardTitle>
                                    <div className="flex gap-1">
                                        {unreadCount > 0 && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={handleMarkAllAsRead}
                                                className="h-8 text-xs gap-2"
                                            >
                                                <CheckCheck className="h-3.5 w-3.5" />
                                                Mark all read
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => setIsOpen(false)}
                                            className="h-8 w-8"
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </CardHeader>
                                <CardContent className="p-0 max-h-[400px] overflow-y-auto">
                                    {isLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 gap-3 opacity-50">
                                            <div className="h-5 w-5 border-2 border-[hsl(var(--brand-primary))] border-t-transparent rounded-full animate-spin" />
                                            <p className="text-xs">Loading notifications...</p>
                                        </div>
                                    ) : notifications.length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-16 px-8 text-center gap-4">
                                            <div className="h-12 w-12 rounded-full bg-[hsl(var(--muted))] flex items-center justify-center">
                                                <BellOff className="h-6 w-6 text-[hsl(var(--muted-foreground))]" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">All caught up!</p>
                                                <p className="text-xs text-[hsl(var(--muted-foreground))]">You don't have any new notifications.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="divide-y divide-[hsl(var(--border))]">
                                            {notifications.map((n, idx) => {
                                                const Config = typeConfig[n.type] || { icon: Bell, color: "currentColor" }
                                                const Icon = Config.icon
                                                return (
                                                    <motion.div
                                                        key={n.id}
                                                        initial={{ opacity: 0, x: -10 }}
                                                        animate={{ opacity: 1, x: 0 }}
                                                        transition={{ delay: idx * 0.05 }}
                                                        className={`p-4 flex gap-4 hover:bg-[hsl(var(--muted))]/50 transition-colors cursor-pointer relative group ${!n.isRead ? "bg-[hsl(var(--brand-primary))]/5" : ""}`}
                                                        onClick={() => {
                                                            if (!n.isRead) handleMarkAsRead(n.id!)
                                                            // Navigate if link exists
                                                        }}
                                                    >
                                                        {!n.isRead && (
                                                            <div className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-8 rounded-full bg-[hsl(var(--brand-primary))]" />
                                                        )}
                                                        <div
                                                            className="h-9 w-9 rounded-lg flex items-center justify-center shrink-0"
                                                            style={{ backgroundColor: Config.color + "15" }}
                                                        >
                                                            <Icon className="h-5 w-5" style={{ color: Config.color }} />
                                                        </div>
                                                        <div className="flex-1 min-w-0 space-y-1">
                                                            <div className="flex items-center justify-between">
                                                                <p className="text-xs font-bold truncate leading-tight">{n.title}</p>
                                                                <span className="text-[10px] text-[hsl(var(--muted-foreground))] flex items-center gap-1">
                                                                    <Clock className="h-3 w-3" />
                                                                    {new Date(n.createdAt.toDate()).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-xs text-[hsl(var(--muted-foreground))] line-clamp-2 leading-normal">
                                                                {n.message}
                                                            </p>
                                                        </div>
                                                        <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                            {!n.isRead && (
                                                                <Button
                                                                    variant="ghost"
                                                                    size="icon"
                                                                    className="h-6 w-6"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleMarkAsRead(n.id!)
                                                                    }}
                                                                >
                                                                    <Check className="h-3 w-3" />
                                                                </Button>
                                                            )}
                                                        </div>
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    )}
                                </CardContent>
                                <div className="p-3 border-t border-[hsl(var(--border))] bg-[hsl(var(--muted))]/10">
                                    <Button variant="ghost" className="w-full text-xs h-8 text-[hsl(var(--muted-foreground))] hover:text-foreground">
                                        View all activity
                                    </Button>
                                </div>
                            </Card>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    )
}
