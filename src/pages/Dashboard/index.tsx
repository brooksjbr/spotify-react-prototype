import React, { useMemo } from 'react'

import { extractArtistNames } from '@/@types/extract-data'
import EventCarousel from '@/components/EventCarousel/EventCarousel'
import UserProfile from '@/components/UserProfile/UserProfile'
import { useEventsByCity } from '@/hooks/useEventsByCity'
import {
  useSpotify,
  useCurrentUser,
  useSpotifyExtraction,
} from '@/hooks/useSpotify'

const Dashboard: React.FC = () => {
  console.log('localStorage keys:', Object.keys(localStorage))
  console.log('', localStorage.getItem('spotify_extracted_data'))
  const { sdk } = useSpotify()
  const { user, loading: userLoading, error: userError } = useCurrentUser(sdk)
  const {
    extractedData,
    loading: extractionLoading,
    error: extractionError,
  } = useSpotifyExtraction(sdk, undefined, !!user)

  const artistNames = useMemo(
    () => extractArtistNames(extractedData),
    [extractedData],
  )

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEventsByCity(artistNames.length > 0 ? artistNames : null, {
    cities: ['Washington'],
    states: ['DC'],
  })

  const loading = userLoading || extractionLoading || eventsLoading
  const error = userError || extractionError || eventsError

  if (loading) {
    return <div className="p-6">Loading...</div>
  }

  if (error) {
    return <div className="p-6 text-red-500">Error: {error}</div>
  }

  if (!user) {
    return <div className="p-6">Please log in to view your profile.</div>
  }

  return (
    <div className="p-6">
      <UserProfile user={user} />
      {events && (
        <div className="mt-6">
          <EventCarousel events={events} title="Upcoming Events" />
        </div>
      )}
    </div>
  )
}

export default Dashboard
