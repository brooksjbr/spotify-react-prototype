import type { EventSearchParams } from '@/@types/event'

const ES_PROXY_URL = '/api/es'
const EVENTS_INDEX = 'events'

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
