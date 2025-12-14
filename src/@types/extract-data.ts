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
  | 'recently-played'

export interface ExtractedDataItem {
  _client_ref: string
  type: string
  [key: string]: unknown
}
