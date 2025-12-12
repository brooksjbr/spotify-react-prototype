import { render, screen } from '@testing-library/react'
import { vi } from 'vitest'

import { useEvents } from '@/hooks/useEvents'
import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
  useTopArtists,
} from '@/hooks/useSpotify'

import Dashboard from './index'

vi.mock('@/hooks/useSpotify', () => ({
  useSpotify: vi.fn(),
  useCurrentUser: vi.fn(),
  useFollowedArtists: vi.fn(),
  useTopArtists: vi.fn(),
}))

vi.mock('@/hooks/useEvents', () => ({
  useEvents: vi.fn(),
}))

vi.mock('@/components/Layout/DashboardLayout/DashboardLayout', () => ({
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

vi.mock('@/components/UserProfile', () => ({
  default: ({ user }: { user: { display_name: string } }) => (
    <div data-testid="user-profile">
      <span>User: {user.display_name}</span>
    </div>
  ),
}))

vi.mock('@/components/ArtistGrid', () => ({
  default: ({ artists }: { artists: { id: string }[] }) =>
    artists.length > 0 ? (
      <div data-testid="artist-grid">
        <span>Artists: {artists.length}</span>
      </div>
    ) : null,
}))

vi.mock('@/components/EventCarousel', () => ({
  default: ({ events, title }: { events: { id: string }[]; title: string }) => (
    <div data-testid="event-carousel">
      <span>
        {title}: {events.length} events
      </span>
    </div>
  ),
}))

vi.mock('@/components/ui/skeleton', () => ({
  Skeleton: ({ className }: { className?: string }) => (
    <div data-testid="skeleton" className={className} />
  ),
}))

const mockUseSpotify = useSpotify as ReturnType<typeof vi.fn>
const mockUseCurrentUser = useCurrentUser as ReturnType<typeof vi.fn>
const mockUseFollowedArtists = useFollowedArtists as ReturnType<typeof vi.fn>
const mockUseTopArtists = useTopArtists as ReturnType<typeof vi.fn>
const mockUseEvents = useEvents as ReturnType<typeof vi.fn>

const defaultTopArtistsReturn = {
  topArtists: null,
  loading: false,
  error: null,
}

const defaultEventsReturn = {
  events: null,
  loading: false,
  error: null,
}

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockUseEvents.mockReturnValue(defaultEventsReturn)
  })

  test('shows skeleton loaders when SDK is not available', () => {
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
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  test('shows skeleton loaders when fetching user profile', () => {
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
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
  })

  test('shows skeleton loaders when fetching followed artists', () => {
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
    expect(screen.getAllByTestId('skeleton').length).toBeGreaterThan(0)
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

  test('renders user profile and event carousel when data is available', () => {
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
    mockUseEvents.mockReturnValue({
      events: [
        { id: '1', artist_name: 'Artist One', event_name: 'Concert 1' },
        { id: '2', artist_name: 'Artist Two', event_name: 'Concert 2' },
      ],
      loading: false,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    expect(screen.getByText('User: John Doe')).toBeInTheDocument()
    expect(screen.getByTestId('event-carousel')).toBeInTheDocument()
    expect(screen.getAllByTestId('artist-grid')).toHaveLength(2)
  })

  test('renders empty state when no events match artists', () => {
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
      artists: [{ id: '1', name: 'Artist One' }],
      loading: false,
      error: null,
    })
    mockUseTopArtists.mockReturnValue(defaultTopArtistsReturn)
    mockUseEvents.mockReturnValue({
      events: [],
      loading: false,
      error: null,
    })

    render(<Dashboard />)

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
    expect(screen.getByTestId('user-profile')).toBeInTheDocument()
    expect(screen.queryByTestId('artist-grid')).not.toBeInTheDocument()
    expect(screen.queryByTestId('event-carousel')).not.toBeInTheDocument()
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
