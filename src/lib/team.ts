// Team and Organization Service for GapMiner SaaS
// Manages teams, workspaces, roles, and collaboration features

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

// ============================================
// TYPES
// ============================================

export type TeamRole = "owner" | "admin" | "member" | "viewer"

export interface Team {
    id?: string
    name: string
    slug: string
    description?: string
    ownerId: string
    avatarUrl?: string
    settings: TeamSettings
    createdAt: Timestamp
    updatedAt: Timestamp
}

export interface TeamSettings {
    allowMemberInvites: boolean
    defaultMemberRole: TeamRole
    sharedCollections: boolean
    requireApproval: boolean
}

export interface TeamMember {
    id?: string
    teamId: string
    userId: string
    email: string
    name: string
    role: TeamRole
    invitedBy: string
    joinedAt: Timestamp
    lastActiveAt?: Timestamp
}

export interface TeamInvite {
    id?: string
    teamId: string
    email: string
    role: TeamRole
    invitedBy: string
    token: string
    expiresAt: Timestamp
    status: "pending" | "accepted" | "expired" | "revoked"
    createdAt: Timestamp
}

export interface AuditLogEntry {
    id?: string
    teamId: string
    userId: string
    action: string
    resourceType: "team" | "member" | "collection" | "paper" | "settings"
    resourceId?: string
    metadata?: Record<string, any>
    ipAddress?: string
    createdAt: Timestamp
}

// Collection references
const TEAMS = "teams"
const TEAM_MEMBERS = "teamMembers"
const TEAM_INVITES = "teamInvites"
const AUDIT_LOGS = "auditLogs"

// ============================================
// TEAM MANAGEMENT
// ============================================

export async function createTeam(
    name: string,
    ownerId: string,
    ownerEmail: string,
    ownerName: string
): Promise<string> {
    const now = Timestamp.now()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 50)

    const team: Omit<Team, "id"> = {
        name,
        slug,
        ownerId,
        settings: {
            allowMemberInvites: false,
            defaultMemberRole: "member",
            sharedCollections: true,
            requireApproval: false,
        },
        createdAt: now,
        updatedAt: now,
    }

    const teamRef = await addDoc(collection(db, TEAMS), team)

    // Add owner as first member
    await addTeamMember(teamRef.id, ownerId, ownerEmail, ownerName, "owner", ownerId)

    // Log the action
    await logAuditEntry(teamRef.id, ownerId, "team.created", "team", teamRef.id)

    return teamRef.id
}

