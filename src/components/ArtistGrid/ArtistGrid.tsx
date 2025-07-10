import type { Artist } from '@spotify/web-api-ts-sdk'
import React from 'react'

interface ArtistGridProps {
  artists: Artist[]
}

const ArtistGrid: React.FC<ArtistGridProps> = ({ artists }) => {
  if (artists.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">Artists You Follow</h2>
        <p className="text-gray-600">You're not following any artists yet.</p>
      </div>
    )
  }

  return (
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
  )
}

export default ArtistGrid
