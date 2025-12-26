import { useCallback, useEffect, useMemo, useState } from 'react'

import type { Event, EventSearchByMetroCluster } from '@/@types/event'
import { getEventsByMetroCluster } from '@/services/elasticsearch'

const STORAGE_KEY = 'spotify_events_by_metro_cluster'

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

export const useEventsByMetroCluster = (params: EventSearchByMetroCluster) => {
    const { artistNames, metro_cluster, fromDate, timezone } = params

    const stableArtistNames = useMemo(
        () => artistNames,
        [JSON.stringify(artistNames)],
    )
    const stableMetroCluster = useMemo(
        () => metro_cluster,
        [JSON.stringify(metro_cluster)],
    )

    const [events, setEvents] = useState<Event[] | null>(null)
    const [loading, setLoading] = useState<boolean>(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const stored = getStoredEvents()
        if (stored) setEvents(stored)
    }, [])

    const fetchEvents = useCallback(async () => {
        if (!stableArtistNames || stableArtistNames.length === 0) {
            return
        }

        setLoading(true)
        setError(null)

        try {
            const events = await getEventsByMetroCluster({
                artistNames: stableArtistNames,
                metro_cluster: stableMetroCluster,
                fromDate,
                timezone,
            })

            setEvents(events)
            setStoredEvents(events)
        } catch (error) {
            const errorMessage =
                error instanceof Error
                    ? error.message
                    : 'Unknown error occurred'
            setError(errorMessage)
            console.error('Events by city search error:', error)
        } finally {
            setLoading(false)
        }
    }, [stableArtistNames, stableMetroCluster, fromDate, timezone])

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
