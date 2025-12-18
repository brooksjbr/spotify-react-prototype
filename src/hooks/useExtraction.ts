import type { SpotifyApi } from '@spotify/web-api-ts-sdk'
import { useCallback, useState } from 'react'

import type {
  OAuthExtractionResponse,
  SpotifyResource,
  SpotifyDataResponse,
} from '@/@types/extract-data'
import {
  triggerSpotifyExtraction,
  getSpotifyData,
  getStoredClientRef,
  clearStoredClientRef,
} from '@/services/extract-data'

interface AccessToken {
  access_token: string
  refresh_token?: string
}

const SPOTIFY_TOKEN_KEY = 'spotify-sdk:AuthorizationCodeWithPKCEStrategy:token'

function getSpotifyTokens(): AccessToken | null {
  try {
    const stored = localStorage.getItem(SPOTIFY_TOKEN_KEY)
    if (!stored) return null
    return JSON.parse(stored) as AccessToken
  } catch {
    return null
  }
}

interface UseExtractionReturn {
  triggerExtraction: (
    resources: SpotifyResource[],
    params?: Record<string, unknown>,
  ) => Promise<OAuthExtractionResponse>
  fetchSpotifyData: (
    userId: string,
    dataType?: SpotifyResource,
  ) => Promise<SpotifyDataResponse[]>
  clientRef: string | null
  loading: boolean
  error: string | null
  clearExtraction: () => void
}

export function useExtraction(sdk: SpotifyApi | null): UseExtractionReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [clientRef, setClientRef] = useState<string | null>(getStoredClientRef)

  const triggerExtraction = useCallback(
    async (
      resources: SpotifyResource[],
      params?: Record<string, unknown>,
    ): Promise<OAuthExtractionResponse> => {
      if (!sdk) {
        throw new Error('Spotify SDK not initialized')
      }

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
          resources,
          params,
        )
        setClientRef(result.client_ref)
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
    [sdk],
  )

  const fetchSpotifyData = useCallback(
    async (
      userId: string,
      dataType?: SpotifyResource,
    ): Promise<SpotifyDataResponse[]> => {
      setLoading(true)
      setError(null)

      try {
        return await getSpotifyData(userId, dataType)
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch Spotify data'
        setError(errorMessage)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const clearExtraction = useCallback(() => {
    clearStoredClientRef()
    setClientRef(null)
    setError(null)
  }, [])

  return {
    triggerExtraction,
    fetchSpotifyData,
    clientRef,
    loading,
    error,
    clearExtraction,
  }
}
