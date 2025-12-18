import React from 'react'

import UserProfile from '@/components/UserProfile/UserProfile'
import { useSpotify, useCurrentUser } from '@/hooks/useSpotify'

const Dashboard: React.FC = () => {
  const { sdk } = useSpotify()
  const { user, loading, error } = useCurrentUser(sdk)

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
    </div>
  )
}

export default Dashboard
