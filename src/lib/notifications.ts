// Email Notification and Digest Service
// Handles user preferences, digest scheduling, and notification triggers

import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    query,
    where,
    orderBy,
    Timestamp,
    limit,
} from "firebase/firestore"
import { db } from "./firebase"

// ============================================
// TYPES
// ============================================

export type NotificationType = "new_paper" | "gap_found" | "team_invite" | "subscription_alert" | "system_update" | "weekly_digest"

export interface NotificationPreference {
    userId: string
    emailEnabled: boolean
    pushEnabled: boolean
    types: Record<NotificationType, boolean>
    digestFrequency: "never" | "daily" | "weekly"
    lastDigestAt?: Timestamp
}

export interface UserNotification {
    id?: string
    userId: string
    type: NotificationType
    title: string
    message: string
    link?: string
    isRead: boolean
    metadata?: Record<string, any>
    createdAt: Timestamp
}

export interface EmailTemplate {
    subject: string
    body: string
    ctaLink?: string
    ctaLabel?: string
}

// Collection references
const NOTIFICATIONS = "notifications"
const NOTIFICATION_PREFS = "notificationPreferences"

// ============================================
// PREFERENCES
// ============================================

export async function getUserPreferences(userId: string): Promise<NotificationPreference> {
    const docRef = doc(db, NOTIFICATION_PREFS, userId)
    const docSnap = await getDoc(docRef)

    if (!docSnap.exists()) {
        const defaultPrefs: NotificationPreference = {
            userId,
            emailEnabled: true,
            pushEnabled: true,
            types: {
                new_paper: true,
                gap_found: true,
                team_invite: true,
                subscription_alert: true,
                system_update: true,
                weekly_digest: true,
            },
            digestFrequency: "weekly",
        }
        await updateDoc(docRef, defaultPrefs as any)
        return defaultPrefs
    }

    return docSnap.data() as NotificationPreference
}

export async function updatePreferences(
    userId: string,
    updates: Partial<NotificationPreference>
): Promise<void> {
    const docRef = doc(db, NOTIFICATION_PREFS, userId)
    await updateDoc(docRef, updates)
}

// ============================================
// NOTIFICATION TRIGGERING
// ============================================

export async function sendNotification(
    userId: string,
    type: NotificationType,
    title: string,
    message: string,
    options?: { link?: string; metadata?: Record<string, any> }
): Promise<string> {
    const now = Timestamp.now()

    // Check user preferences
    const prefs = await getUserPreferences(userId)
    if (!prefs.types[type]) return "skipped_by_pref"

    const notification: Omit<UserNotification, "id"> = {
        userId,
        type,
        title,
        message,
        link: options?.link,
        isRead: false,
        metadata: options?.metadata,
        createdAt: now,
    }

    const docRef = await addDoc(collection(db, NOTIFICATIONS), notification)

    // In production, this would trigger an email via SendGrid/AWS SES Cloud Function
    if (prefs.emailEnabled) {
        await logEmailTrigger(userId, type, title, message)
    }

    return docRef.id
}

async function logEmailTrigger(
    userId: string,
    type: NotificationType,
    title: string,
    _message: string
) {
    // Simulated email trigger
    console.log(`[EmailTrigger] To: ${userId}, Type: ${type}, Subject: ${title}`)
}

// ============================================
// IN-APP NOTIFICATIONS
// ============================================

export async function getNotifications(
    userId: string,
    limitCount: number = 20
): Promise<UserNotification[]> {
    const q = query(
        collection(db, NOTIFICATIONS),
        where("userId", "==", userId),
        orderBy("createdAt", "desc"),
        limit(limitCount)
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as UserNotification))
}

export async function markAsRead(notificationId: string): Promise<void> {
    await updateDoc(doc(db, NOTIFICATIONS, notificationId), {
        isRead: true,
    })
}

export async function markAllAsRead(userId: string): Promise<void> {
    const q = query(
        collection(db, NOTIFICATIONS),
        where("userId", "==", userId),
        where("isRead", "==", false)
    )
    const snapshot = await getDocs(q)
    const promises = snapshot.docs.map(doc => updateDoc(doc.ref, { isRead: true }))
    await Promise.all(promises)
}

// ============================================
// DIGEST GENERATION (Simulated)
// ============================================

export function generateDigestSubject(frequency: "daily" | "weekly"): string {
    return frequency === "daily"
        ? "Your GapMiner Daily Research Insights"
        : "GapMiner Weekly: Research Trend Report"
}

export async function getUnreadCount(userId: string): Promise<number> {
    const q = query(
        collection(db, NOTIFICATIONS),
        where("userId", "==", userId),
        where("isRead", "==", false)
    )
    const snapshot = await getDocs(q)
    return snapshot.size
}
