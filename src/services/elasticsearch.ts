import type {
    Event,
    EventSearchParams,
    ESSearchResponse,
    EventSearchByCity,
    EventSearchByMetroCluster,
} from '@/@types/event'

const ES_PROXY_URL = '/api/es'
const EVENTS_INDEX = 'events'

export async function getEventsByMetroCluster(
    params: EventSearchByMetroCluster,
): Promise<Event[]> {
    const { artistNames, metro_cluster, coordinates } = params

    if (artistNames.length === 0) {
        return []
    }

    if (!metro_cluster || metro_cluster.length === 0) {
        return []
    }

    const artistShould = artistNames.map((name) => {
        const wordCount = name.trim().split(/\s+/).length
        const isShort = name.length <= 5

        if (isShort && wordCount === 1) {
            return { term: { 'artist_name.keyword': name } }
        } else if (wordCount > 1) {
            return { match_phrase: { artist_name: { query: name, slop: 1 } } }
        } else {
            return { match: { artist_name: { query: name, fuzziness: '1' } } }
        }
    })

    const metroClusterFunctions = metro_cluster.map((cluster, index) => ({
        filter: { term: { metro_cluster: cluster } },
        weight: index === 0 ? 1.5 : 1.0,
    }))

    const functions: object[] = [...metroClusterFunctions]

    if (coordinates) {
        functions.push({
            gauss: {
                coordinates: {
                    origin: coordinates,
                    scale: '20mi',
                    decay: 0.5,
                },
            },
        })
    }

    const query = {
        query: {
            function_score: {
                query: {
                    bool: {
                        must: [
                            {
                                bool: {
                                    should: artistShould,
                                    minimum_should_match: 1,
                                },
                            },
                        ],
                        filter: [
                            {
                                terms: {
                                    metro_cluster: metro_cluster,
                                },
                            },
                            {
                                range: {
                                    start_date: {
                                        gte: 'now/d',
                                    },
                                },
                            },
                        ],
                    },
                },
                functions: functions,
                score_mode: 'sum',
                boost_mode: 'multiply',
            },
        },
        size: 500,
        sort: [{ local_date: 'asc' }],
    }

    const response = await fetch(`${ES_PROXY_URL}/${EVENTS_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    })

    if (!response.ok) {
        throw new Error(
            `ES search failed: ${response.status} ${response.statusText}`,
        )
    }

    const data: ESSearchResponse<Event> = await response.json()

    return data.hits.hits.map((hit) => ({
        ...hit._source,
        id: hit._id,
    }))
}

export async function getEventsByCity(
    params: EventSearchByCity,
): Promise<Event[]> {
    const { artistNames, states } = params

    if (artistNames.length === 0) {
        return []
    }
    const filters: object[] = []
    if (states && states.length > 0) {
        filters.push({
            terms: { state: states },
        })
    }

    filters.push({
        range: {
            start_date: {
                gte: 'now/d',
            },
        },
    })

    const artistShould = artistNames.map((name) => {
        const wordCount = name.trim().split(/\s+/).length
        const isShort = name.length <= 5

        if (isShort && wordCount === 1) {
            // Short single-word: exact match only
            return { term: { 'artist_name.keyword': name } }
        } else if (wordCount > 1) {
            // Multi-word: use match_phrase
            return { match_phrase: { artist_name: { query: name, slop: 1 } } }
        } else {
            // Longer single-word: fuzzy match
            return { match: { artist_name: { query: name, fuzziness: '1' } } }
        }
    })

    const query = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            should: artistShould,
                            minimum_should_match: 1,
                        },
                    },
                ],
                filter: filters,
            },
        },
        size: 500,
        sort: [{ local_date: 'asc' }],
    }

    const response = await fetch(`${ES_PROXY_URL}/${EVENTS_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    })

    if (!response.ok) {
        throw new Error(
            `ES search failed: ${response.status} ${response.statusText}`,
        )
    }

    const data: ESSearchResponse<Event> = await response.json()

    return data.hits.hits.map((hit) => ({
        ...hit._source,
        id: hit._id,
    }))
}

export async function getEvents(params: EventSearchParams): Promise<Event[]> {
    const { artistNames, fromDate } = params

    if (artistNames.length === 0) {
        return []
    }

    const dateFilter = fromDate ?? new Date().toISOString().split('T')[0]

    const query = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            should: artistNames.map((name) => ({
                                match: {
                                    artist_name: {
                                        query: name,
                                        operator: 'and',
                                    },
                                },
                            })),
                            minimum_should_match: 1,
                        },
                    },
                ],
                filter: [
                    {
                        range: {
                            local_date: {
                                gte: dateFilter,
                            },
                        },
                    },
                ],
            },
        },
        size: 100,
        sort: [{ local_date: 'asc' }],
    }

    const response = await fetch(`${ES_PROXY_URL}/${EVENTS_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    })

    if (!response.ok) {
        throw new Error(
            `ES search failed: ${response.status} ${response.statusText}`,
        )
    }

    const data: ESSearchResponse<Event> = await response.json()

    return data.hits.hits.map((hit) => ({
        ...hit._source,
        id: hit._id,
    }))
}

export async function getArtistsWithEvents(
    params: EventSearchParams,
): Promise<string[]> {
    const { artistNames, city, state, fromDate, timezone } = params

    if (artistNames.length === 0) {
        return []
    }

    const dateFilter = fromDate ?? new Date().toISOString().split('T')[0]

    const filters: object[] = [
        {
            bool: {
                should: [
                    { match: { city: city } },
                    { match: { state: state } },
                    { match: { state_name: city } },
                ],
                minimum_should_match: 1,
            },
        },
        {
            range: {
                local_date: {
                    gte: dateFilter,
                },
            },
        },
    ]

    if (timezone) {
        filters.push({
            bool: {
                should: [
                    { match: { venue_timezone: timezone } },
                    { match: { event_timezone: timezone } },
                ],
                minimum_should_match: 1,
            },
        })
    }

    const query = {
        query: {
            bool: {
                must: [
                    {
                        bool: {
                            should: artistNames.map((name) => ({
                                match: {
                                    artist_name: {
                                        query: name,
                                        fuzziness: 'AUTO',
                                    },
                                },
                            })),
                            minimum_should_match: 1,
                        },
                    },
                ],
                filter: filters,
            },
        },
        size: 0,
        aggs: {
            artists_with_events: {
                terms: {
                    field: 'artist_name.keyword',
                    size: artistNames.length,
                },
            },
        },
    }

    const response = await fetch(`${ES_PROXY_URL}/${EVENTS_INDEX}/_search`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(query),
    })

    if (!response.ok) {
        throw new Error(
            `ES search failed: ${response.status} ${response.statusText}`,
        )
    }

    interface AggregationResponse {
        aggregations?: {
            artists_with_events: {
                buckets: Array<{ key: string; doc_count: number }>
            }
        }
    }

    const data: AggregationResponse = await response.json()

    return (
        data.aggregations?.artists_with_events.buckets.map(
            (bucket) => bucket.key,
        ) ?? []
    )
}
