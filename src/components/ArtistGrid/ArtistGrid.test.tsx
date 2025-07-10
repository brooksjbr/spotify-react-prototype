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
  test('renders empty state when no artists provided', () => {
    render(<ArtistGrid artists={[]} />)

    expect(screen.getByText('Artists You Follow')).toBeInTheDocument()
    expect(
      screen.getByText("You're not following any artists yet."),
    ).toBeInTheDocument()
  })

  test('renders artist grid with correct count', () => {
    render(<ArtistGrid artists={mockArtists} />)

    expect(screen.getByText('Artists You Follow (3)')).toBeInTheDocument()
  })

  test('renders all artist information correctly', () => {
    render(<ArtistGrid artists={mockArtists} />)

    // Check artist names
    expect(screen.getByText('Artist One')).toBeInTheDocument()
    expect(screen.getByText('Artist Two')).toBeInTheDocument()
    expect(screen.getByText('Artist Three')).toBeInTheDocument()

    // Check follower counts (formatted)
    expect(screen.getByText('1,000,000 followers')).toBeInTheDocument()
    expect(screen.getByText('500,000 followers')).toBeInTheDocument()
    expect(screen.getByText('250,000 followers')).toBeInTheDocument()

    // Check genres (first 2 only)
    expect(screen.getByText('rock, alternative')).toBeInTheDocument()
    expect(screen.getByText('pop, electronic')).toBeInTheDocument()
  })

  test('renders artist images when available', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const artistOneImage = screen.getByAltText('Artist One')
    const artistTwoImage = screen.getByAltText('Artist Two')

    expect(artistOneImage).toBeInTheDocument()
    expect(artistOneImage).toHaveAttribute(
      'src',
      'http://example.com/artist1.jpg',
    )
    expect(artistTwoImage).toBeInTheDocument()
    expect(artistTwoImage).toHaveAttribute(
      'src',
      'http://example.com/artist2.jpg',
    )

    // Artist Three has no images, so no image should be rendered
    expect(screen.queryByAltText('Artist Three')).not.toBeInTheDocument()
  })

  test('handles artists with no genres gracefully', () => {
    render(<ArtistGrid artists={mockArtists} />)

    // Artist Three has no genres, so no genre text should appear for it
    const artistThreeCard = screen.getByText('Artist Three').closest('div')
    expect(artistThreeCard).toBeInTheDocument()

    // Should still show name and followers
    expect(screen.getByText('Artist Three')).toBeInTheDocument()
    expect(screen.getByText('250,000 followers')).toBeInTheDocument()
  })

  test('applies correct CSS classes for responsive grid', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const gridContainer = screen.getByText('Artist One').closest('.grid')
    expect(gridContainer).toHaveClass(
      'grid',
      'grid-cols-1',
      'md:grid-cols-2',
      'lg:grid-cols-3',
      'gap-4',
    )
  })

  test('applies hover effects to artist cards', () => {
    render(<ArtistGrid artists={mockArtists} />)

    const artistCard = screen.getByText('Artist One').closest('div')
    expect(artistCard).toHaveClass('hover:bg-gray-200', 'transition-colors')
  })
})
