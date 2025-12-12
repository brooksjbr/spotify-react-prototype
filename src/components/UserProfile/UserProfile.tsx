import type { UserProfile as SpotifyUserProfile } from '@spotify/web-api-ts-sdk'
import { MapPin, Users } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

interface UserProfileProps {
  user: SpotifyUserProfile
}

const UserProfile: React.FC<UserProfileProps> = ({ user }) => {
  const initials = user.display_name
    ?.split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <Card className="w-full">
      <CardContent className="flex items-center gap-6 pt-6">
        <Avatar className="size-20">
          {user.images && user.images[0] && (
            <AvatarImage src={user.images[0].url} alt={user.display_name} />
          )}
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div className="flex flex-col gap-1">
          <h2 className="text-2xl font-bold">{user.display_name}</h2>
          <p className="text-muted-foreground">{user.email}</p>
          <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              <span>{user.country}</span>
            </div>
            <Separator orientation="vertical" className="h-4" />
            <div className="flex items-center gap-1.5">
              <Users className="size-4" />
              <span>{user.followers?.total?.toLocaleString()} followers</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserProfile
