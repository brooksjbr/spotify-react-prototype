import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import App from './App'

// Mock page components
vi.mock('./pages/Index', () => ({
    default: () => (
        <div data-testid="index-page">My Spotify Listening Habits</div>
    ),
}))

vi.mock('./pages/Dashboard', () => ({
    default: () => <div data-testid="dashboard-page">Dashboard Page</div>,
}))

vi.mock('./pages/Notfound', () => ({
    default: () => <div data-testid="notfound-page">Not Found Page</div>,
}))

// Mock the Layout component
vi.mock('./components/Layout/Layout', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="layout">{children}</div>
    ),
}))

// Mock the ErrorBoundary
vi.mock('./components/ErrorBoundary', () => ({
    default: ({ children }: { children: React.ReactNode }) => (
        <div data-testid="error-boundary">{children}</div>
    ),
}))

describe('App Component', () => {
    test('renders App component without error', () => {
        render(<App />)

        // Should render the ErrorBoundary
        expect(screen.getByTestId('error-boundary')).toBeInTheDocument()

        // Should render the Layout
        expect(screen.getByTestId('layout')).toBeInTheDocument()

        // Should render the Index page by default (root route)
        expect(
            screen.getByText('My Spotify Listening Habits'),
        ).toBeInTheDocument()
    })

    test('has correct displayName', () => {
        expect(App.displayName).toBe('App')
    })

    test('wraps RouterProvider in ErrorBoundary', () => {
        render(<App />)

        const errorBoundary = screen.getByTestId('error-boundary')
        const layout = screen.getByTestId('layout')

        expect(errorBoundary).toBeInTheDocument()
        expect(layout).toBeInTheDocument()

        // Layout should be inside ErrorBoundary
        expect(errorBoundary).toContainElement(layout)
    })
})
