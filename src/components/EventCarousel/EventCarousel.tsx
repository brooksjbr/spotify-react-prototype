import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useRef } from 'react'

import type { Event } from '@/@types/event'
import EventCard from '@/components/EventCard'
import { Button } from '@/components/ui/button'
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area'

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
      <div className="py-4">
        <h2 className="mb-2 text-xl font-semibold">{title}</h2>
        <p className="text-muted-foreground">
          No matching events found in your area.
        </p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">
          {title}{' '}
          <span className="text-muted-foreground">({events.length})</span>
        </h2>
        <div className="flex gap-1">
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <ChevronLeft className="size-4" />
          </Button>
          <Button
            variant="outline"
            size="icon-sm"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <ChevronRight className="size-4" />
          </Button>
        </div>
      </div>
      <ScrollArea className="w-full">
        <div ref={scrollRef} className="flex gap-4 pb-4">
          {events.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  )
}

export default EventCarousel
