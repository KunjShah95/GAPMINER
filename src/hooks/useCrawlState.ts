// Custom hook for CrawlPage state management using useReducer
import { useReducer, useCallback } from 'react'
import type { Gap } from '@/lib/firestore'

// ============================================================================
// Types
// ============================================================================

export interface PaperResult {
    url: string
    title: string
    venue?: string
    year?: string
    status: 'pending' | 'crawling' | 'analyzing' | 'success' | 'error'
    error?: string
    gaps: Gap[]
    content?: string
}

export interface CrawlState {
    // Input
    urls: string

    // Processing
    isProcessing: boolean
    progress: number

    // Results
    results: PaperResult[]
    expandedPapers: Set<string>
    savedIds: Set<string>

    // UI State
    copiedId: string | null
    savingId: string | null

    // Explanations
    explainingId: string | null
    explanations: Record<string, string>

    // Comparison
    selectedForComparison: string[]
    isComparing: boolean
    comparisonResult: string | null

    // Ideas & Questions
    generatingIdeaId: string | null
    ideas: Record<string, { idea: string; audience: string; why_now: string }>
    generatingQuestionsId: string | null
    questions: Record<string, string[]>
}

// ============================================================================
// Actions
// ============================================================================

type CrawlAction =
    | { type: 'SET_URLS'; payload: string }
    | { type: 'START_PROCESSING' }
    | { type: 'STOP_PROCESSING' }
    | { type: 'SET_PROGRESS'; payload: number }
    | { type: 'INIT_RESULTS'; payload: PaperResult[] }
    | { type: 'UPDATE_RESULT'; payload: { index: number; updates: Partial<PaperResult> } }
    | { type: 'TOGGLE_PAPER'; payload: string }
    | { type: 'EXPAND_ALL' }
    | { type: 'SET_COPIED_ID'; payload: string | null }
    | { type: 'SET_SAVING_ID'; payload: string | null }
    | { type: 'ADD_SAVED_ID'; payload: string }
    | { type: 'SET_EXPLAINING_ID'; payload: string | null }
    | { type: 'ADD_EXPLANATION'; payload: { id: string; explanation: string } }
    | { type: 'TOGGLE_COMPARISON'; payload: string }
    | { type: 'START_COMPARING' }
    | { type: 'SET_COMPARISON_RESULT'; payload: string | null }
    | { type: 'SET_GENERATING_IDEA_ID'; payload: string | null }
    | { type: 'ADD_IDEA'; payload: { id: string; idea: { idea: string; audience: string; why_now: string } } }
    | { type: 'SET_GENERATING_QUESTIONS_ID'; payload: string | null }
    | { type: 'ADD_QUESTIONS'; payload: { id: string; questions: string[] } }
    | { type: 'RESET' }

// ============================================================================
// Initial State
// ============================================================================

const initialState: CrawlState = {
    urls: '',
    isProcessing: false,
    progress: 0,
    results: [],
    expandedPapers: new Set(),
    savedIds: new Set(),
    copiedId: null,
    savingId: null,
    explainingId: null,
    explanations: {},
    selectedForComparison: [],
    isComparing: false,
    comparisonResult: null,
    generatingIdeaId: null,
    ideas: {},
    generatingQuestionsId: null,
    questions: {},
}

// ============================================================================
// Reducer
// ============================================================================

function crawlReducer(state: CrawlState, action: CrawlAction): CrawlState {
    switch (action.type) {
        case 'SET_URLS':
            return { ...state, urls: action.payload }

        case 'START_PROCESSING':
            return {
                ...state,
                isProcessing: true,
                progress: 0,
                results: [],
                savedIds: new Set(),
                expandedPapers: new Set(),
            }

        case 'STOP_PROCESSING':
            return { ...state, isProcessing: false }

        case 'SET_PROGRESS':
            return { ...state, progress: action.payload }

        case 'INIT_RESULTS':
            return { ...state, results: action.payload }

        case 'UPDATE_RESULT': {
            const newResults = [...state.results]
            newResults[action.payload.index] = {
                ...newResults[action.payload.index],
                ...action.payload.updates,
            }
            return { ...state, results: newResults }
        }

        case 'TOGGLE_PAPER': {
            const newExpanded = new Set(state.expandedPapers)
            if (newExpanded.has(action.payload)) {
                newExpanded.delete(action.payload)
            } else {
                newExpanded.add(action.payload)
            }
            return { ...state, expandedPapers: newExpanded }
        }

        case 'EXPAND_ALL': {
            const allUrls = state.results.map(r => r.url)
            return { ...state, expandedPapers: new Set(allUrls) }
        }

        case 'SET_COPIED_ID':
            return { ...state, copiedId: action.payload }

        case 'SET_SAVING_ID':
            return { ...state, savingId: action.payload }

        case 'ADD_SAVED_ID': {
            const newSavedIds = new Set(state.savedIds)
            newSavedIds.add(action.payload)
            return { ...state, savedIds: newSavedIds }
        }

        case 'SET_EXPLAINING_ID':
            return { ...state, explainingId: action.payload }

        case 'ADD_EXPLANATION':
            return {
                ...state,
                explanations: {
                    ...state.explanations,
                    [action.payload.id]: action.payload.explanation,
                },
            }

        case 'TOGGLE_COMPARISON': {
            const { selectedForComparison } = state
            if (selectedForComparison.includes(action.payload)) {
                return {
                    ...state,
                    selectedForComparison: selectedForComparison.filter(u => u !== action.payload),
                }
            }
            // Keep only last 2 selections
            return {
                ...state,
                selectedForComparison: [...selectedForComparison, action.payload].slice(-2),
            }
        }

        case 'START_COMPARING':
            return { ...state, isComparing: true, comparisonResult: null }

        case 'SET_COMPARISON_RESULT':
            return { ...state, isComparing: false, comparisonResult: action.payload }

        case 'SET_GENERATING_IDEA_ID':
            return { ...state, generatingIdeaId: action.payload }

        case 'ADD_IDEA':
            return {
                ...state,
                ideas: { ...state.ideas, [action.payload.id]: action.payload.idea },
            }

        case 'SET_GENERATING_QUESTIONS_ID':
            return { ...state, generatingQuestionsId: action.payload }

        case 'ADD_QUESTIONS':
            return {
                ...state,
                questions: { ...state.questions, [action.payload.id]: action.payload.questions },
            }

        case 'RESET':
            return initialState

        default:
            return state
    }
}

