/**
 * בדיקות אוטומציה ל-SpotifyService
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהפונקציות מחזירות את הטיפוס הנכון
 * 2. בודקות שהפונקציות מטפלות בשגיאות נכון
 * 3. בודקות שהפרמטרים מועברים נכון
 * 
 * הערה: חלק מהבדיקות האלה הן mock tests כי אנחנו לא רוצים לקרוא ל-Spotify API אמיתי
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchTracksByGenreAndYear,
  getPopularTracksForCountry,
  getArtistTopTracks
} from '../../services/spotifyService';

describe('SpotifyService', () => {
  beforeEach(() => {
    // נקה mocks לפני כל בדיקה
    vi.clearAllMocks();
  });

  describe('searchTracksByGenreAndYear', () => {
    it('should return an array', async () => {
      // Mock fetch
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tracks: {
              items: []
            }
          })
        })
      );

      const result = await searchTracksByGenreAndYear([1, 2], { from: 2010, to: 2025 }, 'US', 10);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle empty genre array', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tracks: { items: [] } })
        })
      );

      const result = await searchTracksByGenreAndYear([], { from: 2010, to: 2025 }, 'US', 10);
      expect(result).toEqual([]);
    });

    it('should handle errors gracefully', async () => {
      global.fetch = vi.fn(() =>
        Promise.reject(new Error('Network error'))
      );

      const result = await searchTracksByGenreAndYear([1], { from: 2010, to: 2025 }, 'US', 10);
      expect(result).toEqual([]);
    });
  });

  describe('getPopularTracksForCountry', () => {
    it('should return an array of tracks', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tracks: {
              items: [
                {
                  id: 'track1',
                  name: 'Popular Song',
                  artists: [{ name: 'Popular Artist' }],
                  album: { images: [{ url: 'image.jpg' }] }
                }
              ]
            }
          })
        })
      );

      const result = await getPopularTracksForCountry('US', 10);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should use default country if not provided', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({ tracks: { items: [] } })
        })
      );

      await getPopularTracksForCountry();
      expect(fetch).toHaveBeenCalled();
    });
  });

  describe('getArtistTopTracks', () => {
    it('should return an array of tracks', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            tracks: [
              {
                id: 'track1',
                name: 'Top Song',
                artists: [{ name: 'Artist' }]
              }
            ]
          })
        })
      );

      const result = await getArtistTopTracks('artist123');
      expect(Array.isArray(result)).toBe(true);
    });

    it('should handle invalid artist ID', async () => {
      global.fetch = vi.fn(() =>
        Promise.resolve({
          ok: false,
          status: 404
        })
      );

      const result = await getArtistTopTracks('invalid');
      expect(result).toEqual([]);
    });
  });
});

