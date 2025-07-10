import React, { memo } from 'react'

import DashboardLayout from '../../components/Layout/DashboardLayout/DashboardLayout'
import UserProfile from '../../components/UserProfile/UserProfile'
import { useSpotify, useCurrentUser } from '../../hooks/useSpotify'

interface Props {}

const Dashboard: React.FC<Props> = memo(() => {
  const { sdk } = useSpotify()
  const { user, loading, error } = useCurrentUser(sdk)

  // Loading state while SDK is initializing
  if (!sdk) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Connecting to Spotify...</p>
      </DashboardLayout>
    )
  }

  // Loading state while fetching user profile
  if (loading) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Loading your profile...</p>
      </DashboardLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <DashboardLayout title="Dashboard">
        <p>Error loading your Spotify profile: {error}</p>
      </DashboardLayout>
    )
  }

  // Success state - render user profile
  return (
    <DashboardLayout title="Dashboard">
      <p>Welcome to your Spotify dashboard!</p>
      {user && <UserProfile user={user} />}
    </DashboardLayout>
  )
})
Dashboard.displayName = 'Dashboard'

export default Dashboard
