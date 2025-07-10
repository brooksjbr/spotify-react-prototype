import React, { memo } from 'react'

import Box from '../../components/Box'
import { useSpotify, useCurrentUser } from '../../hooks/useSpotify'

import styles from './index.module.css'

interface Props {}

const Dashboard: React.FC<Props> = memo(() => {
  const { sdk } = useSpotify()
  const { user, loading, error } = useCurrentUser(sdk)

  // Loading state while SDK is initializing
  if (!sdk) {
    return (
      <Box>
        <h1 className={styles.h1}>Dashboard</h1>
        <p>Connecting to Spotify...</p>
      </Box>
    )
  }

  // Loading state while fetching user profile
  if (loading) {
    return (
      <Box>
        <h1 className={styles.h1}>Dashboard</h1>
        <p>Loading your profile...</p>
      </Box>
    )
  }

  // Error state
  if (error) {
    return (
      <Box>
        <h1 className={styles.h1}>Dashboard</h1>
        <p>Error loading your Spotify profile: {error}</p>
      </Box>
    )
  }

  // Success state - render user profile
  return (
    <>
      <Box>
        <h1 className={styles.h1}>Dashboard</h1>
        <p>Welcome to your Spotify dashboard!</p>

        {user && (
          <div className="mt-4">
            <h2 className="text-xl font-semibold mb-2">Your Profile</h2>
            <div className="space-y-2">
              <p>
                <strong>Name:</strong> {user.display_name}
              </p>
              <p>
                <strong>Email:</strong> {user.email}
              </p>
              <p>
                <strong>Country:</strong> {user.country}
              </p>
              <p>
                <strong>Followers:</strong> {user.followers?.total}
              </p>
              {user.images && user.images[0] && (
                <div>
                  <strong>Profile Picture:</strong>
                  <img
                    src={user.images[0].url}
                    alt="Profile"
                    className="w-20 h-20 rounded-full mt-2"
                  />
                </div>
              )}
            </div>
          </div>
        )}
      </Box>
    </>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
