import type { UserProfile as SpotifyUserProfile } from '@spotify/web-api-ts-sdk'
import React from 'react'

interface UserProfileProps {
  user: SpotifyUserProfile
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  return (
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
  )
}

export default UserProfile
