import type {
    OAuthExtractionRequest,
    OAuthExtractionResponse,
    SpotifyResource,
    SpotifyDataResponse,
} from '@/@types/extract-data'

const EXTRACT_DATA_URL =
    import.meta.env.VITE_EXTRACT_DATA_URL || 'http://localhost:5150'

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

export async function getSpotifyData(
    userId: string,
    dataType?: SpotifyResource,
): Promise<SpotifyDataResponse[]> {
    const params = new URLSearchParams()
    if (dataType) {
        params.set('data_type', dataType)
    }

    const url = `${EXTRACT_DATA_URL}/spotify/data/${userId}${
        params.toString() ? `?${params}` : ''
    }`

    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
        },
    })

    if (!response.ok) {
        const error = await response.json()
        throw new Error(error.detail || 'Failed to fetch Spotify data')
    }

    return response.json()
}

export function getStoredClientRef(): string | null {
    return localStorage.getItem(STORAGE_KEYS.EXTRACTION_CLIENT_REF)
}

export function clearStoredClientRef(): void {
    localStorage.removeItem(STORAGE_KEYS.EXTRACTION_CLIENT_REF)
}
