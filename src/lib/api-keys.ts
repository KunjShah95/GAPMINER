// API Key Management Service
// Handles developer API keys for programmatic access to GapMiner

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

export interface APIKey {
    id?: string
    userId: string
    name: string
    key: string
    prefix: string // First 8 chars for display
    hashedKey: string // SHA-256 hash for validation
    permissions: APIPermission[]
    rateLimit: number // Requests per minute
    lastUsedAt?: Timestamp
    expiresAt?: Timestamp
    isActive: boolean
    createdAt: Timestamp
    metadata?: {
        ipWhitelist?: string[]
        description?: string
        environment?: "development" | "staging" | "production"
    }
}

export type APIPermission =
    | "papers:read"
    | "papers:write"
    | "gaps:read"
    | "gaps:write"
    | "collections:read"
    | "collections:write"
    | "batch:execute"
    | "analytics:read"

export interface APIKeyUsage {
    keyId: string
    endpoint: string
    method: string
    statusCode: number
    responseTime: number
    timestamp: Timestamp
}

// Collection reference
const API_KEYS = "apiKeys"
const API_KEY_USAGE = "apiKeyUsage"

// ============================================
// KEY GENERATION
// ============================================

function generateAPIKey(): string {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"
    const prefix = "gm_" // GapMiner prefix
    const randomPart = Array.from(crypto.getRandomValues(new Uint8Array(32)))
        .map(b => chars[b % chars.length])
        .join("")
    return prefix + randomPart
}

async function hashKey(key: string): Promise<string> {
    const encoder = new TextEncoder()
    const data = encoder.encode(key)
    const hashBuffer = await crypto.subtle.digest("SHA-256", data)
    const hashArray = Array.from(new Uint8Array(hashBuffer))
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("")
}

// ============================================
// API KEY CRUD
// ============================================

export async function createAPIKey(
    userId: string,
    name: string,
    permissions: APIPermission[],
    options?: {
        rateLimit?: number
        expiresInDays?: number
        metadata?: APIKey["metadata"]
    }
): Promise<{ key: string; apiKey: APIKey }> {
    const key = generateAPIKey()
    const hashedKey = await hashKey(key)
    const prefix = key.slice(0, 11) // "gm_" + first 8 chars

    const expiresAt = options?.expiresInDays
        ? Timestamp.fromDate(new Date(Date.now() + options.expiresInDays * 24 * 60 * 60 * 1000))
        : undefined

    const apiKey: Omit<APIKey, "id"> = {
        userId,
        name,
        key: "***", // Never store the actual key
        prefix,
        hashedKey,
        permissions,
        rateLimit: options?.rateLimit || 60,
        isActive: true,
        createdAt: Timestamp.now(),
        expiresAt,
        metadata: options?.metadata,
    }

    const docRef = await addDoc(collection(db, API_KEYS), apiKey)

    return {
        key, // Return the actual key only once
        apiKey: { id: docRef.id, ...apiKey },
    }
}

export async function getAPIKeys(userId: string): Promise<APIKey[]> {
    const q = query(
        collection(db, API_KEYS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as APIKey))
}

export async function getAPIKey(keyId: string): Promise<APIKey | null> {
    const docRef = doc(db, API_KEYS, keyId)
    const docSnap = await getDoc(docRef)
    if (!docSnap.exists()) return null
    return { id: docSnap.id, ...docSnap.data() } as APIKey
}

export async function updateAPIKey(
    keyId: string,
    updates: Partial<Pick<APIKey, "name" | "permissions" | "rateLimit" | "isActive" | "metadata">>
): Promise<void> {
    await updateDoc(doc(db, API_KEYS, keyId), updates)
}

export async function deleteAPIKey(keyId: string): Promise<void> {
    await deleteDoc(doc(db, API_KEYS, keyId))
}

export async function revokeAPIKey(keyId: string): Promise<void> {
    await updateDoc(doc(db, API_KEYS, keyId), {
        isActive: false,
    })
}

// ============================================
// KEY VALIDATION
// ============================================

export async function validateAPIKey(key: string): Promise<APIKey | null> {
    if (!key.startsWith("gm_")) return null

    const hashedKey = await hashKey(key)

    const q = query(
        collection(db, API_KEYS),
        where("hashedKey", "==", hashedKey),
        where("isActive", "==", true)
    )
    const snapshot = await getDocs(q)

    if (snapshot.empty) return null

    const apiKey = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as APIKey

    // Check expiration
    if (apiKey.expiresAt && apiKey.expiresAt.toDate() < new Date()) {
        await revokeAPIKey(apiKey.id!)
        return null
    }

    // Update last used
    await updateDoc(doc(db, API_KEYS, apiKey.id!), {
        lastUsedAt: Timestamp.now(),
    })

    return apiKey
}

export function hasPermission(apiKey: APIKey, permission: APIPermission): boolean {
    return apiKey.permissions.includes(permission)
}

// ============================================
// USAGE TRACKING
// ============================================

export async function logAPIUsage(
    keyId: string,
    endpoint: string,
    method: string,
    statusCode: number,
    responseTime: number
): Promise<void> {
    const usage: Omit<APIKeyUsage, "id"> = {
        keyId,
        endpoint,
        method,
        statusCode,
        responseTime,
        timestamp: Timestamp.now(),
    }

    await addDoc(collection(db, API_KEY_USAGE), usage)
}

export async function getAPIKeyUsage(
    keyId: string,
    days: number = 7
): Promise<APIKeyUsage[]> {
    const since = new Date()
    since.setDate(since.getDate() - days)

    const q = query(
        collection(db, API_KEY_USAGE),
        where("keyId", "==", keyId),
        where("timestamp", ">=", Timestamp.fromDate(since)),
        orderBy("timestamp", "desc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as unknown as APIKeyUsage))
}

// ============================================
// PERMISSION HELPERS
// ============================================

export const PERMISSION_GROUPS = {
    read: ["papers:read", "gaps:read", "collections:read", "analytics:read"] as APIPermission[],
    write: ["papers:write", "gaps:write", "collections:write"] as APIPermission[],
    full: [
        "papers:read", "papers:write",
        "gaps:read", "gaps:write",
        "collections:read", "collections:write",
        "batch:execute", "analytics:read"
    ] as APIPermission[],
}

export function getPermissionLabel(permission: APIPermission): string {
    const labels: Record<APIPermission, string> = {
        "papers:read": "Read Papers",
        "papers:write": "Write Papers",
        "gaps:read": "Read Gaps",
        "gaps:write": "Write Gaps",
        "collections:read": "Read Collections",
        "collections:write": "Write Collections",
        "batch:execute": "Execute Batch Jobs",
        "analytics:read": "Read Analytics",
    }
    return labels[permission]
}
