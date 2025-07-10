import type { UserProfile } from '@spotify/web-api-ts-sdk'
import {
  AuthorizationCodeWithPKCEStrategy,
  Scopes,
  SpotifyApi,
} from '@spotify/web-api-ts-sdk'
import { useEffect, useState } from 'react'

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
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!sdk) {
      return // Don't fetch if SDK is not available
    }

    const fetchUserProfile = async () => {
      setLoading(true)
      setError(null)

      try {
        if (sdk && sdk.currentUser) {
          const userProfile: UserProfile = await sdk.currentUser.profile()
          setUser(userProfile)
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
  }, [sdk]) // Remove 'user' from dependency array to prevent infinite loops

  return { user, loading, error }
}
