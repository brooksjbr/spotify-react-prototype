import type { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { renderHook, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
  useTopArtists,
} from './useSpotify'

const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

afterEach(() => {
  consoleSpy.mockClear()
})

// Mock the Spotify SDK
const mockSpotifyApi = {
  authenticate: vi.fn(),
  currentUser: {
    profile: vi.fn(),
    followedArtists: vi.fn(),
    topItems: vi.fn(),
  },
}

const mockAuth = vi.fn()

vi.mock('@spotify/web-api-ts-sdk', () => ({
  AuthorizationCodeWithPKCEStrategy: vi.fn(() => mockAuth),
  SpotifyApi: vi.fn(() => mockSpotifyApi),
  Scopes: {
    userDetails: ['user-read-private'],
    userFollowRead: ['user-follow-read'],
    playlistRead: ['playlist-read-private'],
    userLibrary: ['user-library-read'],
  },
}))

// Mock environment variables
vi.mock('import.meta', () => ({
  env: {
    VITE_SPOTIFY_CLIENT_ID: 'test-client-id',
    VITE_SPOTIFY_CLIENT_REDIRECT_URL: 'http://localhost:3000',
  },
}))

describe('useSpotify', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('returns null sdk initially', () => {
    const { result } = renderHook(() => useSpotify())
    expect(result.current.sdk).toBeNull()
  })

  test('sets sdk when authentication succeeds', async () => {
    mockSpotifyApi.authenticate.mockResolvedValue({ authenticated: true })

    const { result } = renderHook(() => useSpotify())

    await waitFor(() => {
      expect(result.current.sdk).toBe(mockSpotifyApi)
    })
  })

  test('keeps sdk null when authentication fails', async () => {
    mockSpotifyApi.authenticate.mockRejectedValue(new Error('Auth failed'))

    const { result } = renderHook(() => useSpotify())

    await waitFor(() => {
      expect(result.current.sdk).toBeNull()
    })
  })
})

describe('useCurrentUser', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('returns initial state when no sdk provided', () => {
    const { result } = renderHook(() => useCurrentUser(null))

    expect(result.current.user).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('fetches user profile successfully', async () => {
    const mockUser = {
      display_name: 'Test User',
      email: 'test@example.com',
      country: 'US',
      followers: { total: 100 },
      images: [{ url: 'http://example.com/image.jpg' }],
    }

    mockSpotifyApi.currentUser.profile.mockResolvedValue(mockUser)

    const { result } = renderHook(() =>
      useCurrentUser(mockSpotifyApi as unknown as SpotifyApi),
    )

    // Should start loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  test('handles error when fetching user profile fails', async () => {
    mockSpotifyApi.currentUser.profile.mockRejectedValue(new Error('API Error'))

    const { result } = renderHook(() =>
      useCurrentUser(mockSpotifyApi as unknown as SpotifyApi),
    )

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('API Error')
    })
  })
})

