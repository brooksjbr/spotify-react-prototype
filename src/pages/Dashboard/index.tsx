import React, { memo } from 'react'

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

      {artists && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-4">
            Artists You Follow ({artists.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {artists.map((artist) => (
              <div
                key={artist.id}
                className="bg-gray-100 rounded-lg p-4 hover:bg-gray-200 transition-colors"
              >
                {artist.images && artist.images[0] && (
                  <img
                    src={artist.images[0].url}
                    alt={artist.name}
                    className="w-full h-32 object-cover rounded-md mb-2"
                  />
                )}
                <h3 className="font-semibold text-lg">{artist.name}</h3>
                <p className="text-sm text-gray-600">
                  {artist.followers?.total?.toLocaleString()} followers
                </p>
                {artist.genres && artist.genres.length > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {artist.genres.slice(0, 2).join(', ')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {artists && artists.length === 0 && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Artists You Follow</h2>
          <p className="text-gray-600">You're not following any artists yet.</p>
        </div>
      )}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
