import React, { memo } from 'react'

import ArtistGrid from '../../components/ArtistGrid/ArtistGrid'
import DashboardLayout from '../../components/Layout/DashboardLayout/DashboardLayout'
import UserProfile from '../../components/UserProfile/UserProfile'
import {
  useSpotify,
  useCurrentUser,
  useFollowedArtists,
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

  // Loading state while SDK is initializing
  if (!sdk) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Connecting to Spotify...</p>
      </DashboardLayout>
    )
  }

  // Loading state while fetching data
  if (userLoading || artistsLoading) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Loading your profile and followed artists...</p>
      </DashboardLayout>
    )
  }

  // Error state
  if (userError || artistsError) {
    return (
      <DashboardLayout title="Dashboard">
        <div className="space-y-2">
          {userError && <p>Error loading your Spotify profile: {userError}</p>}
          {artistsError && (
            <p>Error loading your followed artists: {artistsError}</p>
          )}
        </div>
      </DashboardLayout>
    )
  }

  // Success state - render user profile and followed artists
  return (
    <DashboardLayout title="Dashboard">
      <p>Welcome to your Spotify dashboard!</p>

      {user && <UserProfile user={user} />}

      {artists && <ArtistGrid artists={artists} />}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
