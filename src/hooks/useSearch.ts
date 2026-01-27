// Custom hook for debounced search functionality
import { useState, useCallback, useEffect, useRef } from 'react'
import { useDebouncedCallback } from 'use-debounce'

interface UseSearchOptions {
    debounceMs?: number
    minQueryLength?: number
}

interface UseSearchResult<T> {
    query: string
    setQuery: (query: string) => void
    results: T[]
    isSearching: boolean
    error: string | null
    clear: () => void
}

/**
 * Hook for debounced search with loading and error states
 */
export function useSearch<T>(
    searchFn: (query: string) => Promise<T[]>,
    options: UseSearchOptions = {}
): UseSearchResult<T> {
    const { debounceMs = 300, minQueryLength = 2 } = options

    const [query, setQueryState] = useState('')
    const [results, setResults] = useState<T[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Track if component is mounted to avoid state updates after unmount
    const isMounted = useRef(true)

    useEffect(() => {
        isMounted.current = true
        return () => { isMounted.current = false }
    }, [])

    const performSearch = useDebouncedCallback(
        async (searchQuery: string) => {
            if (searchQuery.length < minQueryLength) {
                setResults([])
                return
            }

            setIsSearching(true)
            setError(null)

            try {
                const searchResults = await searchFn(searchQuery)
                if (isMounted.current) {
                    setResults(searchResults)
                }
            } catch (err) {
                if (isMounted.current) {
                    setError(err instanceof Error ? err.message : 'Search failed')
                    setResults([])
                }
            } finally {
                if (isMounted.current) {
                    setIsSearching(false)
                }
            }
        },
        debounceMs
    )

    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery)
        performSearch(newQuery)
    }, [performSearch])

    const clear = useCallback(() => {
        setQueryState('')
        setResults([])
        setError(null)
        setIsSearching(false)
    }, [])

    return {
        query,
        setQuery,
        results,
        isSearching,
        error,
        clear,
    }
}

/**
 * Hook for filtering data with debounce
 */
export function useFilteredData<T>(
    data: T[],
    filterFn: (item: T, query: string) => boolean,
    options: UseSearchOptions = {}
): UseSearchResult<T> & { allData: T[] } {
    const { debounceMs = 150, minQueryLength = 0 } = options

    const [query, setQueryState] = useState('')
    const [filteredResults, setFilteredResults] = useState<T[]>(data)
    const [isFiltering, setIsFiltering] = useState(false)

    const performFilter = useDebouncedCallback(
        (searchQuery: string, items: T[]) => {
            if (searchQuery.length < minQueryLength) {
                setFilteredResults(items)
            } else {
                const filtered = items.filter(item => filterFn(item, searchQuery))
                setFilteredResults(filtered)
            }
            setIsFiltering(false)
        },
        debounceMs
    )

    // Re-filter when data changes
    useEffect(() => {
        performFilter(query, data)
    }, [data, query, performFilter])

    const setQuery = useCallback((newQuery: string) => {
        setQueryState(newQuery)
        setIsFiltering(true)
        performFilter(newQuery, data)
    }, [data, performFilter])

    const clear = useCallback(() => {
        setQueryState('')
        setFilteredResults(data)
        setIsFiltering(false)
    }, [data])

    return {
        query,
        setQuery,
        results: filteredResults,
        isSearching: isFiltering,
        error: null,
        clear,
        allData: data,
    }
}