describe('useFollowedArtists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('returns initial state when no sdk provided', () => {
    const { result } = renderHook(() => useFollowedArtists(null))

    expect(result.current.artists).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('fetches followed artists successfully', async () => {
    const mockArtists = [
      {
        id: '1',
        name: 'Artist One',
        genres: ['rock'],
        popularity: 80,
        followers: { total: 1000000 },
        images: [{ url: 'http://example.com/artist1.jpg' }],
      },
      {
        id: '2',
        name: 'Artist Two',
        genres: ['pop'],
        popularity: 75,
        followers: { total: 500000 },
        images: [{ url: 'http://example.com/artist2.jpg' }],
      },
    ]

    // Correct response structure for followed artists
    const mockFollowedArtistsResponse = {
      artists: {
        items: mockArtists,
        total: 2,
        limit: 20,
        offset: 0,
        href: 'https://api.spotify.com/v1/me/following?type=artist',
        next: null,
        previous: null,
      },
    }

    mockSpotifyApi.currentUser.followedArtists.mockResolvedValue(
      mockFollowedArtistsResponse,
    )

    const { result } = renderHook(() =>
      useFollowedArtists(mockSpotifyApi as unknown as SpotifyApi),
    )

    // Should start loading
    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.artists).toEqual(mockArtists)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })
  })

  test('handles error when fetching followed artists fails', async () => {
    mockSpotifyApi.currentUser.followedArtists.mockRejectedValue(
      new Error('Artists API Error'),
    )

    const { result } = renderHook(() =>
      useFollowedArtists(mockSpotifyApi as unknown as SpotifyApi),
    )

    await waitFor(() => {
      expect(result.current.artists).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Artists API Error')
    })
  })

  test('handles error when SDK is not initialized', async () => {
    const mockSdkWithoutCurrentUser = {}

    const { result } = renderHook(() =>
      useFollowedArtists(mockSdkWithoutCurrentUser as unknown as SpotifyApi),
    )

    await waitFor(() => {
      expect(result.current.artists).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe(
        'Spotify SDK is not initialized or currentUser is unavailable',
      )
    })
  })

  test('does not fetch when sdk is null', () => {
    const { result } = renderHook(() => useFollowedArtists(null))

    expect(result.current.artists).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockSpotifyApi.currentUser.followedArtists).not.toHaveBeenCalled()
  })
})

describe('useTopArtists', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    localStorage.clear()
  })

  test('returns initial state when no sdk provided', () => {
    const { result } = renderHook(() => useTopArtists(null))

    expect(result.current.topArtists).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
  })

  test('fetches top artists successfully', async () => {
    const mockArtists = [
      {
        id: '1',
        name: 'Top Artist One',
        genres: ['indie'],
        popularity: 90,
        followers: { total: 2000000 },
        images: [{ url: 'http://example.com/top1.jpg' }],
      },
      {
        id: '2',
        name: 'Top Artist Two',
        genres: ['electronic'],
        popularity: 85,
        followers: { total: 1500000 },
        images: [{ url: 'http://example.com/top2.jpg' }],
      },
    ]

    const mockTopItemsResponse = {
      items: mockArtists,
      total: 2,
      limit: 20,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/artists',
      next: null,
      previous: null,
    }

    mockSpotifyApi.currentUser.topItems.mockResolvedValue(mockTopItemsResponse)

    const { result } = renderHook(() =>
      useTopArtists(mockSpotifyApi as unknown as SpotifyApi),
    )

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.topArtists).toEqual(mockArtists)
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBeNull()
    })

    expect(mockSpotifyApi.currentUser.topItems).toHaveBeenCalledWith(
      'artists',
      'medium_term',
      20,
    )
  })

  test('fetches top artists with custom time range', async () => {
    const mockTopItemsResponse = {
      items: [],
      total: 0,
      limit: 10,
      offset: 0,
      href: 'https://api.spotify.com/v1/me/top/artists',
      next: null,
      previous: null,
    }

    mockSpotifyApi.currentUser.topItems.mockResolvedValue(mockTopItemsResponse)

    renderHook(() =>
      useTopArtists(mockSpotifyApi as unknown as SpotifyApi, 'short_term', 10),
    )

    await waitFor(() => {
      expect(mockSpotifyApi.currentUser.topItems).toHaveBeenCalledWith(
        'artists',
        'short_term',
        10,
      )
    })
  })

  test('handles error when fetching top artists fails', async () => {
    mockSpotifyApi.currentUser.topItems.mockRejectedValue(
      new Error('Top Artists API Error'),
    )

    const { result } = renderHook(() =>
      useTopArtists(mockSpotifyApi as unknown as SpotifyApi),
    )

    await waitFor(() => {
      expect(result.current.topArtists).toBeNull()
      expect(result.current.loading).toBe(false)
      expect(result.current.error).toBe('Top Artists API Error')
    })
  })

  test('does not fetch when sdk is null', () => {
    const { result } = renderHook(() => useTopArtists(null))

    expect(result.current.topArtists).toBeNull()
    expect(result.current.loading).toBe(false)
    expect(result.current.error).toBeNull()
    expect(mockSpotifyApi.currentUser.topItems).not.toHaveBeenCalled()
  })
})
