import { ChevronLeft, ChevronRight } from 'lucide-react'
import React, { useRef } from 'react'

import type { Event } from '@/@types/event'
import EventCard from '@/components/EventCard'
import { Button } from '@/components/ui/button'

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
            <div className="mb-4 flex items-center gap-4">
                <h2 className="text-xl font-semibold text-foreground">
                    {title}
                    <span className="ml-2 text-muted-foreground">
                        ({events.length})
                    </span>
                </h2>
                <div className="flex gap-1">
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => scroll('left')}
                        aria-label="Scroll left"
                        className="size-8 rounded-full"
                    >
                        <ChevronLeft className="size-5" />
                    </Button>
                    <Button
                        variant="secondary"
                        size="icon-sm"
                        onClick={() => scroll('right')}
                        aria-label="Scroll right"
                        className="size-8 rounded-full"
                    >
                        <ChevronRight className="size-5" />
                    </Button>
                </div>
            </div>
            <div
                ref={scrollRef}
                className="flex gap-4 overflow-x-auto pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
                {events.map((event) => (
                    <EventCard key={event.id} event={event} />
                ))}
            </div>
        </div>
    )
}

export default EventCarousel
