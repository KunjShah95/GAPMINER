// Test setup file for Vitest - Minimal version
// NOTE: Due to vitest runner issues with lifecycle hooks in setup files,
// we only set up mocks here. Cleanup is handled automatically by vitest.
import '@testing-library/jest-dom'

// Mock environment variables (if window is available)
if (typeof window !== 'undefined') {
    // Mock window.matchMedia
    Object.defineProperty(window, 'matchMedia', {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => { },
            removeListener: () => { },
            addEventListener: () => { },
            removeEventListener: () => { },
            dispatchEvent: () => false,
        }),
    })

    // Mock IntersectionObserver
    Object.defineProperty(window, 'IntersectionObserver', {
        writable: true,
        value: class MockIntersectionObserver {
            observe() { }
            disconnect() { }
            unobserve() { }
        },
    })

    // Mock ResizeObserver
    Object.defineProperty(window, 'ResizeObserver', {
        writable: true,
        value: class MockResizeObserver {
            observe() { }
            disconnect() { }
            unobserve() { }
        },
    })
}
