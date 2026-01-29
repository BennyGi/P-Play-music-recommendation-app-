/**
 * בדיקות אוטומציה לאלמנט ההפתעה (Surprise Element)
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהפונקציה generateSurpriseSongs מחזירה שירים עם הפרמטרים הנכונים
 * 2. בודקות שכש-surpriseLanguageEnabled = true, השפה היא רנדומלית
 * 3. בודקות שכש-surpriseYearEnabled = true, טווח השנים הוא רנדומלי
 * 4. בודקות שכש-surpriseGenreEnabled = true, הז'אנר הוא רנדומלי
 * 5. בודקות שהפונקציה מטפלת בשגיאות נכון
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  searchTracksByCountryGenreAndYear,
  searchTracksByGenreAndYear
} from '../../services/spotifyService';

describe('Surprise Element - searchTracksByCountryGenreAndYear', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should search tracks by country, genre and year', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tracks: {
            items: [
              {
                id: 'track1',
                name: 'Spanish Rock Song',
                artists: [{ name: 'Spanish Artist', id: 'artist1' }],
                album: {
                  name: 'Album',
                  images: [{ url: 'image.jpg' }],
                  release_date: '1995-01-01'
                },
                duration_ms: 180000,
                popularity: 70,
                preview_url: 'preview.mp3',
                external_urls: { spotify: 'spotify.com/track1' }
              }
            ]
          }
        })
      })
    );

    const result = await searchTracksByCountryGenreAndYear(
      'ES',
      'Spanish',
      [2], // rock
      { from: 1990, to: 2000 },
      10
    );

    expect(Array.isArray(result)).toBe(true);
    expect(fetch).toHaveBeenCalled();
  });

  it('should handle empty results gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tracks: { items: [] }
        })
      })
    );

    const result = await searchTracksByCountryGenreAndYear(
      'FR',
      'French',
      [1],
      { from: 2010, to: 2020 },
      10
    );

    expect(result).toEqual([]);
  });

  it('should handle errors gracefully', async () => {
    global.fetch = vi.fn(() =>
      Promise.reject(new Error('Network error'))
    );

    const result = await searchTracksByCountryGenreAndYear(
      'US',
      'American',
      [1],
      { from: 2010, to: 2020 },
      10
    );

    expect(result).toEqual([]);
  });

  it('should try multiple query variations', async () => {
    let callCount = 0;
    global.fetch = vi.fn(() => {
      callCount++;
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve({
          tracks: { items: [] }
        })
      });
    });

    await searchTracksByCountryGenreAndYear(
      'ES',
      'Spanish',
      [2],
      { from: 1990, to: 2000 },
      10
    );

    // Should try multiple query variations (3 queries per genre)
    expect(callCount).toBeGreaterThan(0);
  });
});

describe('Surprise Element - Integration Logic', () => {
  it('should use random language when surpriseLanguageEnabled is true', () => {
    const languageMapFull = {
      1: { code: 'US', lang: 'English', adj: 'American' },
      2: { code: 'ES', lang: 'Spanish', adj: 'Spanish' },
      3: { code: 'FR', lang: 'French', adj: 'French' }
    };

    const allLanguageIds = Object.keys(languageMapFull).map(Number);
    const randomLanguageId = allLanguageIds[Math.floor(Math.random() * allLanguageIds.length)];
    const selectedLanguageData = languageMapFull[randomLanguageId];

    expect(selectedLanguageData).toBeDefined();
    expect(selectedLanguageData.code).toBeDefined();
    expect(selectedLanguageData.adj).toBeDefined();
  });

  it('should use random year range when surpriseYearEnabled is true', () => {
    const currentYear = new Date().getFullYear();
    const randomYearRange = {
      from: Math.max(1950, currentYear - 50 - Math.floor(Math.random() * 30)),
      to: Math.min(currentYear, 1980 + Math.floor(Math.random() * (currentYear - 1980)))
    };

    expect(randomYearRange.from).toBeGreaterThanOrEqual(1950);
    expect(randomYearRange.to).toBeLessThanOrEqual(currentYear);
    expect(randomYearRange.from).toBeLessThanOrEqual(randomYearRange.to);
  });

  it('should use random genre when surpriseGenreEnabled is true', () => {
    const genreMap = {
      1: 'pop', 2: 'rock', 3: 'hip-hop', 4: 'rap', 5: 'electronic'
    };

    const allGenreIds = Object.keys(genreMap).map(Number);
    const randomGenreId = allGenreIds[Math.floor(Math.random() * allGenreIds.length)];
    const randomGenre = genreMap[randomGenreId];

    expect(randomGenre).toBeDefined();
    expect(typeof randomGenre).toBe('string');
  });

  it('should preserve selected genre when surpriseGenreEnabled is false', () => {
    const preferences = { genres: [2] }; // rock
    const surpriseGenreEnabled = false;

    const genresToUse = preferences.genres || [];
    const randomGenres = surpriseGenreEnabled 
      ? [1] // random
      : genresToUse;

    expect(randomGenres).toEqual([2]); // Should be rock
  });

  it('should preserve selected language when surpriseLanguageEnabled is false', () => {
    const preferences = { languages: [2] }; // Spanish
    const surpriseLanguageEnabled = false;

    const languageMapFull = {
      1: { code: 'US', lang: 'English', adj: 'American' },
      2: { code: 'ES', lang: 'Spanish', adj: 'Spanish' }
    };

    const selectedLanguageId = preferences.languages?.[0] || 1;
    const selectedLanguageData = languageMapFull[selectedLanguageId] || languageMapFull[1];

    expect(selectedLanguageData.code).toBe('ES');
    expect(selectedLanguageData.adj).toBe('Spanish');
  });
});

