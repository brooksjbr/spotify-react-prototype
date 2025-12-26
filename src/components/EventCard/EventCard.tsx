import { Calendar, MapPin, Music } from 'lucide-react'
import React from 'react'

import type { Event } from '@/@types/event'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter } from '@/components/ui/card'

interface EventCardProps {
    event: Event
}

const formatDate = (dateStr: string): string => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
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
        <Card className="w-[300px] shrink-0 overflow-hidden py-0">
            <div className="relative h-[160px] w-full bg-muted">
                {event.image_url ? (
                    <img
                        src={event.image_url}
                        alt={event.event_name}
                        className="size-full object-cover"
                    />
                ) : (
                    <div className="flex size-full items-center justify-center">
                        <Music className="size-12 text-muted-foreground" />
                    </div>
                )}
                {priceDisplay && (
                    <Badge className="absolute bottom-2 right-2 bg-primary text-primary-foreground">
                        {priceDisplay}
                    </Badge>
                )}
            </div>
            <CardContent className="space-y-3 pt-4">
                <div>
                    <h3 className="line-clamp-2 font-semibold leading-tight">
                        {event.event_name}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-primary">
                        {event.artist_name}
                    </p>
                </div>
                <div className="space-y-1.5 text-sm text-muted-foreground">
                    <div className="flex items-center gap-2">
                        <Calendar className="size-4 shrink-0" />
                        <span>
                            {formatDate(event.local_date)}
                            {event.local_time &&
                                ` • ${formatTime(event.local_time)}`}
                        </span>
                    </div>
                    <div className="flex items-start gap-2">
                        <MapPin className="mt-0.5 size-4 shrink-0" />
                        <span className="line-clamp-2">
                            {event.venue_name}, {event.city}
                        </span>
                    </div>
                </div>
            </CardContent>
            {event.event_url && (
                <CardFooter className="pb-4">
                    <Button asChild className="w-full">
                        <a
                            href={event.event_url}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Get Tickets
                        </a>
                    </Button>
                </CardFooter>
            )}
        </Card>
    )
}

export default EventCard
