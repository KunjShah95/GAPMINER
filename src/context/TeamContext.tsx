// React Context for Team State Management
// Provides team data, member info, and permissions throughout the app

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react"
import { useAuth } from "./AuthContext"
import {
    getUserTeams,
    getTeam,
    getTeamMembers,
    getTeamMember,
    hasPermission,
    type Team,
    type TeamMember,
    type TeamRole,
    type RolePermissions,
    ROLE_PERMISSIONS,
} from "@/lib/team"

interface TeamContextType {
    // Current team state
    teams: Team[]
    currentTeam: Team | null
    currentMember: TeamMember | null
    members: TeamMember[]
    isLoading: boolean

    // Team selection
    setCurrentTeamId: (teamId: string | null) => void
    currentTeamId: string | null

    // Role and permissions
    role: TeamRole | null
    permissions: RolePermissions | null
    can: (permission: keyof RolePermissions) => boolean

    // Refresh functions
    refreshTeams: () => Promise<void>
    refreshMembers: () => Promise<void>

    // Team mode
    isTeamMode: boolean
    toggleTeamMode: () => void
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

const TEAM_STORAGE_KEY = "gapminer_current_team"

export function TeamProvider({ children }: { children: ReactNode }) {
    const { user, isAuthenticated } = useAuth()
    const [teams, setTeams] = useState<Team[]>([])
    const [currentTeamId, setCurrentTeamIdState] = useState<string | null>(null)
    const [currentTeam, setCurrentTeam] = useState<Team | null>(null)
    const [currentMember, setCurrentMember] = useState<TeamMember | null>(null)
    const [members, setMembers] = useState<TeamMember[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isTeamMode, setIsTeamMode] = useState(false)

    // Derived state
    const role = currentMember?.role || null
    const permissions = role ? ROLE_PERMISSIONS[role] : null

    // Permission check helper
    const can = useCallback((permission: keyof RolePermissions): boolean => {
        if (!role) return false
        return hasPermission(role, permission)
    }, [role])

    // Set current team ID with persistence
    const setCurrentTeamId = useCallback((teamId: string | null) => {
        setCurrentTeamIdState(teamId)
        if (teamId) {
            localStorage.setItem(TEAM_STORAGE_KEY, teamId)
        } else {
            localStorage.removeItem(TEAM_STORAGE_KEY)
        }
    }, [])

    // Toggle team mode
    const toggleTeamMode = useCallback(() => {
        setIsTeamMode(prev => !prev)
    }, [])

    // Load teams for user
    const refreshTeams = useCallback(async () => {
        if (!user) {
            setTeams([])
            return
        }

        try {
            const userTeams = await getUserTeams(user.id)
            setTeams(userTeams)

            // Restore last selected team from storage
            const storedTeamId = localStorage.getItem(TEAM_STORAGE_KEY)
            if (storedTeamId && userTeams.some(t => t.id === storedTeamId)) {
                setCurrentTeamIdState(storedTeamId)
            } else if (userTeams.length > 0 && !currentTeamId) {
                // Default to first team
                setCurrentTeamIdState(userTeams[0].id!)
            }
        } catch (error) {
            console.error("Failed to load teams:", error)
        }
    }, [user, currentTeamId])

    // Load current team details
    useEffect(() => {
        async function loadTeamData() {
            if (!currentTeamId || !user) {
                setCurrentTeam(null)
                setCurrentMember(null)
                setMembers([])
                return
            }

            try {
                const [team, member] = await Promise.all([
                    getTeam(currentTeamId),
                    getTeamMember(currentTeamId, user.id),
                ])

                setCurrentTeam(team)
                setCurrentMember(member)

                if (team) {
                    const teamMembers = await getTeamMembers(currentTeamId)
                    setMembers(teamMembers)
                }
            } catch (error) {
                console.error("Failed to load team data:", error)
            }
        }

        loadTeamData()
    }, [currentTeamId, user])

    // Refresh members
    const refreshMembers = useCallback(async () => {
        if (!currentTeamId) return
        try {
            const teamMembers = await getTeamMembers(currentTeamId)
            setMembers(teamMembers)
        } catch (error) {
            console.error("Failed to refresh members:", error)
        }
    }, [currentTeamId])

    // Initial load
    useEffect(() => {
        async function init() {
            setIsLoading(true)
            if (isAuthenticated) {
                await refreshTeams()
            } else {
                setTeams([])
                setCurrentTeam(null)
                setCurrentMember(null)
                setMembers([])
            }
            setIsLoading(false)
        }

        init()
    }, [isAuthenticated, refreshTeams])

    return (
        <TeamContext.Provider
            value={{
                teams,
                currentTeam,
                currentMember,
                members,
                isLoading,
                setCurrentTeamId,
                currentTeamId,
                role,
                permissions,
                can,
                refreshTeams,
                refreshMembers,
                isTeamMode,
                toggleTeamMode,
            }}
        >
            {children}
        </TeamContext.Provider>
    )
}

export function useTeam() {
    const context = useContext(TeamContext)
    if (context === undefined) {
        throw new Error("useTeam must be used within a TeamProvider")
    }
    return context
}

// Hook for permission-gated UI
export function useTeamPermission(permission: keyof RolePermissions): boolean {
    const { can } = useTeam()
    return can(permission)
}

// Hook for requiring team context
export function useRequireTeam(): { team: Team; member: TeamMember; role: TeamRole } {
    const { currentTeam, currentMember, role } = useTeam()

    if (!currentTeam || !currentMember || !role) {
        throw new Error("useRequireTeam must be used within a team context")
    }

    return { team: currentTeam, member: currentMember, role }
}
