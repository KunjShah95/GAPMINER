// Collaboration Service for Comments and Sharing
// Handles document comments, mentions, and collaborative sharing

import {
    collection,
    doc,
    addDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    serverTimestamp,
} from "firebase/firestore"
import { db } from "./firebase"
import { sendNotification } from "./notifications"

// ============================================
// TYPES
// ============================================

export interface Comment {
    id?: string
    documentId: string // paperId or collectionId
    documentType: "paper" | "collection" | "gap"
    userId: string
    userName: string
    userAvatar?: string
    text: string
    mentions?: string[] // userIds
    parentId?: string // For threaded replies
    isResolved: boolean
    createdAt: Timestamp
    updatedAt?: Timestamp
}

export interface ShareInvitation {
    id?: string
    documentId: string
    documentType: "paper" | "collection"
    inviterId: string
    inviteeEmail: string
    role: "viewer" | "editor"
    status: "pending" | "accepted" | "declined"
    createdAt: Timestamp
}

// Collection references
const COMMENTS = "comments"
const SHARE_INVITES = "shareInvents"

// ============================================
// COMMENTS
// ============================================

export async function addComment(
    documentId: string,
    documentType: Comment["documentType"],
    userId: string,
    userName: string,
    text: string,
    options?: { parentId?: string; mentions?: string[] }
): Promise<string> {
    const comment: Omit<Comment, "id"> = {
        documentId,
        documentType,
        userId,
        userName,
        text,
        parentId: options?.parentId,
        mentions: options?.mentions,
        isResolved: false,
        createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, COMMENTS), comment)

    // Notify mentioned users
    if (options?.mentions && options.mentions.length > 0) {
        for (const mentionId of options.mentions) {
            await sendNotification(
                mentionId,
                "system_update", // Reusing type or creating new
                "New Mention",
                `${userName} mentioned you in a comment`,
                { link: `/${documentType}/${documentId}` }
            )
        }
    }

    return docRef.id
}

export async function getComments(
    documentId: string,
    documentType: Comment["documentType"]
): Promise<Comment[]> {
    const q = query(
        collection(db, COMMENTS),
        where("documentId", "==", documentId),
        where("documentType", "==", documentType),
        orderBy("createdAt", "asc")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Comment))
}

export async function resolveComment(commentId: string): Promise<void> {
    await updateDoc(doc(db, COMMENTS, commentId), {
        isResolved: true,
        updatedAt: serverTimestamp(),
    })
}

export async function deleteComment(commentId: string): Promise<void> {
    await deleteDoc(doc(db, COMMENTS, commentId))
}

// ============================================
// SHARING
// ============================================

export async function inviteCollaborator(
    documentId: string,
    documentType: ShareInvitation["documentType"],
    inviterId: string,
    inviteeEmail: string,
    role: ShareInvitation["role"] = "viewer"
): Promise<string> {
    const invite: Omit<ShareInvitation, "id"> = {
        documentId,
        documentType,
        inviterId,
        inviteeEmail,
        role,
        status: "pending",
        createdAt: Timestamp.now(),
    }

    const docRef = await addDoc(collection(db, SHARE_INVITES), invite)

    // In production, send email invite
    console.log(`[ShareInvite] Inviting ${inviteeEmail} to ${documentType} ${documentId}`)

    return docRef.id
}

export async function getPendingInvites(email: string): Promise<ShareInvitation[]> {
    const q = query(
        collection(db, SHARE_INVITES),
        where("inviteeEmail", "==", email),
        where("status", "==", "pending")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as ShareInvitation))
}

export async function respondToInvite(
    inviteId: string,
    status: "accepted" | "declined"
): Promise<void> {
    await updateDoc(doc(db, SHARE_INVITES, inviteId), {
        status,
        updatedAt: serverTimestamp(),
    })

    // If accepted, add user to document ACL (abstracted here)
    if (status === "accepted") {
        console.log(`[ShareInvite] Invite ${inviteId} accepted`)
    }
}
