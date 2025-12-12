import React, { memo, useMemo } from 'react'

import ArtistGrid from '@/components/ArtistGrid'
import EventCarousel from '@/components/EventCarousel'
import DashboardLayout from '@/components/Layout/DashboardLayout/DashboardLayout'
import { Skeleton } from '@/components/ui/skeleton'
import UserProfile from '@/components/UserProfile'
import { useEvents } from '@/hooks/useEvents'
import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
  useTopArtists,
} from '@/hooks/useSpotify'

const Dashboard: React.FC = memo(() => {
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

  if (!sdk) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-4">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </DashboardLayout>
    )
  }

  if (userLoading || artistsLoading || topArtistsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-6">
          <Skeleton className="h-28 w-full" />
          <div className="space-y-4">
            <Skeleton className="h-6 w-48" />
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-72 w-[300px] shrink-0" />
              ))}
            </div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (userError || artistsError || topArtistsError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4">
          {userError && (
            <p className="text-destructive">
              Error loading your Spotify profile: {userError}
            </p>
          )}
          {artistsError && (
            <p className="text-destructive">
              Error loading your followed artists: {artistsError}
            </p>
          )}
          {topArtistsError && (
            <p className="text-destructive">
              Error loading your top artists: {topArtistsError}
            </p>
          )}
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout title="Dashboard">
      {user && <UserProfile user={user} />}

      {eventsLoading && (
        <div className="space-y-4">
          <Skeleton className="h-6 w-48" />
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-72 w-[300px] shrink-0" />
            ))}
          </div>
        </div>
      )}
      {eventsError && (
        <p className="text-destructive">Error loading events: {eventsError}</p>
      )}
      {events && events.length > 0 && (
        <EventCarousel events={events} title="Events Near You" />
      )}

      {artistsWithEvents.top.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Your Top Artists with Upcoming Events
          </h2>
          <ArtistGrid artists={artistsWithEvents.top} />
        </section>
      )}

      {artistsWithEvents.followed.length > 0 && (
        <section>
          <h2 className="mb-4 text-xl font-semibold">
            Artists You Follow with Upcoming Events
          </h2>
          <ArtistGrid artists={artistsWithEvents.followed} />
        </section>
      )}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
