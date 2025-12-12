import type { UserProfile, Artist } from '@spotify/web-api-ts-sdk'
import {
  AuthorizationCodeWithPKCEStrategy,
  Scopes,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk'
import { useCallback, useEffect, useState } from 'react'

const STORAGE_KEYS = {
  USER: 'spotify_user',
  ARTISTS: 'spotify_artists',
} as const

const getStoredData = <T>(key: string): T | null => {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredData = <T>(key: string, data: T): void => {
  try {
    localStorage.setItem(key, JSON.stringify(data))
  } catch (error) {
    console.error('Failed to save to localStorage:', error)
  }
}

const SCOPES = [
  ...Scopes.userDetails,
  ...Scopes.userFollowRead,
  ...Scopes.playlistRead,
  ...Scopes.userLibrary,
]

export const useSpotify = (customScopes: string[] = SCOPES) => {
  const [sdk, setSdk] = useState<SpotifyApi | null>(null)

  useEffect(() => {
    const initSdk = async () => {
      try {
        const auth = new AuthorizationCodeWithPKCEStrategy(
          import.meta.env.VITE_SPOTIFY_CLIENT_ID,
          import.meta.env.VITE_SPOTIFY_CLIENT_REDIRECT_URL,
          customScopes as string[],
        )

        const spotifySdk = new SpotifyApi(auth)

        try {
          const { authenticated } = await spotifySdk.authenticate()
          if (authenticated) {
            setSdk(spotifySdk)
          }
        } catch (e) {
          console.error('Authentication error:', e)
        }
      } catch (error) {
        console.error('Failed to initialize Spotify SDK:', error)
      }
    }

    initSdk()
  }, [])

  return { sdk }
}

export const useCurrentUser = (sdk: SpotifyApi | null) => {
  const [user, setUser] = useState<UserProfile | null>(() =>
    getStoredData<UserProfile>(STORAGE_KEYS.USER),
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sdk) {
      return
    }

    const fetchUserProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        if (sdk && sdk.currentUser) {
          const userProfile: UserProfile = await sdk.currentUser.profile()
          setUser(userProfile)
          setStoredData(STORAGE_KEYS.USER, userProfile)
        } else {
          throw new Error(
            'Spotify SDK is not initialized or currentUser is unavailable',
          )
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        setError(errorMessage)
        console.error('Spotify Auth Error: ' + error)
      } finally {
        setLoading(false)
      }
    }

    fetchUserProfile()
  }, [sdk])

  const clearUser = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.USER)
    setUser(null)
  }, [])

  return { user, loading, error, clearUser }
}

export const useFollowedArtists = (sdk: SpotifyApi | null) => {
  const [artists, setArtists] = useState<Artist[] | null>(() =>
    getStoredData<Artist[]>(STORAGE_KEYS.ARTISTS),
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sdk) {
      return
    }

    const fetchFollowedArtists = async () => {
      setLoading(true)
      setError(null)

      try {
        if (sdk && sdk.currentUser) {
          const followedArtists = await sdk.currentUser.followedArtists()
          setArtists(followedArtists.artists.items)
          setStoredData(STORAGE_KEYS.ARTISTS, followedArtists.artists.items)
        } else {
          throw new Error(
            'Spotify SDK is not initialized or currentUser is unavailable',
          )
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error occurred'
        setError(errorMessage)
        console.error('Spotify Followed Artists Error: ' + error)
      } finally {
        setLoading(false)
      }
    }

    fetchFollowedArtists()
  }, [sdk])

  const clearArtists = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.ARTISTS)
    setArtists(null)
  }, [])

  return { artists, loading, error, clearArtists }
}
