import type {
  OAuthExtractionRequest,
  OAuthExtractionResponse,
  SpotifyResource,
  ExtractedDataItem,
} from '@/@types/extract-data'

const EXTRACT_DATA_URL =
  import.meta.env.VITE_EXTRACT_DATA_URL || 'http://localhost:8000'

const ES_PROXY_URL = '/api/es'
const EXTRACT_DATA_INDEX = 'extract-data'

export const STORAGE_KEYS = {
  EXTRACTION_CLIENT_REF: 'extraction_client_ref',
} as const

export async function triggerSpotifyExtraction(
  accessToken: string,
  refreshToken: string | null,
  resources: SpotifyResource[],
  params?: Record<string, unknown>,
): Promise<OAuthExtractionResponse> {
  const clientRef = crypto.randomUUID()

  const request: OAuthExtractionRequest = {
    access_token: accessToken,
    refresh_token: refreshToken ?? undefined,
    resources,
    client_ref: clientRef,
    params,
  }

  const response = await fetch(`${EXTRACT_DATA_URL}/oauth/spotify/extract`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
  })

  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.detail || 'Extraction request failed')
  }

  const result: OAuthExtractionResponse = await response.json()

  localStorage.setItem(STORAGE_KEYS.EXTRACTION_CLIENT_REF, result.client_ref)

  return result
}

export async function getExtractedData<T = ExtractedDataItem>(
  clientRef: string,
  resourceType?: string,
): Promise<T[]> {
  const query = {
    query: {
      bool: {
        must: [
          { term: { _client_ref: clientRef } },
          ...(resourceType ? [{ term: { type: resourceType } }] : []),
        ],
      },
    },
    size: 1000,
  }

  const response = await fetch(
    `${ES_PROXY_URL}/${EXTRACT_DATA_INDEX}/_search`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(query),
    },
  )

  if (!response.ok) {
    throw new Error(
      `ES search failed: ${response.status} ${response.statusText}`,
    )
  }

  const result = await response.json()
  return result.hits.hits.map((hit: { _source: T }) => hit._source)
}

export function getStoredClientRef(): string | null {
  return localStorage.getItem(STORAGE_KEYS.EXTRACTION_CLIENT_REF)
}

export function clearStoredClientRef(): void {
  localStorage.removeItem(STORAGE_KEYS.EXTRACTION_CLIENT_REF)
}
