import type { UserProfile } from '@spotify/web-api-ts-sdk'
import {
  AuthorizationCodeWithPKCEStrategy,
  Scopes,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk'
import { useCallback, useEffect, useState } from 'react'

import type {
  SpotifyResource,
  SpotifyDataResponse,
} from '@/@types/extract-data'
import {
  triggerSpotifyExtraction,
  getSpotifyData,
} from '@/services/extract-data'

const STORAGE_KEYS = {
  USER: 'spotify_user',
  EXTRACTION_TRIGGERED: 'spotify_extraction_triggered',
  EXTRACTED_DATA: 'spotify_extracted_data',
} as const

const SPOTIFY_TOKEN_KEY = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token'

interface AccessToken {
  access_token: string
  refresh_token?: string
}

function getSpotifyTokens(): AccessToken | null {
  try {
    const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY)
    if (!stored) return null
    return JSON.parse(stored) as AccessToken
  } catch {
    return null
  }
}

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
  'user-top-read',
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

const DEFAULT_EXTRACTION_RESOURCES: SpotifyResource[] = [
  'me',
  'top-artists',
  'top-tracks',
  'saved-tracks',
  'followed-artists',
  'playlists',
]

export const useSpotifyExtraction = (
  sdk: SpotifyApi | null,
  resources: SpotifyResource[] = DEFAULT_EXTRACTION_RESOURCES,
  autoTrigger: boolean = false,
) => {
  const [extractionClientRef, setExtractionClientRef] = useState<string | null>(
    null,
  )
  const [extractedData, setExtractedData] = useState<SpotifyDataResponse[]>(
    () =>
      getStoredData<SpotifyDataResponse[]>(STORAGE_KEYS.EXTRACTED_DATA) ?? [],
  )
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sdk || !autoTrigger) return

    const checkAndExtract = async () => {
      const storedUser = getStoredData<{ id: string }>(STORAGE_KEYS.USER)
      if (!storedUser?.id) {
        return
      }

      setLoading(true)
      setError(null)

      try {
        const existingData = await getSpotifyData(storedUser.id)

        if (existingData && existingData.length > 0) {
          setExtractedData(existingData)
          setStoredData(STORAGE_KEYS.EXTRACTED_DATA, existingData)
          console.log(
            'Found existing extracted data:',
            existingData.length,
            'items',
          )
          return
        }

        const alreadyTriggered = localStorage.getItem(
          STORAGE_KEYS.EXTRACTION_TRIGGERED,
        )
        if (alreadyTriggered) return

        const tokens = getSpotifyTokens()
        if (!tokens?.access_token) {
          console.warn(
            'Extraction skipped: No access token found in localStorage',
          )
          return
        }

        const result = await triggerSpotifyExtraction(
          tokens.access_token,
          tokens.refresh_token ?? null,
          resources,
          { time_range: 'medium_term' },
        )
        setExtractionClientRef(result.client_ref)
        localStorage.setItem(STORAGE_KEYS.EXTRACTION_TRIGGERED, 'true')
        console.log('Extraction started:', result.client_ref)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Extraction failed'
        setError(errorMessage)
        console.error('Failed to check/trigger extraction:', err)
      } finally {
        setLoading(false)
      }
    }

    checkAndExtract()
  }, [sdk, autoTrigger, resources])

  const manualTrigger = useCallback(
    async (customResources?: SpotifyResource[]) => {
      const tokens = getSpotifyTokens()
      if (!tokens?.access_token) {
        throw new Error('No Spotify access token available')
      }

      setLoading(true)
      setError(null)

      try {
        const result = await triggerSpotifyExtraction(
          tokens.access_token,
          tokens.refresh_token ?? null,
          customResources ?? resources,
          { time_range: 'medium_term' },
        )
        setExtractionClientRef(result.client_ref)
        return result
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Extraction failed'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [resources],
  )

  const clearExtraction = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.EXTRACTION_TRIGGERED)
    localStorage.removeItem(STORAGE_KEYS.EXTRACTED_DATA)
    setExtractionClientRef(null)
    setExtractedData([])
    setError(null)
  }, [])

  return {
    extractionClientRef,
    extractedData,
    loading,
    error,
    triggerExtraction: manualTrigger,
    clearExtraction,
  }
}
