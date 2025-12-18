import React from 'react'

import UserProfile from '@/components/UserProfile/UserProfile'
import {
  useSpotify,
  useCurrentUser,
  useSpotifyExtraction,
} from '@/hooks/useSpotify'

const Dashboard: React.FC = () => {
  const { sdk } = useSpotify()
  const { user, loading: userLoading, error: userError } = useCurrentUser(sdk)
  const {
    extractedData,
    loading: extractionLoading,
    error: extractionError,
  } = useSpotifyExtraction(sdk, undefined, !!user)

  const loading = userLoading || extractionLoading
  const error = userError || extractionError

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
      {extractedData.length > 0 && (
        <div className="mt-4 text-sm text-muted-foreground">
          {extractedData.length} data items extracted
        </div>
      )}
    </div>
  )
}

export default Dashboard
