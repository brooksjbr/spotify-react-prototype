import type { Event, EventSearchParams, ESSearchResponse } from '@/@types/event'

const ES_PROXY_URL = '/api/es'
const EVENTS_INDEX = 'events'

export async function searchEvents(
  params: EventSearchParams,
): Promise<Event[]> {
  const { artistNames, city, state } = params

  if (artistNames.length === 0) {
    return []
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
        filter: [
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
        ],
      },
    },
    size: 50,
    sort: [{ start_date: { order: 'asc' } }],
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
