import type { Artist } from '@spotify/web-api-ts-sdk'
import { render, screen } from '@testing-library/react'

import ArtistGrid from './ArtistGrid'

const mockArtists: Artist[] = [
  {
    id: '1',
    name: 'Artist One',
    genres: ['rock', 'alternative'],
    popularity: 85,
    followers: { total: 1000000, href: null },
    images: [
      { url: 'http://example.com/artist1.jpg', height: 640, width: 640 },
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/1' },
    href: 'https://api.spotify.com/v1/artists/1',
    type: 'artist',
    uri: 'spotify:artist:1',
  },
  {
    id: '2',
    name: 'Artist Two',
    genres: ['pop', 'electronic'],
    popularity: 78,
    followers: { total: 500000, href: null },
    images: [
      { url: 'http://example.com/artist2.jpg', height: 640, width: 640 },
    ],
    external_urls: { spotify: 'https://open.spotify.com/artist/2' },
    href: 'https://api.spotify.com/v1/artists/2',
    type: 'artist',
    uri: 'spotify:artist:2',
  },
  {
    id: '3',
    name: 'Artist Three',
    genres: [],
    popularity: 65,
    followers: { total: 250000, href: null },
    images: [],
    external_urls: { spotify: 'https://open.spotify.com/artist/3' },
    href: 'https://api.spotify.com/v1/artists/3',
    type: 'artist',
    uri: 'spotify:artist:3',
  },
]

describe('ArtistGrid Component', () => {
  test('returns null when no artists provided', () => {
    const { container } = render(<ArtistGrid artists={[]} />)
    expect(container.firstChild).toBeNull()
  })

  test('renders all artist names', () => {
    render(<ArtistGrid artists={mockArtists} />)

    expect(screen.getByText('Artist One')).toBeInTheDocument()
    expect(screen.getByText('Artist Two')).toBeInTheDocument()
    expect(screen.getByText('Artist Three')).toBeInTheDocument()
  })

  test('renders follower counts formatted correctly', () => {
    render(<ArtistGrid artists={mockArtists} />)

    expect(screen.getByText('1,000,000')).toBeInTheDocument()
    expect(screen.getByText('500,000')).toBeInTheDocument()
    expect(screen.getByText('250,000')).toBeInTheDocument()
  })

  test('renders genre badges for artists with genres', () => {
    render(<ArtistGrid artists={mockArtists} />)

    expect(screen.getByText('rock')).toBeInTheDocument()
    expect(screen.getByText('alternative')).toBeInTheDocument()
    expect(screen.getByText('pop')).toBeInTheDocument()
    expect(screen.getByText('electronic')).toBeInTheDocument()
  })

  test('handles artists with no genres gracefully', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const artistThreeCard = screen
      .getByText('Artist Three')
      .closest('[data-slot="card"]')
    expect(artistThreeCard).toBeInTheDocument()

    const badges = artistThreeCard?.querySelectorAll('[data-slot="badge"]')
    expect(badges?.length).toBe(0)
  })

  test('applies correct CSS classes for responsive grid', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const gridContainer = screen.getByText('Artist One').closest('.grid')
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'sm:grid-cols-2',
      'lg:grid-cols-3',
      'xl:grid-cols-4',
      'gap-4',
    )
  })

  test('renders cards with hover effect classes', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const artistCard = screen
      .getByText('Artist One')
      .closest('[data-slot="card"]')
    expect(artistCard).toHaveClass('hover:bg-accent/50', 'transition-colors')
  })

  test('renders correct number of cards', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const cards = screen
      .getByText('Artist One')
      .closest('.grid')
      ?.querySelectorAll('[data-slot="card"]')
    expect(cards?.length).toBe(3)
  })
})
