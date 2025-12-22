export interface OAuthExtractionRequest {
  access_token: string
  refresh_token?: string
  resources: SpotifyResource[]
  client_ref: string
  params?: Record<string, unknown>
}

export interface OAuthExtractionResponse {
  status: 'accepted'
  client_ref: string
  provider: string
  resources: string[]
  message: string
}

export type SpotifyResource =
  | 'me'
  | 'top-artists'
  | 'top-tracks'
  | 'saved-tracks'
  | 'saved-albums'
  | 'followed-artists'
  | 'playlists'

export interface SpotifyDataResponse {
  user_id: string
  data_type: string
  payload: SpotifyArtistPayload
  updated_at: string
}

interface SpotifyArtist {
  name: string
  id: string
  [key: string]: unknown
}

interface SpotifyTrack {
  artists?: SpotifyArtist[]
  track?: {
    artists?: SpotifyArtist[]
    [key: string]: unknown
  }
  [key: string]: unknown
}

interface PaginatedResponse {
  items: (SpotifyArtist | SpotifyTrack)[]
  total: number
  limit: number
  offset: number
  [key: string]: unknown
}

interface PlaylistItem {
  tracks?: {
    items?: Array<{ track?: { artists?: SpotifyArtist[] } }>
  }
  [key: string]: unknown
}

export interface SpotifyArtistPayload {
  items: PaginatedResponse[]
}

export interface SpotifyPlaylistPayload {
  items: PlaylistItem[]
}

function extractArtistsFromTrack(track: SpotifyTrack): string[] {
  const names: string[] = []

  if (track.artists) {
    for (const artist of track.artists) {
      if (artist.name) {
        names.push(artist.name)
      }
    }
  }

  if (track.track?.artists) {
    for (const artist of track.track.artists) {
      if (artist.name) {
        names.push(artist.name)
      }
    }
  }

  return names
}

export function extractArtistNames(data: SpotifyDataResponse[]): string[] {
  const names = new Set<string>()

  for (const item of data) {
    const payload = item.payload as SpotifyArtistPayload

    if (
      item.data_type === 'top-artists' ||
      item.data_type === 'followed-artists'
    ) {
      if (payload?.items) {
        for (const page of payload.items) {
          if (page?.items) {
            for (const artist of page.items as SpotifyArtist[]) {
              if (artist.name) {
                names.add(artist.name)
              }
            }
          }
        }
      }
    }

    if (item.data_type === 'top-tracks' || item.data_type === 'saved-tracks') {
      if (payload?.items) {
        for (const page of payload.items) {
          if (page?.items) {
            for (const track of page.items as SpotifyTrack[]) {
              for (const name of extractArtistsFromTrack(track)) {
                names.add(name)
              }
            }
          }
        }
      }
    }

    if (item.data_type === 'playlists') {
      const playlistPayload = item.payload as SpotifyPlaylistPayload
      if (playlistPayload?.items) {
        for (const playlist of playlistPayload.items) {
          if (playlist.tracks?.items) {
            for (const trackItem of playlist.tracks.items) {
              if (trackItem.track?.artists) {
                for (const artist of trackItem.track.artists) {
                  if (artist.name) {
                    names.add(artist.name)
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  return Array.from(names)
}
