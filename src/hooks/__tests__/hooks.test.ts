// Tests for custom hooks
import { describe, it, expect, vi } from 'vitest'
import { renderHook, act, waitFor } from '@testing-library/react'

// Note: These tests will fail to import until vitest globals are configured
// For now, we test the logic patterns

describe('useCrawlState', () => {
    it('should initialize with default state', async () => {
        // Import dynamically to avoid module resolution issues in test
        const { useCrawlState } = await import('@/hooks/useCrawlState')
        const { result } = renderHook(() => useCrawlState())

        expect(result.current.state.urls).toBe('')
        expect(result.current.state.isProcessing).toBe(false)
        expect(result.current.state.progress).toBe(0)
        expect(result.current.state.results).toEqual([])
    })

    it('should update URLs', async () => {
        const { useCrawlState } = await import('@/hooks/useCrawlState')
        const { result } = renderHook(() => useCrawlState())

        act(() => {
            result.current.actions.setUrls('https://arxiv.org/abs/2024.00001')
        })

        expect(result.current.state.urls).toBe('https://arxiv.org/abs/2024.00001')
    })

    it('should start processing', async () => {
        const { useCrawlState } = await import('@/hooks/useCrawlState')
        const { result } = renderHook(() => useCrawlState())

        act(() => {
            result.current.actions.startProcessing()
        })

        expect(result.current.state.isProcessing).toBe(true)
        expect(result.current.state.progress).toBe(0)
    })

    it('should toggle paper expansion', async () => {
        const { useCrawlState } = await import('@/hooks/useCrawlState')
        const { result } = renderHook(() => useCrawlState())

        act(() => {
            result.current.actions.togglePaper('paper-1')
        })

        expect(result.current.state.expandedPapers.has('paper-1')).toBe(true)

        act(() => {
            result.current.actions.togglePaper('paper-1')
        })

        expect(result.current.state.expandedPapers.has('paper-1')).toBe(false)
    })

    it('should reset state', async () => {
        const { useCrawlState } = await import('@/hooks/useCrawlState')
        const { result } = renderHook(() => useCrawlState())

        act(() => {
            result.current.actions.setUrls('test')
            result.current.actions.startProcessing()
        })

        act(() => {
            result.current.actions.reset()
        })

        expect(result.current.state.urls).toBe('')
        expect(result.current.state.isProcessing).toBe(false)
    })
})

describe('useSearch', () => {
    it('should initialize with empty query', async () => {
        const { useSearch } = await import('@/hooks/useSearch')
        const searchFn = vi.fn().mockResolvedValue([])

        const { result } = renderHook(() => useSearch(searchFn))

        expect(result.current.query).toBe('')
        expect(result.current.results).toEqual([])
        expect(result.current.isSearching).toBe(false)
    })

    it('should update query and trigger search', async () => {
        const { useSearch } = await import('@/hooks/useSearch')
        const mockResults = [{ id: '1', name: 'Test' }]
        const searchFn = vi.fn().mockResolvedValue(mockResults)

        const { result } = renderHook(() => useSearch(searchFn, { minQueryLength: 1 }))

        act(() => {
            result.current.setQuery('test')
        })

        expect(result.current.query).toBe('test')

        // Wait for debounced search
        await waitFor(() => {
            expect(searchFn).toHaveBeenCalledWith('test')
        })
    })

    it('should not search for short queries', async () => {
        const { useSearch } = await import('@/hooks/useSearch')
        const searchFn = vi.fn().mockResolvedValue([])

        const { result } = renderHook(() => useSearch(searchFn, { minQueryLength: 3 }))

        act(() => {
            result.current.setQuery('ab')
        })

        // Short query should not trigger search
        await new Promise(r => setTimeout(r, 400))
        expect(searchFn).not.toHaveBeenCalled()
    })

    it('should clear results', async () => {
        const { useSearch } = await import('@/hooks/useSearch')
        const searchFn = vi.fn().mockResolvedValue([{ id: '1' }])

        const { result } = renderHook(() => useSearch(searchFn))

        act(() => {
            result.current.clear()
        })

        expect(result.current.query).toBe('')
        expect(result.current.results).toEqual([])
    })
})

describe('useFilteredData', () => {
    it('should filter data based on query', async () => {
        const { useFilteredData } = await import('@/hooks/useSearch')

        const data = [
            { id: '1', name: 'Apple' },
            { id: '2', name: 'Banana' },
            { id: '3', name: 'Apricot' },
        ]

        const filterFn = (item: typeof data[0], query: string) =>
            item.name.toLowerCase().includes(query.toLowerCase())

        const { result } = renderHook(() => useFilteredData(data, filterFn))

        act(() => {
            result.current.setQuery('ap')
        })

        await waitFor(() => {
            expect(result.current.results).toHaveLength(2)
            expect(result.current.results.map(r => r.name)).toContain('Apple')
            expect(result.current.results.map(r => r.name)).toContain('Apricot')
        })
    })
})
