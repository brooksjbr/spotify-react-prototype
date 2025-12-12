import type { Artist } from '@spotify/web-api-ts-sdk'
import { Music, Users } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

interface ArtistGridProps {
  artists: Artist[]
}

const ArtistGrid: React.FC<ArtistGridProps> = ({ artists }) => {
  if (artists.length === 0) {
    return null
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
      {artists.map((artist) => (
        <Card
          key={artist.id}
          className="group overflow-hidden transition-colors hover:bg-accent/50"
        >
          <CardContent className="flex items-center gap-4 p-4">
            <Avatar className="size-16 rounded-md">
              {artist.images && artist.images[0] && (
                <AvatarImage
                  src={artist.images[0].url}
                  alt={artist.name}
                  className="object-cover"
                />
              )}
              <AvatarFallback className="rounded-md">
                <Music className="size-6 text-muted-foreground" />
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <h3 className="truncate font-semibold">{artist.name}</h3>
              <div className="mt-1 flex items-center gap-1.5 text-sm text-muted-foreground">
                <Users className="size-3.5" />
                <span>{artist.followers?.total?.toLocaleString()}</span>
              </div>
              {artist.genres && artist.genres.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1">
                  {artist.genres.slice(0, 2).map((genre) => (
                    <Badge
                      key={genre}
                      variant="secondary"
                      className="text-xs capitalize"
                    >
                      {genre}
                    </Badge>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

export default ArtistGrid
