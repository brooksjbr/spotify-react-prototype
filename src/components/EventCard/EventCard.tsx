import React from 'react'

import type { Event } from '@/@types/event'

interface EventCardProps {
  event: Event
}

const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr)
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

const formatTime = (timeStr: string): string => {
  const [hours, minutes] = timeStr.split(':')
  const hour = parseInt(hours, 10)
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const hour12 = hour % 12 || 12
  return `${hour12}:${minutes} ${ampm}`
}

const formatPrice = (min?: number, max?: number, currency = 'USD'): string => {
  if (!min && !max) return ''
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  })
  if (min && max && min !== max) {
    return `${formatter.format(min)} - ${formatter.format(max)}`
  }
  return formatter.format(min || max || 0)
}

const EventCard: React.FC<EventCardProps> = ({ event }) => {
  const priceDisplay = formatPrice(
    event.price_min,
    event.price_max,
    event.currency,
  )

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow w-[300px] flex-shrink-0">
      <div className="w-full h-[180px] bg-gray-200">
        {event.image_url ? (
          <img
            src={event.image_url}
            alt={event.event_name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <span className="text-4xl">🎵</span>
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-bold text-lg line-clamp-2 mb-1">
          {event.event_name}
        </h3>
        <p className="text-sm text-green-600 font-medium mb-2">
          {event.artist_name}
        </p>
        <div className="text-sm text-gray-600 space-y-1">
          <p>
            📅 {formatDate(event.local_date)}
            {event.local_time && ` at ${formatTime(event.local_time)}`}
          </p>
          <p>📍 {event.venue_name}</p>
          <p>
            {event.city}, {event.state}
          </p>
          {priceDisplay && (
            <p className="font-semibold text-gray-800">{priceDisplay}</p>
          )}
        </div>
        {event.event_url && (
          <a
            href={event.event_url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-3 inline-block bg-green-500 hover:bg-green-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors"
          >
            Get Tickets
          </a>
        )}
      </div>
    </div>
  )
}

export default EventCard
