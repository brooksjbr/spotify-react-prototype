import React, { useRef } from 'react'

import type { Event } from '@/@types/event'
import EventCard from '@/components/EventCard'

interface EventCarouselProps {
  events: Event[]
  title?: string
}

const EventCarousel: React.FC<EventCarouselProps> = ({
  events,
  title = 'Upcoming Events',
}) => {
  const scrollRef = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 320
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  if (events.length === 0) {
    return (
      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">{title}</h2>
        <p className="text-gray-600">No matching events found in your area.</p>
      </div>
    )
  }

  return (
    <div className="mt-6 w-full max-w-full">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {title} ({events.length})
        </h2>
        <div className="flex gap-2">
          <button
            onClick={() => scroll('left')}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Scroll left"
          >
            ←
          </button>
          <button
            onClick={() => scroll('right')}
            className="p-2 rounded-full bg-gray-200 hover:bg-gray-300 transition-colors"
            aria-label="Scroll right"
          >
            →
          </button>
        </div>
      </div>
      <div
        ref={scrollRef}
        className="overflow-x-auto pb-4"
        style={{
          scrollbarWidth: 'none',
          msOverflowStyle: 'none',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div className="inline-flex gap-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default EventCarousel