export async function getTeam(teamId: string): Promise<Team | null> {
    const docRef = doc(db, TEAMS, teamId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as Team
}

export async function getUserTeams(userId: string): Promise<Team[]> {
    // Get all team memberships for user
    const memberQuery = query(
        collection(db, TEAM_MEMBERS),
        where("userId", "==", userId)
    )
    const memberSnapshot = await getDocs(memberQuery)

    if (memberSnapshot.empty) return []

    // Get all teams
    const teamIds = memberSnapshot.docs.map(doc => doc.data().teamId)
    const teams: Team[] = []

    for (const teamId of teamIds) {
        const team = await getTeam(teamId)
        if (team) teams.push(team)
    }

    return teams
}

export async function updateTeam(
    teamId: string,
    updates: Partial<Pick<Team, "name" | "description" | "settings">>,
    userId: string
): Promise<void> {
    await updateDoc(doc(db, TEAMS, teamId), {
        ...updates,
        updatedAt: Timestamp.now(),
    })

    await logAuditEntry(teamId, userId, "team.updated", "team", teamId, updates)
}

export async function deleteTeam(teamId: string, userId: string): Promise<void> {
    // Delete all members
    const membersQuery = query(
        collection(db, TEAM_MEMBERS),
        where("teamId", "==", teamId)
    )
    const membersSnapshot = await getDocs(membersQuery)
    for (const memberDoc of membersSnapshot.docs) {
        await deleteDoc(memberDoc.ref)
    }

    // Delete all invites
    const invitesQuery = query(
        collection(db, TEAM_INVITES),
        where("teamId", "==", teamId)
    )
    const invitesSnapshot = await getDocs(invitesQuery)
    for (const inviteDoc of invitesSnapshot.docs) {
        await deleteDoc(inviteDoc.ref)
    }

    // Log before deleting
    await logAuditEntry(teamId, userId, "team.deleted", "team", teamId)

    // Delete the team
    await deleteDoc(doc(db, TEAMS, teamId))
}

// ============================================
// TEAM MEMBERS
// ============================================

export async function addTeamMember(
    teamId: string,
    userId: string,
    email: string,
    name: string,
    role: TeamRole,
    invitedBy: string
): Promise<string> {
    const now = Timestamp.now()

    const member: Omit<TeamMember, "id"> = {
        teamId,
        userId,
        email,
        name,
        role,
        invitedBy,
        joinedAt: now,
        lastActiveAt: now,
    }

    const docRef = await addDoc(collection(db, TEAM_MEMBERS), member)
    await logAuditEntry(teamId, invitedBy, "member.added", "member", userId, { role })

    return docRef.id
}

export async function getTeamMembers(teamId: string): Promise<TeamMember[]> {
    const q = query(
        collection(db, TEAM_MEMBERS),
        where("teamId", "==", teamId),
        orderBy("joinedAt", "asc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamMember))
}

export async function getTeamMember(
    teamId: string,
    userId: string
): Promise<TeamMember | null> {
    const q = query(
        collection(db, TEAM_MEMBERS),
        where("teamId", "==", teamId),
        where("userId", "==", userId)
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null
    return { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TeamMember
}

export async function updateMemberRole(
    teamId: string,
    memberId: string,
    newRole: TeamRole,
    updatedBy: string
): Promise<void> {
    const memberRef = doc(db, TEAM_MEMBERS, memberId)
    await updateDoc(memberRef, { role: newRole })
    await logAuditEntry(teamId, updatedBy, "member.role_changed", "member", memberId, { newRole })
}

export async function removeTeamMember(
    teamId: string,
    memberId: string,
    removedBy: string
): Promise<void> {
    await deleteDoc(doc(db, TEAM_MEMBERS, memberId))
    await logAuditEntry(teamId, removedBy, "member.removed", "member", memberId)
}

// ============================================
// TEAM INVITES
// ============================================

function generateToken(): string {
    return Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => b.toString(16).padStart(2, "0"))
        .join("")
}

export async function createInvite(
    teamId: string,
    email: string,
    role: TeamRole,
    invitedBy: string,
    expirationDays: number = 7
): Promise<TeamInvite> {
    const now = Timestamp.now()
    const expiresAt = new Date()
    expiresAt.setDate(expiresAt.getDate() + expirationDays)

    const invite: Omit<TeamInvite, "id"> = {
        teamId,
        email: email.toLowerCase(),
        role,
        invitedBy,
        token: generateToken(),
        expiresAt: Timestamp.fromDate(expiresAt),
        status: "pending",
        createdAt: now,
    }

    const docRef = await addDoc(collection(db, TEAM_INVITES), invite)
    await logAuditEntry(teamId, invitedBy, "invite.created", "member", email, { role })

    return { id: docRef.id, ...invite }
}

export async function getInviteByToken(token: string): Promise<TeamInvite | null> {
    const q = query(
        collection(db, TEAM_INVITES),
        where("token", "==", token),
        where("status", "==", "pending")
    )
    const snapshot = await getDocs(q)
    if (snapshot.empty) return null

    const invite = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as TeamInvite

    // Check if expired
    if (invite.expiresAt.toDate() < new Date()) {
        await updateDoc(snapshot.docs[0].ref, { status: "expired" })
        return null
    }

    return invite
}

export async function acceptInvite(
    token: string,
    userId: string,
    userName: string
): Promise<{ teamId: string } | null> {
    const invite = await getInviteByToken(token)
    if (!invite) return null

    // Add user as team member
    await addTeamMember(
        invite.teamId,
        userId,
        invite.email,
        userName,
        invite.role,
        invite.invitedBy
    )

    // Mark invite as accepted
    await updateDoc(doc(db, TEAM_INVITES, invite.id!), { status: "accepted" })

    return { teamId: invite.teamId }
}

export async function getPendingInvites(teamId: string): Promise<TeamInvite[]> {
    const q = query(
        collection(db, TEAM_INVITES),
        where("teamId", "==", teamId),
        where("status", "==", "pending"),
        orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as TeamInvite))
}

export async function revokeInvite(
    inviteId: string,
    teamId: string,
    revokedBy: string
): Promise<void> {
    await updateDoc(doc(db, TEAM_INVITES, inviteId), { status: "revoked" })
    await logAuditEntry(teamId, revokedBy, "invite.revoked", "member", inviteId)
}

// ============================================
// ROLE PERMISSIONS
// ============================================

export interface RolePermissions {
    canManageTeam: boolean
    canManageMembers: boolean
    canInviteMembers: boolean
    canRemoveMembers: boolean
    canViewAuditLog: boolean
    canManageCollections: boolean
    canEditPapers: boolean
    canViewPapers: boolean
    canExport: boolean
}

export const ROLE_PERMISSIONS: Record<TeamRole, RolePermissions> = {
    owner: {
        canManageTeam: true,
        canManageMembers: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canViewAuditLog: true,
        canManageCollections: true,
        canEditPapers: true,
        canViewPapers: true,
        canExport: true,
    },
    admin: {
        canManageTeam: false,
        canManageMembers: true,
        canInviteMembers: true,
        canRemoveMembers: true,
        canViewAuditLog: true,
        canManageCollections: true,
        canEditPapers: true,
        canViewPapers: true,
        canExport: true,
    },
    member: {
        canManageTeam: false,
        canManageMembers: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canViewAuditLog: false,
        canManageCollections: true,
        canEditPapers: true,
        canViewPapers: true,
        canExport: true,
    },
    viewer: {
        canManageTeam: false,
        canManageMembers: false,
        canInviteMembers: false,
        canRemoveMembers: false,
        canViewAuditLog: false,
        canManageCollections: false,
        canEditPapers: false,
        canViewPapers: true,
        canExport: false,
    },
}

export function hasPermission(
    role: TeamRole,
    permission: keyof RolePermissions
): boolean {
    return ROLE_PERMISSIONS[role][permission]
}

// ============================================
// AUDIT LOGGING
// ============================================

export async function logAuditEntry(
    teamId: string,
    userId: string,
    action: string,
    resourceType: AuditLogEntry["resourceType"],
    resourceId?: string,
    metadata?: Record<string, any>
): Promise<void> {
    const entry: Omit<AuditLogEntry, "id"> = {
        teamId,
        userId,
        action,
        resourceType,
        resourceId,
        metadata,
        createdAt: Timestamp.now(),
    }

    await addDoc(collection(db, AUDIT_LOGS), entry)
}

export async function getAuditLogs(
    teamId: string,
    limitCount: number = 50
): Promise<AuditLogEntry[]> {
    const q = query(
        collection(db, AUDIT_LOGS),
        where("teamId", "==", teamId),
        orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs
        .slice(0, limitCount)
        .map(doc => ({ id: doc.id, ...doc.data() } as AuditLogEntry))
}

// ============================================
// TEAM CONTEXT HELPERS
// ============================================

export function getRoleDisplayName(role: TeamRole): string {
    const names: Record<TeamRole, string> = {
        owner: "Owner",
        admin: "Admin",
        member: "Member",
        viewer: "Viewer",
    }
    return names[role]
}

export function getRoleBadgeColor(role: TeamRole): string {
    const colors: Record<TeamRole, string> = {
        owner: "hsl(45, 93%, 47%)",
        admin: "hsl(270, 91%, 65%)",
        member: "hsl(217, 91%, 60%)",
        viewer: "hsl(var(--muted-foreground))",
    }
    return colors[role]
}
