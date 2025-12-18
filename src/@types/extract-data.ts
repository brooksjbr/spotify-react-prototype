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
  payload: unknown
  updated_at: string
}

export interface SpotifyArtistPayload {
  items: Array<{
    name: string
    id: string
    [key: string]: unknown
  }>
}

export function extractArtistNames(data: SpotifyDataResponse[]): string[] {
  const names = new Set<string>()

  for (const item of data) {
    if (
      item.data_type === 'top-artists' ||
      item.data_type === 'followed-artists'
    ) {
      const payload = item.payload as SpotifyArtistPayload
      if (payload?.items) {
        for (const artist of payload.items) {
          if (artist.name) {
            names.add(artist.name)
          }
        }
      }
    }
  }

  return Array.from(names)
}
