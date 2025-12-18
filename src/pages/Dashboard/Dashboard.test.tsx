import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import Dashboard from './index'

vi.mock('@/hooks/useSpotify', () => ({
  useSpotify: vi.fn(() => ({ sdk: {} })),
  useCurrentUser: vi.fn(() => ({
    user: null,
    loading: false,
    error: null,
  })),
}))

import { useCurrentUser } from '@/hooks/useSpotify'

const mockUseCurrentUser = vi.mocked(useCurrentUser)

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('renders loading state', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: true,
      error: null,
      clearUser: vi.fn(),
    })
    render(<Dashboard />)
    expect(screen.getByText('Loading...')).toBeInTheDocument()
  })

  test('renders error state', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: 'Something went wrong',
      clearUser: vi.fn(),
    })
    render(<Dashboard />)
    expect(screen.getByText('Error: Something went wrong')).toBeInTheDocument()
  })

  test('renders login prompt when no user', () => {
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: null,
      clearUser: vi.fn(),
    })
    render(<Dashboard />)
    expect(
      screen.getByText('Please log in to view your profile.'),
    ).toBeInTheDocument()
  })

  test('renders user profile when authenticated', () => {
    mockUseCurrentUser.mockReturnValue({
      user: {
        id: '123',
        display_name: 'Test User',
        email: 'test@example.com',
        country: 'US',
        followers: { href: null, total: 100 },
        images: [],
        uri: 'spotify:user:123',
        href: 'https://api.spotify.com/v1/users/123',
        type: 'user',
        external_urls: { spotify: 'https://open.spotify.com/user/123' },
        explicit_content: { filter_enabled: false, filter_locked: false },
        product: 'premium',
      },
      loading: false,
      error: null,
      clearUser: vi.fn(),
    })
    render(<Dashboard />)
    expect(screen.getByText('Test User')).toBeInTheDocument()
    expect(screen.getByText('test@example.com')).toBeInTheDocument()
  })
})
