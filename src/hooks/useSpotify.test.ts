import type { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { renderHook, waitFor } from '@testing-library/react'
import { vi } from 'vitest'

import { useSpotify, useCurrentUser } from './useSpotify'

// Mock the Spotify SDK
const mockSpotifyApi = {
  authenticate: vi.fn(),
  currentUser: {
    profile: vi.fn(),
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
