// Performance optimization hooks
import { useCallback, useMemo, useState, useRef, useEffect } from 'react'

/**
 * Copy to clipboard with feedback state
 */
export function useClipboard(resetDelayMs: number = 2000) {
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

    const copy = useCallback(async (id: string, text: string) => {
        try {
            await navigator.clipboard.writeText(text)
            setCopiedId(id)

            // Clear any existing timeout
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }

            // Reset after delay
            timeoutRef.current = setTimeout(() => {
                setCopiedId(null)
            }, resetDelayMs)

            return true
        } catch {
            return false
        }
    }, [resetDelayMs])

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timeoutRef.current) {
                clearTimeout(timeoutRef.current)
            }
        }
    }, [])

    return { copiedId, copy, isCopied: (id: string) => copiedId === id }
}

/**
 * Async action with loading state
 */
export function useAsyncAction<T, Args extends unknown[]>(
    action: (...args: Args) => Promise<T>
) {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<Error | null>(null)
    const [data, setData] = useState<T | null>(null)

    const execute = useCallback(async (...args: Args): Promise<T | null> => {
        setIsLoading(true)
        setError(null)
        try {
            const result = await action(...args)
            setData(result)
            return result
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Unknown error'))
            return null
        } finally {
            setIsLoading(false)
        }
    }, [action])

    const reset = useCallback(() => {
        setIsLoading(false)
        setError(null)
        setData(null)
    }, [])

    return { execute, isLoading, error, data, reset }
}

/**
 * Track loading state for multiple async operations by ID
 */
export function useLoadingStates() {
    const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set())

    const startLoading = useCallback((id: string) => {
        setLoadingIds(prev => new Set([...prev, id]))
    }, [])

    const stopLoading = useCallback((id: string) => {
        setLoadingIds(prev => {
            const next = new Set(prev)
            next.delete(id)
            return next
        })
    }, [])

    const isLoading = useCallback((id: string) => {
        return loadingIds.has(id)
    }, [loadingIds])

    return { startLoading, stopLoading, isLoading, loadingIds }
}

/**
 * Toggle selection for sets (useful for multi-select UIs)
 */
export function useSetToggle<T>(initial: Set<T> = new Set()) {
    const [items, setItems] = useState<Set<T>>(initial)

    const toggle = useCallback((item: T) => {
        setItems(prev => {
            const next = new Set(prev)
            if (next.has(item)) {
                next.delete(item)
            } else {
                next.add(item)
            }
            return next
        })
    }, [])

    const add = useCallback((item: T) => {
        setItems(prev => new Set([...prev, item]))
    }, [])

    const remove = useCallback((item: T) => {
        setItems(prev => {
            const next = new Set(prev)
            next.delete(item)
            return next
        })
    }, [])

    const clear = useCallback(() => {
        setItems(new Set())
    }, [])

    const has = useCallback((item: T) => items.has(item), [items])

    return { items, toggle, add, remove, clear, has, size: items.size }
}

/**
 * Stable callback that always has the latest closure but never changes reference
 */
export function useStableCallback<T extends (...args: unknown[]) => unknown>(callback: T): T {
    const callbackRef = useRef(callback)

    // Update ref on each render
    useEffect(() => {
        callbackRef.current = callback
    })

    // Return stable function that calls the latest callback
    return useMemo(
        () => ((...args: Parameters<T>) => callbackRef.current(...args)) as T,
        []
    )
}

// Re-export for backwards compatibility
export { useClipboard as usePerformance }
