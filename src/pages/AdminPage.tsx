// Admin Dashboard Page
// SaaS Management interface for administrators

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import {
    Users,
    CreditCard,
    TrendingUp,
    Activity,
    FileSearch,
    AlertTriangle,
    Crown,
    Download,
    RefreshCw,
    Search,
    MoreVertical,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"
import { db } from "@/lib/firebase"
import {
    type Subscription,
    type UsageRecord,
    getTierDisplayName,
} from "@/lib/subscription"

// Admin stats interface
interface AdminStats {
    totalUsers: number
    activeSubscriptions: number
    monthlyRevenue: number
    papersProcessedToday: number
    activeTrials: number
    churnRate: number
}

// User with subscription data
interface UserWithSubscription {
    id: string
    email: string
    name: string
    subscription?: Subscription
    usage?: UsageRecord
    lastActive?: Date
}

export function AdminPage() {
    const [stats, setStats] = useState<AdminStats | null>(null)
    const [users, setUsers] = useState<UserWithSubscription[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterTier, setFilterTier] = useState<string>("all")

    useEffect(() => {
        loadAdminData()
    }, [])

    async function loadAdminData() {
        setIsLoading(true)
        try {
            // Load subscriptions
            const subsQuery = query(
                collection(db, "subscriptions"),
                orderBy("createdAt", "desc"),
                limit(100)
            )
            const subsSnapshot = await getDocs(subsQuery)

            const subscriptions = subsSnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            })) as Subscription[]

            // Calculate stats
            const activeCount = subscriptions.filter(s => s.status === "active").length
            const trialingCount = subscriptions.filter(s => s.status === "trialing").length

            // Revenue calculation (simplified)
            const monthlyRevenue = subscriptions.reduce((acc, sub) => {
                if (sub.status === "active") {
                    switch (sub.tier) {
                        case "pro": return acc + 29
                        case "team": return acc + 99
                        case "enterprise": return acc + 499 // placeholder
                        default: return acc
                    }
                }
                return acc
            }, 0)

            setStats({
                totalUsers: subscriptions.length,
                activeSubscriptions: activeCount,
                monthlyRevenue,
                papersProcessedToday: 0, // Would need usage aggregation
                activeTrials: trialingCount,
                churnRate: 2.5, // Placeholder
            })

            // Map to user format
            const userList: UserWithSubscription[] = subscriptions.map(sub => ({
                id: sub.userId,
                email: `user-${sub.userId.slice(0, 8)}@example.com`, // Would need user lookup
                name: `User ${sub.userId.slice(0, 8)}`,
                subscription: sub,
                lastActive: sub.updatedAt?.toDate(),
            }))

            setUsers(userList)
        } catch (error) {
            console.error("Failed to load admin data:", error)
        } finally {
            setIsLoading(false)
        }
    }

    // Filter users
    const filteredUsers = users.filter(u => {
        const matchesSearch = searchQuery === "" ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.name.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesTier = filterTier === "all" ||
            u.subscription?.tier === filterTier

        return matchesSearch && matchesTier
    })

    const statCards = [
        {
            label: "Total Users",
            value: stats?.totalUsers || 0,
            icon: Users,
            trend: "+12% this month",
            color: "hsl(var(--brand-primary))",
        },
        {
            label: "Active Subscriptions",
            value: stats?.activeSubscriptions || 0,
            icon: CreditCard,
            trend: "+8% this month",
            color: "hsl(var(--gap-data))",
        },
        {
            label: "Monthly Revenue",
            value: `$${(stats?.monthlyRevenue || 0).toLocaleString()}`,
            icon: TrendingUp,
            trend: "+15% MoM",
            color: "hsl(120, 60%, 50%)",
        },
        {
            label: "Active Trials",
            value: stats?.activeTrials || 0,
            icon: Activity,
            trend: "23% conversion",
            color: "hsl(var(--brand-secondary))",
        },
    ]

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <RefreshCw className="h-8 w-8 animate-spin text-[hsl(var(--brand-primary))]" />
            </div>
        )
    }

    return (
        <div className="min-h-screen py-12">
            <div className="container-wide">
                {/* Header */}
                <div className="mb-8 flex items-start justify-between">
                    <div>
                        <div className="section-number mb-4">ADMIN</div>
                        <h1 className="heading-section mb-4">
                            SaaS
                            <br />
                            <span className="gradient-text">Dashboard</span>
                        </h1>
                        <p className="text-lg text-[hsl(var(--muted-foreground))] max-w-2xl">
                            Monitor users, subscriptions, and platform health.
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Button variant="outline" className="gap-2">
                            <Download className="h-4 w-4" />
                            Export Data
                        </Button>
                        <Button className="gap-2" onClick={loadAdminData}>
                            <RefreshCw className="h-4 w-4" />
                            Refresh
                        </Button>
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                    {statCards.map((stat, idx) => {
                        const Icon = stat.icon
                        return (
                            <motion.div
                                key={stat.label}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <Card className="card-hover h-full">
                                    <CardContent className="pt-6">
                                        <div className="flex items-start justify-between mb-4">
                                            <div
                                                className="flex h-10 w-10 items-center justify-center rounded-lg"
                                                style={{ backgroundColor: stat.color + "20" }}
                                            >
                                                <Icon className="h-5 w-5" style={{ color: stat.color }} />
                                            </div>
                                            <Badge variant="secondary" className="text-[10px]">
                                                <TrendingUp className="h-3 w-3 mr-1" />
                                                {stat.trend}
                                            </Badge>
                                        </div>
                                        <div className="text-3xl font-bold mb-1">
                                            {typeof stat.value === "number"
                                                ? stat.value.toLocaleString()
                                                : stat.value}
                                        </div>
                                        <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                            {stat.label}
                                        </p>
                                    </CardContent>
                                </Card>
                            </motion.div>
                        )
                    })}
                </div>

                {/* User Management */}
                <Card>
                    <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2">
                                <Users className="h-5 w-5" />
                                User Management
                            </CardTitle>
                            <div className="flex gap-3">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--muted-foreground))]" />
                                    <Input
                                        placeholder="Search users..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-9 w-64"
                                    />
                                </div>
                                <select
                                    value={filterTier}
                                    onChange={(e) => setFilterTier(e.target.value)}
                                    className="px-3 py-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] text-sm"
                                >
                                    <option value="all">All Tiers</option>
                                    <option value="free">Free</option>
                                    <option value="pro">Pro</option>
                                    <option value="team">Team</option>
                                    <option value="enterprise">Enterprise</option>
                                </select>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead>
                                    <tr className="border-b border-[hsl(var(--border))]">
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">User</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Tier</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Status</th>
                                        <th className="text-left py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Last Active</th>
                                        <th className="text-right py-3 px-4 text-sm font-medium text-[hsl(var(--muted-foreground))]">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredUsers.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} className="py-12 text-center text-[hsl(var(--muted-foreground))]">
                                                No users found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredUsers.map((u, idx) => (
                                            <motion.tr
                                                key={u.id}
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: idx * 0.05 }}
                                                className="border-b border-[hsl(var(--border))] hover:bg-[hsl(var(--muted))]/50"
                                            >
                                                <td className="py-3 px-4">
                                                    <div className="flex items-center gap-3">
                                                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[hsl(var(--brand-primary))] to-[hsl(var(--brand-secondary))] flex items-center justify-center text-white text-sm font-medium">
                                                            {u.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <p className="font-medium text-sm">{u.name}</p>
                                                            <p className="text-xs text-[hsl(var(--muted-foreground))]">{u.email}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <Badge
                                                        variant={u.subscription?.tier === "enterprise" ? "default" : "secondary"}
                                                        className="gap-1"
                                                    >
                                                        {u.subscription?.tier !== "free" && <Crown className="h-3 w-3" />}
                                                        {getTierDisplayName(u.subscription?.tier || "free")}
                                                    </Badge>
                                                </td>
                                                <td className="py-3 px-4">
                                                    <span className={`inline-flex items-center gap-1 text-xs font-medium ${u.subscription?.status === "active"
                                                        ? "text-green-500"
                                                        : u.subscription?.status === "trialing"
                                                            ? "text-blue-500"
                                                            : "text-yellow-500"
                                                        }`}>
                                                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                                                        {u.subscription?.status || "Active"}
                                                    </span>
                                                </td>
                                                <td className="py-3 px-4 text-sm text-[hsl(var(--muted-foreground))]">
                                                    {u.lastActive?.toLocaleDateString() || "Recently"}
                                                </td>
                                                <td className="py-3 px-4 text-right">
                                                    <Button variant="ghost" size="sm">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </td>
                                            </motion.tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-yellow-500/10">
                                <AlertTriangle className="h-6 w-6 text-yellow-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Failed Payments</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    3 users need attention
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                                <Activity className="h-6 w-6 text-blue-500" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Trial Conversions</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    12 trials ending this week
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="card-hover cursor-pointer">
                        <CardContent className="pt-6 flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-[hsl(var(--brand-primary))]/10">
                                <FileSearch className="h-6 w-6 text-[hsl(var(--brand-primary))]" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Usage Analytics</h3>
                                <p className="text-sm text-[hsl(var(--muted-foreground))]">
                                    View detailed metrics
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    )
}