// ============================================================================
// Hook
// ============================================================================

export function useCrawlState() {
    const [state, dispatch] = useReducer(crawlReducer, initialState)

    // Action creators
    const setUrls = useCallback((urls: string) => {
        dispatch({ type: 'SET_URLS', payload: urls })
    }, [])

    const startProcessing = useCallback(() => {
        dispatch({ type: 'START_PROCESSING' })
    }, [])

    const stopProcessing = useCallback(() => {
        dispatch({ type: 'STOP_PROCESSING' })
    }, [])

    const setProgress = useCallback((progress: number) => {
        dispatch({ type: 'SET_PROGRESS', payload: progress })
    }, [])

    const initResults = useCallback((results: PaperResult[]) => {
        dispatch({ type: 'INIT_RESULTS', payload: results })
    }, [])

    const updateResult = useCallback((index: number, updates: Partial<PaperResult>) => {
        dispatch({ type: 'UPDATE_RESULT', payload: { index, updates } })
    }, [])

    const togglePaper = useCallback((url: string) => {
        dispatch({ type: 'TOGGLE_PAPER', payload: url })
    }, [])

    const expandAll = useCallback(() => {
        dispatch({ type: 'EXPAND_ALL' })
    }, [])

    const setCopiedId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_COPIED_ID', payload: id })
    }, [])

    const setSavingId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_SAVING_ID', payload: id })
    }, [])

    const addSavedId = useCallback((id: string) => {
        dispatch({ type: 'ADD_SAVED_ID', payload: id })
    }, [])

    const setExplainingId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_EXPLAINING_ID', payload: id })
    }, [])

    const addExplanation = useCallback((id: string, explanation: string) => {
        dispatch({ type: 'ADD_EXPLANATION', payload: { id, explanation } })
    }, [])

    const toggleComparison = useCallback((url: string) => {
        dispatch({ type: 'TOGGLE_COMPARISON', payload: url })
    }, [])

    const startComparing = useCallback(() => {
        dispatch({ type: 'START_COMPARING' })
    }, [])

    const setComparisonResult = useCallback((result: string | null) => {
        dispatch({ type: 'SET_COMPARISON_RESULT', payload: result })
    }, [])

    const setGeneratingIdeaId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_GENERATING_IDEA_ID', payload: id })
    }, [])

    const addIdea = useCallback((id: string, idea: { idea: string; audience: string; why_now: string }) => {
        dispatch({ type: 'ADD_IDEA', payload: { id, idea } })
    }, [])

    const setGeneratingQuestionsId = useCallback((id: string | null) => {
        dispatch({ type: 'SET_GENERATING_QUESTIONS_ID', payload: id })
    }, [])

    const addQuestions = useCallback((id: string, questions: string[]) => {
        dispatch({ type: 'ADD_QUESTIONS', payload: { id, questions } })
    }, [])

    const reset = useCallback(() => {
        dispatch({ type: 'RESET' })
    }, [])

    return {
        state,
        actions: {
            setUrls,
            startProcessing,
            stopProcessing,
            setProgress,
            initResults,
            updateResult,
            togglePaper,
            expandAll,
            setCopiedId,
            setSavingId,
            addSavedId,
            setExplainingId,
            addExplanation,
            toggleComparison,
            startComparing,
            setComparisonResult,
            setGeneratingIdeaId,
            addIdea,
            setGeneratingQuestionsId,
            addQuestions,
            reset,
        },
    }
}
