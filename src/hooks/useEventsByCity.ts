import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Event } from '@/@types/event'
import { getEventsByCity } from '@/services/elasticsearch'

const STORAGE_KEY = 'spotify_events_by_city'
const DEFAULT_CITIES = ['Washington']
const DEFAULT_STATES = ['DC']

const getStoredEvents = (): Event[] | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

const setStoredEvents = (events: Event[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events))
  } catch (error) {
    console.error('Failed to save events to localStorage:', error)
  }
}

export interface UseEventsByCityOptions {
  cities?: string[]
  states?: string[]
  fromDate?: string
  timezone?: string
}

export const useEventsByCity = (
  artistNames: string[] | null,
  options: UseEventsByCityOptions = {},
) => {
  const { cities, states, fromDate, timezone } = options

  const stableCities = useMemo(
    () => cities ?? DEFAULT_CITIES,
    [JSON.stringify(cities)],
  )
  const stableStates = useMemo(
    () => states ?? DEFAULT_STATES,
    [JSON.stringify(states)],
  )
  const stableArtistNames = useMemo(
    () => artistNames,
    [JSON.stringify(artistNames)],
  )

  const [events, setEvents] = useState<Event[] | null>(() => getStoredEvents())
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    if (!stableArtistNames || stableArtistNames.length === 0) {
      return
    }

    setLoading(true)
    setError(null)

    try {
      const events = await getEventsByCity({
        artistNames: stableArtistNames,
        cities: stableCities,
        states: stableStates,
        fromDate,
        timezone,
      })

      setEvents(events)
      setStoredEvents(events)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error occurred'
      setError(errorMessage)
      console.error('Events by city search error:', error)
    } finally {
      setLoading(false)
    }
  }, [stableArtistNames, stableCities, stableStates, fromDate, timezone])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const clearEvents = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setEvents(null)
  }, [])

  return {
    events,
    loading,
    error,
    clearEvents,
    refetch: fetchEvents,
  }
}
