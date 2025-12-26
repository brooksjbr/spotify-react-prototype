import { useCallback, useEffect, useState } from 'react'

import type { Event } from '@/@types/event'
import { getEvents } from '@/services/elasticsearch'

const STORAGE_KEY = 'spotify_events'

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

    const [events, setEvents] = useState<Event[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const stored = getStoredEvents()
        if (stored) setEvents(stored)
    }, [])

    const fetchEvents = useCallback(async () => {
        if (!artistNames || artistNames.length === 0) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const results = await getEvents({
                artistNames,
                city,
                state,
                fromDate,
                timezone,
            })
            setEvents(results)
            setStoredEvents(results)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Events search error:', error)
        } finally {
            setLoading(false)
        }
    }, [artistNames, city, state, fromDate, timezone])

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
