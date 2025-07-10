import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import Dashboard from './index'

// Mock the hooks
vi.mock('../../hooks/useSpotify', () => ({
  useSpotify: vi.fn(),
  useCurrentUser: vi.fn(),
}))

// Mock the Box component
vi.mock('../../components/Box', () => ({
  default: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="box">{children}</div>
  ),
}))

import { useSpotify, useCurrentUser } from '../../hooks/useSpotify'

const mockUseSpotify = useSpotify as ReturnType<typeof vi.fn>
const mockUseCurrentUser = useCurrentUser as ReturnType<typeof vi.fn>

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('shows connecting message when SDK is not available', () => {
    mockUseSpotify.mockReturnValue({ sdk: null })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Connecting to Spotify...')).toBeInTheDocument()
  })

  test('shows loading message when fetching user profile', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: true,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByText('Loading your profile...')).toBeInTheDocument()
  })

  test('shows error message when there is an error', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: 'Failed to fetch user',
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Error loading your Spotify profile: Failed to fetch user',
      ),
    ).toBeInTheDocument()
  })

  test('renders user profile when data is available', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    const mockUser = {
      display_name: 'John Doe',
      email: 'john@example.com',
      country: 'US',
      followers: { total: 150 },
      images: [{ url: 'http://example.com/profile.jpg' }],
    }

    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Welcome to your Spotify dashboard!'),
    ).toBeInTheDocument()
    expect(screen.getByText('Your Profile')).toBeInTheDocument()
    expect(screen.getByText('John Doe')).toBeInTheDocument()
    expect(screen.getByText('john@example.com')).toBeInTheDocument()
    expect(screen.getByText('US')).toBeInTheDocument()
    expect(screen.getByText('150')).toBeInTheDocument()

    const profileImage = screen.getByAltText('Profile')
    expect(profileImage).toBeInTheDocument()
    expect(profileImage).toHaveAttribute(
      'src',
      'http://example.com/profile.jpg',
    )
  })

  test('has correct displayName', () => {
    expect(Dashboard.displayName).toBe('Dashboard')
  })
})
