import React, { memo } from 'react'

import ArtistGrid from '../../components/ArtistGrid/ArtistGrid'
import DashboardLayout from '../../components/Layout/DashboardLayout/DashboardLayout'
import UserProfile from '../../components/UserProfile/UserProfile'
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

      {topArtists && (
        <>
          <h2 className="mt-8 mb-4 text-xl font-bold">Your Top Artists</h2>
          <ArtistGrid artists={topArtists} />
        </>
      )}

      {artists && (
        <>
          <h2 className="mt-8 mb-4 text-xl font-bold">Artists You Follow</h2>
          <ArtistGrid artists={artists} />
        </>
      )}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
