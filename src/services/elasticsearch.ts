import type {
  Event,
  EventSearchParams,
  ESSearchResponse,
  EventSearchByCity,
} from '@/@types/event'

const ES_PROXY_URL = '/api/es'
const EVENTS_INDEX = 'events'

export async function getEventsByCity(
  params: EventSearchByCity,
): Promise<Event[]> {
  const { artistNames, cities, states, fromDate } = params

  if (artistNames.length === 0) {
    return []
  }

  const dateFilter = fromDate ?? new Date().toISOString().split('T')[0]

  const locationShould: object[] = []

  cities.forEach((city, index) => {
    const state = states[index]
    if (state) {
      locationShould.push({
        bool: {
          must: [
            { match: { city: { query: city } } },
            {
              bool: {
                should: [
                  { match: { state: { query: state } } },
                  { match: { state_name: { query: state } } },
                ],
                minimum_should_match: 1,
              },
            },
          ],
        },
      })
    } else {
      locationShould.push({
        match: { city: { query: city } },
      })
    }
  })

  const filters: object[] = [
    {
      range: {
        local_date: {
          gte: dateFilter,
        },
      },
    },
  ]

  if (locationShould.length > 0) {
    filters.push({
      bool: {
        should: locationShould,
        minimum_should_match: 1,
      },
    })
  }

  const query = {
    query: {
      bool: {
        must: [
          {
            terms: {
              'artist_name.keyword': artistNames,
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
