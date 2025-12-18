import { useCallback, useEffect, useState } from 'react'

import { getArtistsWithEvents } from '@/services/elasticsearch'

const STORAGE_KEY = 'spotify_artists_with_events'

const getStoredArtists = (): string[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredArtists = (artists: string[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(artists))
  } catch (error) {
    console.error('Failed to save artists to localStorage:', error)
  }
}

export interface UseEventsOptions {
  city?: string
  state?: string
  fromDate?: string
  timezone?: string
}

export const useEvents = (
  artistNames: string[] | null,
  options: UseEventsOptions = {},
) => {
  const { city = 'Washington', state = 'DC', fromDate, timezone } = options

  const [artistsWithEvents, setArtistsWithEvents] = useState<string[] | null>(
    () => getStoredArtists(),
  )
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchArtistsWithEvents = useCallback(async () => {
    if (!artistNames || artistNames.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const results = await getArtistsWithEvents({
        artistNames,
        city,
        state,
        fromDate,
        timezone,
      })
      setArtistsWithEvents(results)
      setStoredArtists(results)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Events search error:', error)
    } finally {
      setLoading(false)
    }
  }, [artistNames, city, state, fromDate, timezone])

  useEffect(() => {
    fetchArtistsWithEvents()
  }, [fetchArtistsWithEvents])

  const clearArtistsWithEvents = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setArtistsWithEvents(null)
  }, [])

  return {
    artistsWithEvents,
    loading,
    error,
    clearArtistsWithEvents,
    refetch: fetchArtistsWithEvents,
  }
}
