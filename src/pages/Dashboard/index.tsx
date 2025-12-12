import React, { memo, useMemo } from 'react'

import ArtistGrid from '../../components/ArtistGrid/ArtistGrid'
import EventCarousel from '../../components/EventCarousel'
import DashboardLayout from '../../components/Layout/DashboardLayout/DashboardLayout'
import UserProfile from '../../components/UserProfile/UserProfile'
import { useEvents } from '../../hooks/useEvents'
import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
  useTopArtists,
} from '../../hooks/useSpotify'

interface Props {}

const Dashboard: React.FC<Props> = memo(() => {
  const { sdk } = useSpotify()
  const { user, loading: userLoading, error: userError } = useCurrentUser(sdk)
  const {
    artists,
    loading: artistsLoading,
    error: artistsError,
  } = useFollowedArtists(sdk)
  const {
    topArtists,
    loading: topArtistsLoading,
    error: topArtistsError,
  } = useTopArtists(sdk)

  const allArtistNames = useMemo(() => {
    const names = new Set<string>()
    topArtists?.forEach((artist) => names.add(artist.name))
    artists?.forEach((artist) => names.add(artist.name))
    return Array.from(names)
  }, [topArtists, artists])

  const {
    events,
    loading: eventsLoading,
    error: eventsError,
  } = useEvents(allArtistNames.length > 0 ? allArtistNames : null)

  const artistsWithEvents = useMemo(() => {
    if (!events || events.length === 0) return { top: [], followed: [] }

    const eventArtistNames = new Set(
      events.map((e) => e.artist_name.toLowerCase()),
    )

    const topWithEvents =
      topArtists?.filter((artist) =>
        eventArtistNames.has(artist.name.toLowerCase()),
      ) ?? []

    const followedWithEvents =
      artists?.filter((artist) =>
        eventArtistNames.has(artist.name.toLowerCase()),
      ) ?? []

    return { top: topWithEvents, followed: followedWithEvents }
  }, [events, topArtists, artists])

  // Loading state while SDK is initializing
  if (!sdk) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Connecting to Spotify...</p>
      </DashboardLayout>
    )
  }

  // Loading state while fetching data
  if (userLoading || artistsLoading || topArtistsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Loading your profile and artists...</p>
      </DashboardLayout>
    )
  }

  // Error state
  if (userError || artistsError || topArtistsError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-2">
          {userError && <p>Error loading your Spotify profile: {userError}</p>}
          {artistsError && (
            <p>Error loading your followed artists: {artistsError}</p>
          )}
          {topArtistsError && (
            <p>Error loading your top artists: {topArtistsError}</p>
          )}
        </div>
      </DashboardLayout>
    )
  }

  // Success state - render user profile and artists
  return (
    <DashboardLayout title="Dashboard">
      <p>Welcome to your Spotify dashboard!</p>

      {user && <UserProfile user={user} />}

      {eventsLoading && (
        <p className="mt-4 text-gray-600">Searching for events...</p>
      )}
      {eventsError && (
        <p className="mt-4 text-red-500">Error loading events: {eventsError}</p>
      )}
      {events && events.length > 0 && (
        <EventCarousel events={events} title="Events Near You" />
      )}

      {artistsWithEvents.top.length > 0 && (
        <>
          <h2 className="mt-8 mb-4 text-xl font-bold">
            Your Top Artists with Upcoming Events
          </h2>
          <ArtistGrid artists={artistsWithEvents.top} />
        </>
      )}

      {artistsWithEvents.followed.length > 0 && (
        <>
          <h2 className="mt-8 mb-4 text-xl font-bold">
            Artists You Follow with Upcoming Events
          </h2>
          <ArtistGrid artists={artistsWithEvents.followed} />
        </>
      )}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
