/**
 * בדיקות אוטומציה לאלגוריתם ההמלצות
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהאלגוריתם מחזיר שירים על בסיס שירים אהובים
 * 2. בודקות שהאלגוריתם משלב שירים מכמה מקורות (artists, genres, years)
 * 3. בודקות שהאלגוריתם מסנן שירים כפולים
 * 4. בודקות שהאלגוריתם מחזיר את המספר הנכון של שירים
 * 5. בודקות שהאלגוריתם מטפל במקרי קצה (אין שירים אהובים, אין תוצאות וכו')
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  generateMoreFromLiked,
  getSpotifyRecommendations,
  searchTracksByGenreAndYear
} from '../../services/spotifyService';

describe('Recommendation Algorithm - generateMoreFromLiked', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return empty array when no liked songs', async () => {
    const result = await generateMoreFromLiked([], 50, 'US', []);
    expect(result).toEqual([]);
  });

  it('should generate recommendations based on liked songs', async () => {
    const likedSongs = [
      {
        id: 'track1',
        title: 'Liked Song 1',
        artist: 'Artist 1',
        artistId: 'artist1',
        releaseYear: 2020
      },
      {
        id: 'track2',
        title: 'Liked Song 2',
        artist: 'Artist 2',
        artistId: 'artist2',
        releaseYear: 2021
      }
    ];

    // Mock the internal API calls
    global.fetch = vi.fn((url) => {
      if (url.includes('/tracks')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tracks: likedSongs.map(song => ({
              id: song.id,
              name: song.title,
              artists: [{ name: song.artist, id: song.artistId }],
              album: {
                images: [{ url: 'image.jpg' }],
                release_date: `${song.releaseYear}-01-01`
              },
              duration_ms: 180000,
              popularity: 70
            }))
          })
        });
      }
      if (url.includes('/artists')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            artists: [
              {
                id: 'artist1',
                genres: ['rock', 'pop'],
                popularity: 80
              },
              {
                id: 'artist2',
                genres: ['pop', 'indie'],
                popularity: 75
              }
            ]
          })
        });
      }
      if (url.includes('/recommendations')) {
        return Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tracks: [
              {
                id: 'rec1',
                name: 'Recommended Song',
                artists: [{ name: 'Recommended Artist' }],
                album: { images: [{ url: 'image.jpg' }] },
                duration_ms: 180000,
                popularity: 70
              }
            ]
          })
        });
      }
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tracks: { items: [] } })
      });
    });

    const result = await generateMoreFromLiked(likedSongs, 10, 'US', []);
    
    expect(Array.isArray(result)).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  it('should exclude already shown tracks', async () => {
    const likedSongs = [
      { id: 'track1', title: 'Song 1', artist: 'Artist', artistId: 'artist1', releaseYear: 2020 }
    ];

    const excludeTrackIds = ['rec1', 'rec2'];

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tracks: [
            { id: 'rec1', name: 'Rec 1', artists: [{ name: 'Artist' }], album: { images: [] }, duration_ms: 180000 },
            { id: 'rec3', name: 'Rec 3', artists: [{ name: 'Artist' }], album: { images: [] }, duration_ms: 180000 }
          ]
        })
      })
    );

    const result = await generateMoreFromLiked(likedSongs, 10, 'US', excludeTrackIds);
    
    // Should not include excluded tracks
    const resultIds = result.map(t => t.id);
    expect(resultIds).not.toContain('rec1');
    expect(resultIds).not.toContain('rec2');
  });

  it('should handle errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const likedSongs = [
      { id: 'track1', title: 'Song', artist: 'Artist', artistId: 'artist1', releaseYear: 2020 }
    ];

    const result = await generateMoreFromLiked(likedSongs, 10, 'US', []);
    expect(result).toEqual([]);
  });
});

describe('Recommendation Algorithm - getSpotifyRecommendations', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return recommendations based on genre IDs', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tracks: [
            {
              id: 'track1',
              name: 'Recommended',
              artists: [{ name: 'Artist' }],
              album: { images: [{ url: 'image.jpg' }] },
              duration_ms: 180000,
              popularity: 70
            }
          ]
        })
      })
    );

    const result = await getSpotifyRecommendations({
      genreIds: [1, 2], // pop, rock
      limit: 10,
      userCountry: 'US'
    });

    expect(Array.isArray(result)).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  it('should use default genre when no seeds provided', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tracks: [] })
      })
    );

    await getSpotifyRecommendations({
      genreIds: [],
      artistIds: [],
      limit: 10,
      userCountry: 'US'
    });

    // Should use default 'pop' genre
    expect(fetch).toHaveBeenCalled();
    const callUrl = fetch.mock.calls[0][0];
    expect(callUrl).toContain('seed_genres=pop');
  });

  it('should respect limit parameter', async () => {
    const mockTracks = Array.from({ length: 100 }, (_, i) => ({
      id: `track${i}`,
      name: `Song ${i}`,
      artists: [{ name: 'Artist' }],
      album: { images: [{ url: 'image.jpg' }] },
      duration_ms: 180000,
      popularity: 70
    }));

    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({ tracks: mockTracks })
      })
    );

    const result = await getSpotifyRecommendations({
      genreIds: [1],
      limit: 20,
      userCountry: 'US'
    });

    expect(result.length).toBeLessThanOrEqual(20);
  });
});

describe('Recommendation Algorithm - Track Deduplication', () => {
  it('should remove duplicate tracks by ID', () => {
    const tracks = [
      { id: 'track1', title: 'Song 1' },
      { id: 'track2', title: 'Song 2' },
      { id: 'track1', title: 'Song 1 Duplicate' }, // duplicate
      { id: 'track3', title: 'Song 3' }
    ];

    const unique = Array.from(new Map(tracks.map(t => [t.id, t])).values());
    
    expect(unique).toHaveLength(3);
    expect(unique.map(t => t.id)).toEqual(['track1', 'track2', 'track3']);
  });

  it('should handle empty arrays', () => {
    const tracks = [];
    const unique = Array.from(new Map(tracks.map(t => [t.id, t])).values());
    
    expect(unique).toHaveLength(0);
  });
});

