export interface Event {
    id: string
    event_name: string
    artist_name: string
    event_type?: string
    category?: string
    genre?: string
    sub_genre?: string
    venue_name?: string
    city: string
    state: string
    state_name?: string
    postal_code?: string
    country?: string
    country_name?: string
    address?: string
    venue_timezone?: string
    local_date: string
    local_time?: string
    start_date?: string
    event_timezone?: string
    status?: string
    event_url?: string
    image_url?: string
    info?: string
    please_note?: string
    coordinates?: {
        lat: number
        lon: number
    }
    price_min?: number
    price_max?: number
    currency?: string
    provider?: string
}

export interface EventSearchByMetroCluster {
    artistNames: string[]
    metro_cluster: string[]
    coordinates?: string
    fromDate?: string
    timezone?: string
}

export interface EventSearchByCity {
    artistNames: string[]
    cities: string[]
    states: string[]
    fromDate?: string
    timezone?: string
}

export interface EventSearchParams {
    artistNames: string[]
    city: string
    state: string
    fromDate?: string
    timezone?: string
}

export interface ESSearchResponse<T> {
    hits: {
        total: {
            value: number
            relation: string
        }
        hits: Array<{
            _index: string
            _id: string
            _score: number
            _source: T
        }>
    }
}
