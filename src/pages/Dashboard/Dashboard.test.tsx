import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
  useTopArtists,
} from '../../hooks/useSpotify'

import Dashboard from './index'

// Mock the hooks
vi.mock('../../hooks/useSpotify', () => ({
  useSpotify: vi.fn(),
  useCurrentUser: vi.fn(),
  useFollowedArtists: vi.fn(),
  useTopArtists: vi.fn(),
}))

// Mock the DashboardLayout component
vi.mock('../../components/Layout/DashboardLayout/DashboardLayout', () => ({
  default: ({
    title,
    children,
  }: {
    title: string
    children: React.ReactNode
  }) => (
    <div data-testid="dashboard-layout">
      <h1>{title}</h1>
      {children}
    </div>
  ),
}))

// Mock the UserProfile component
vi.mock('../../components/UserProfile/UserProfile', () => ({
  default: ({ user }: { user: any }) => (
    <div data-testid="user-profile">
      <span>User: {user.display_name}</span>
    </div>
  ),
}))

// Updated mock for ArtistGrid to handle empty state
vi.mock('../../components/ArtistGrid/ArtistGrid', () => ({
  default: ({ artists }: { artists: any[] }) => (
    <div data-testid="artist-grid">
      {artists.length === 0 ? (
        <div>
          <h2>Artists You Follow</h2>
          <p>You're not following any artists yet.</p>
        </div>
      ) : (
        <div>
          <h2>Artists You Follow ({artists.length})</h2>
          <span>Artists: {artists.length}</span>
        </div>
      )}
    </div>
  ),
}))

const mockUseSpotify = useSpotify as ReturnType<typeof vi.fn>
const mockUseCurrentUser = useCurrentUser as ReturnType<typeof vi.fn>
const mockUseFollowedArtists = useFollowedArtists as ReturnType<typeof vi.fn>
const mockUseTopArtists = useTopArtists as ReturnType<typeof vi.fn>

const defaultTopArtistsReturn = {
  topArtists: null,
  loading: false,
  error: null,
}

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
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

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
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Loading your profile and artists...'),
    ).toBeInTheDocument()
  })

  test('shows loading message when fetching followed artists', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: null,
    })
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: true,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Loading your profile and artists...'),
    ).toBeInTheDocument()
  })

  test('shows user error message when there is a user error', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: 'Failed to fetch user',
    })
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Error loading your Spotify profile: Failed to fetch user',
      ),
    ).toBeInTheDocument()
  })

  test('shows artists error message when there is an artists error', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: null,
    })
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: 'Failed to fetch artists',
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Error loading your followed artists: Failed to fetch artists',
      ),
    ).toBeInTheDocument()
  })

  test('shows both error messages when both hooks have errors', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: null,
      loading: false,
      error: 'User error',
    })
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: 'Artists error',
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Error loading your Spotify profile: User error'),
    ).toBeInTheDocument()
    expect(
      screen.getByText('Error loading your followed artists: Artists error'),
    ).toBeInTheDocument()
  })

  test('renders user profile and artist grid when data is available', () => {
    const mockSdk = { currentUser: { profile: vi.fn() } }
    const mockUser = {
      display_name: 'John Doe',
      email: 'john@example.com',
      country: 'US',
      followers: { total: 150 },
      images: [{ url: 'http://example.com/profile.jpg' }],
    }
    const mockArtists = [
      { id: '1', name: 'Artist One' },
      { id: '2', name: 'Artist Two' },
    ]

    mockUseSpotify.mockReturnValue({ sdk: mockSdk })
    mockUseCurrentUser.mockReturnValue({
      user: mockUser,
      loading: false,
      error: null,
    })
    mockUseFollowedArtists.mockReturnValue({
      artists: mockArtists,
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue({
      topArtists: mockArtists,
      loading: false,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Welcome to your Spotify dashboard!'),
    ).toBeInTheDocument()

    // Check user profile is rendered
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    expect(screen.getByText('User: John Doe')).toBeInTheDocument()

    // Check artist grids are rendered
    expect(screen.getAllByTestId('artist-grid')).toHaveLength(2)
  })

  test('renders empty state when user follows no artists', () => {
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
    mockUseFollowedArtists.mockReturnValue({
      artists: [],
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText('Welcome to your Spotify dashboard!'),
    ).toBeInTheDocument()
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    expect(screen.getAllByText('Artists You Follow').length).toBeGreaterThan(0)
    expect(
      screen.getByText("You're not following any artists yet."),
    ).toBeInTheDocument()
  })

  test('renders user profile even when artists fail to load', () => {
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
    mockUseFollowedArtists.mockReturnValue({
      artists: null,
      loading: false,
      error: 'Failed to load artists',
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Error loading your followed artists: Failed to load artists',
      ),
    ).toBeInTheDocument()
  })

  test('has correct displayName', () => {
    expect(Dashboard.displayName).toBe('Dashboard')
  })
})
