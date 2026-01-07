const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

console.log('🔐 Spotify credentials:', {
  clientId: SPOTIFY_CLIENT_ID ? '✓' : '✗',
  clientSecret: SPOTIFY_CLIENT_SECRET ? '✓' : '✗'
});

let spotifyToken = null;
let tokenExpiry = null;

export const getSpotifyToken = async () => {
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    console.log('🔑 Using cached token');
    return spotifyToken;
  }

  console.log('🔑 Requesting new token...');

  try {
    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
      },
      body: 'grant_type=client_credentials'
    });

    const data = await response.json();

    if (data.access_token) {
      spotifyToken = data.access_token;
      tokenExpiry = Date.now() + data.expires_in * 1000;
      console.log('✅ Token received');
      return spotifyToken;
    }

    throw new Error('Failed to get token');
  } catch (error) {
    console.error('❌ Token error:', error);
    throw error;
  }
};

export const searchTracks = async (query, market = 'IL', limit = 50) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = 'https://api.spotify.com/v1/search';

    const params = new URLSearchParams({
      q: query,
      type: 'track',
      market,
      limit: String(limit)
    });

    const url = `${baseUrl}?${params.toString()}`;
    console.log('🔍 Searching tracks:', query, 'market:', market);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      const error = await response.text();
      console.error('❌ searchTracks error:', error);
      return [];
    }

    const data = await response.json();
    const items = data.tracks?.items || [];
    console.log('✅ Found', items.length, 'tracks for query', query);

    return items
      .filter((t) => t && t.id && t.name)
      .map((track) => {
        const release = track.album?.release_date || '';
        const year = release ? Number(String(release).slice(0, 4)) : null;

        return {
          id: track.id,
          title: track.name,
          artist: track.artists?.[0]?.name || 'Unknown',
          artistId: track.artists?.[0]?.id || '',
          image: track.album?.images?.[0]?.url || null,
          album: track.album?.name || '',
          year,
          market,
          duration: Math.floor((track.duration_ms || 0) / 1000),
          popularity: track.popularity || 0,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls?.spotify || null
        };
      });
  } catch (error) {
    console.error('❌ searchTracks exception:', error);
    return [];
  }
};

export const getPopularTracksForCountry = async (countryCode = 'IL', limit = 50) => {
  try {
    console.log(`🌍 Fetching popular tracks for ${countryCode}`);

    const queries = ['top hits', 'popular', 'trending'];
    let allTracks = [];

    for (const q of queries) {
      const tracks = await searchTracks(q, countryCode, 20);
      allTracks = allTracks.concat(tracks);
    }

    const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());

    const sorted = uniqueTracks.sort((a, b) => b.popularity - a.popularity).slice(0, limit);

    console.log('✅ Got', sorted.length, 'popular tracks');
    return sorted;
  } catch (error) {
    console.error('❌ getPopularTracksForCountry error:', error);
    return [];
  }
};

export const getArtistTopTracks = async (artistId, countryCode = 'IL') => {
  try {
    const token = await getSpotifyToken();
    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${countryCode}`;

    console.log('🎤 Fetching top tracks for artist:', artistId);

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` }
    });

    if (!response.ok) {
      console.error('❌ getArtistTopTracks error status:', response.status);
      return [];
    }

    const data = await response.json();
    const items = data.tracks || [];

    return items
      .filter((t) => t && t.id && t.name)
      .map((track) => {
        const release = track.album?.release_date || '';
        const year = release ? Number(String(release).slice(0, 4)) : null;

        return {
          id: track.id,
          title: track.name,
          artist: track.artists?.[0]?.name || 'Unknown',
          artistId: track.artists?.[0]?.id || '',
          image: track.album?.images?.[0]?.url || null,
          album: track.album?.name || '',
          year,
          market: countryCode,
          duration: Math.floor((track.duration_ms || 0) / 1000),
          popularity: track.popularity || 0,
          previewUrl: track.preview_url,
          spotifyUrl: track.external_urls?.spotify || null
        };
      });
  } catch (error) {
    console.error('❌ getArtistTopTracks exception:', error);
    return [];
  }
};

export const getRecommendations = async (seedGenres, seedArtists = [], limit = 50, countryCode = 'IL') => {
  try {
    console.log('🎵 Getting recommendations for genres:', seedGenres, 'artists:', seedArtists);

    let allTracks = [];

    for (const genre of seedGenres.slice(0, 3)) {
      const tracks = await searchTracks(genre, countryCode, 20);
      allTracks = allTracks.concat(tracks);
    }

    for (const artistId of seedArtists.slice(0, 2)) {
      const artistTracks = await getArtistTopTracks(artistId, countryCode);
      allTracks = allTracks.concat(artistTracks);
    }

    const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());

    const sorted = uniqueTracks.sort((a, b) => b.popularity - a.popularity).slice(0, limit);

    console.log('✅ Got', sorted.length, 'recommended tracks');
    return sorted;
  } catch (error) {
    console.error('❌ getRecommendations error:', error);
    return [];
  }
};

const chunk = (arr, size) => {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
};

const mapSpotifyTrack = (track, market) => {
  const release = track.album?.release_date || '';
  const year = release ? Number(String(release).slice(0, 4)) : null;

  return {
    id: track.id,
    title: track.name,
    artist: track.artists?.[0]?.name || 'Unknown',
    artistId: track.artists?.[0]?.id || '',
    image: track.album?.images?.[0]?.url || null,
    album: track.album?.name || '',
    year,
    market,
    duration: Math.floor((track.duration_ms || 0) / 1000),
    popularity: track.popularity || 0,
    previewUrl: track.preview_url,
    spotifyUrl: track.external_urls?.spotify || null
  };
};

const getTracksByIds = async (ids, market = 'IL') => {
  const token = await getSpotifyToken();
  const unique = Array.from(new Set((ids || []).filter(Boolean)));
  if (unique.length === 0) return [];

  const all = [];
  for (const part of chunk(unique, 50)) {
    const url = `https://api.spotify.com/v1/tracks?ids=${part.join(',')}&market=${market}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) continue;
    const data = await res.json();
    const tracks = data.tracks || [];
    all.push(...tracks.filter(Boolean).map((t) => mapSpotifyTrack(t, market)));
  }
  return all.filter((t) => t?.id);
};

const artistCache = new Map();

const getArtistsByIds = async (ids) => {
  const token = await getSpotifyToken();
  const unique = Array.from(new Set((ids || []).filter(Boolean)));
  if (unique.length === 0) return [];

  const missing = unique.filter((id) => !artistCache.has(id));

  for (const part of chunk(missing, 50)) {
    const url = `https://api.spotify.com/v1/artists?ids=${part.join(',')}`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    if (!res.ok) continue;
    const data = await res.json();
    const artists = data.artists || [];
    artists.forEach((a) => {
      if (a?.id) artistCache.set(a.id, Array.isArray(a.genres) ? a.genres : []);
    });
  }

  return unique.map((id) => ({ id, genres: artistCache.get(id) || [] }));
};

const getRecommendationsEndpoint = async ({
  market = 'IL',
  seed_tracks = [],
  seed_artists = [],
  seed_genres = [],
  limit = 50
}) => {
  const token = await getSpotifyToken();
  const params = new URLSearchParams({
    limit: String(limit),
    market
  });

  if (seed_tracks.length) params.set('seed_tracks', seed_tracks.slice(0, 5).join(','));
  if (seed_artists.length) params.set('seed_artists', seed_artists.slice(0, 5).join(','));
  if (seed_genres.length) params.set('seed_genres', seed_genres.slice(0, 5).join(','));

  const url = `https://api.spotify.com/v1/recommendations?${params.toString()}`;
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!res.ok) return [];

  const data = await res.json();
  const tracks = data.tracks || [];
  return tracks.filter(Boolean).map((t) => mapSpotifyTrack(t, market));
};

const shuffleCopy = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const pickRandom = (arr, n) => shuffleCopy(arr).slice(0, n);

export const generateMoreFromLiked = async (
  likedSongs,
  limit = 50,
  market = 'IL',
  excludeTrackIds = []
) => {
  try {
    const likedIds = (likedSongs || []).map((t) => t?.id).filter(Boolean);
    if (likedIds.length === 0) return [];

    const likedFull = await getTracksByIds(likedIds, market);

    const excludeSet = new Set([
      ...likedFull.map((t) => t?.id).filter(Boolean),
      ...(excludeTrackIds || []).filter(Boolean)
    ]);

    const likedArtistIds = likedFull.map((t) => t.artistId).filter(Boolean);

    const years = likedFull.map((t) => t.year).filter((y) => Number.isFinite(y));
    const baseMin = years.length ? Math.min(...years) : null;
    const baseMax = years.length ? Math.max(...years) : null;

    const artistFreq = new Map();
    likedArtistIds.forEach((id) => artistFreq.set(id, (artistFreq.get(id) || 0) + 1));

    const topArtistsAll = Array.from(artistFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([id]) => id);

    const topArtists = topArtistsAll.slice(0, 10);

    await getArtistsByIds(topArtists.length ? topArtists : likedArtistIds);

    const genreFreq = new Map();
    const seedArtistsForGenres = topArtists.length ? topArtists : likedArtistIds;

    const likedArtists = await getArtistsByIds(seedArtistsForGenres);
    likedArtists.forEach((a) => {
      (a.genres || []).forEach((g) => genreFreq.set(g, (genreFreq.get(g) || 0) + 1));
    });

    const topGenresAll = Array.from(genreFreq.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([g]) => g);

    const topGenres = topGenresAll.slice(0, 15);

    const likedArtistSet = new Set(likedArtistIds);

    const shuffle = (arr) => [...arr].sort(() => Math.random() - 0.5);

    const safePick = (arr, n) => shuffle(arr).slice(0, Math.min(n, arr.length));

    const seedsFromLiked = () => safePick(likedFull, 5).map((t) => t.id);

    const fetchMoreCandidates = async (attempts) => {
      const out = [];
      for (let i = 0; i < attempts; i++) {
        const seed_tracks = seedsFromLiked();
        const seed_artists = safePick(topArtists, 3);
        const seed_genres = safePick(topGenres, 3);

        out.push(
          ...(await getRecommendationsEndpoint({
            market,
            seed_tracks,
            seed_artists,
            seed_genres,
            limit: 50
          }))
        );
      }

      const genreSearches = safePick(topGenres, 4);
      for (const g of genreSearches) {
        const extra = await searchTracks(g, market, 50);
        out.push(...extra);
      }

      return out;
    };

    let candidates = [];
    candidates.push(...(await fetchMoreCandidates(8)));

    const unique = () =>
      Array.from(new Map(candidates.map((t) => [t?.id, t])).values()).filter(
        (t) => t?.id && !excludeSet.has(t.id)
      );

    let uniq = unique();

    const candArtistIds = Array.from(new Set(uniq.map((t) => t.artistId).filter(Boolean)));
    await getArtistsByIds(candArtistIds);

    const tryBuildFinal = (yearPad) => {
      const yearMin = baseMin !== null ? baseMin - yearPad : null;
      const yearMax = baseMax !== null ? baseMax + yearPad : null;

      const topGenresSet = new Set(topGenres);

      const score2of4 = (t) => {
        const artistMatch = t.artistId && likedArtistSet.has(t.artistId);

        const yearMatch =
          Number.isFinite(t.year) &&
          yearMin !== null &&
          yearMax !== null &&
          t.year >= yearMin &&
          t.year <= yearMax;

        const candGenres = artistCache.get(t.artistId) || [];
        const genreMatch = candGenres.some((g) => topGenresSet.has(g));

        const languageMatch = t.market === market;

        return (
          (artistMatch ? 1 : 0) +
          (yearMatch ? 1 : 0) +
          (genreMatch ? 1 : 0) +
          (languageMatch ? 1 : 0)
        );
      };

      const filtered = uniq.filter((t) => score2of4(t) >= 2);

      const ranked = filtered
        .map((t) => ({
          ...t,
          _score:
            score2of4(t) * 10 +
            (t.popularity || 0) +
            (t.artistId && likedArtistSet.has(t.artistId) ? 5 : 0)
        }))
        .sort((a, b) => b._score - a._score);

      const perArtist = new Map();
      const final = [];
      for (const t of ranked) {
        const k = t.artistId || 'unknown';
        const c = perArtist.get(k) || 0;
        if (c >= 2) continue;
        perArtist.set(k, c + 1);
        final.push(t);
        if (final.length >= limit) break;
      }
      return final;
    };

    let final = tryBuildFinal(4);

    let pad = 4;
    let rounds = 0;

    while (final.length < limit && rounds < 4) {
      pad += 2;

      if (final.length < limit) {
        candidates.push(...(await fetchMoreCandidates(4)));
        uniq = unique();

        const candArtistIds2 = Array.from(new Set(uniq.map((t) => t.artistId).filter(Boolean)));
        await getArtistsByIds(candArtistIds2);
      }

      final = tryBuildFinal(pad);
      rounds++;
    }

    return final.slice(0, limit);
  } catch (e) {
    console.error('❌ generateMoreFromLiked error:', e);
    return [];
  }
};


const getLocalGenreTag = (genre, countryAdjective) => {
  const g = genre.toLowerCase();
  const c = countryAdjective.toLowerCase();

  if (g === 'rap' || g === 'hip-hop' || g === 'hip hop') return `${c} hip hop`;
  if (g === 'pop') return `${c} pop`;
  if (g === 'rock') return `${c} rock`;
  if (g === 'indie') return `${c} indie`;
  if (g === 'electronic' || g === 'edm') return `${c} electronic`;

  return `${c} ${g}`;
};

export const searchArtistsByCountry = async (
  countryCode,
  languageName,
  countryAdjective,
  genre,
  limit = 20,
  offset = 0
) => {
  try {
    const token = await getSpotifyToken();
    const strictGenreTag = getLocalGenreTag(genre, countryAdjective);
    const baseUrl = 'https://api.spotify.com/v1/search';

    const queries = [];

    const strictQuery = `genre:"${strictGenreTag}"`;
    queries.push(
      fetch(
        `${baseUrl}?q=${encodeURIComponent(strictQuery)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );

    const broadQuery = `${countryAdjective} ${genre}`;
    queries.push(
      fetch(
        `${baseUrl}?q=${encodeURIComponent(broadQuery)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );

    const responses = await Promise.all(queries);

    const results = await Promise.all(
      responses.map(async (res) => {
        if (!res.ok) {
          console.warn('Spotify API warning:', res.statusText);
          return { artists: { items: [] } };
        }
        return res.json();
      })
    );

    const allItems = results.flatMap((r) => r.artists?.items || []);

    const uniqueArtists = Array.from(new Map(allItems.map((a) => [a.id, a])).values()).filter(
      (artist) => artist && artist.name && artist.popularity !== undefined
    );

    return uniqueArtists
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        country: countryCode,
        language: languageName,
        genre,
        image: artist.images[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0
      }));
  } catch (error) {
    console.error(`Error searching artists for ${countryAdjective} ${genre}:`, error);
    return [];
  }
};

export const searchArtistsByCountryWithYear = async (
  countryCode,
  languageName,
  countryAdjective,
  genreWithEra,
  yearRange,
  limit = 20,
  offset = 0
) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = 'https://api.spotify.com/v1/search';

    const queries = [];

    queries.push(
      fetch(
        `${baseUrl}?q=${encodeURIComponent(genreWithEra)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );

    queries.push(
      fetch(
        `${baseUrl}?q=${encodeURIComponent(`${countryAdjective} ${genreWithEra}`)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      )
    );

    const responses = await Promise.all(queries);
    const results = await Promise.all(
      responses.map(async (res) => {
        if (!res.ok) return { artists: { items: [] } };
        return res.json();
      })
    );

    const allItems = results.flatMap((r) => r.artists?.items || []);
    const uniqueArtists = Array.from(new Map(allItems.map((a) => [a.id, a])).values());

    return uniqueArtists
      .sort((a, b) => b.popularity - a.popularity)
      .slice(0, limit)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        country: countryCode,
        language: languageName,
        genre: genreWithEra,
        image: artist.images[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0
      }));
  } catch (error) {
    console.error(`Error searching artists:`, error);
    return [];
  }
};

export const searchArtistsByGenreWithYear = async (genreWithEra, yearRange, limit = 20, offset = 0) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = 'https://api.spotify.com/v1/search';

    const response = await fetch(
      `${baseUrl}?q=${encodeURIComponent(genreWithEra)}&type=artist&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();

    if (data.artists?.items) {
      return data.artists.items.map((artist) => ({
        id: artist.id,
        name: artist.name,
        genre: genreWithEra,
        image: artist.images[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error searching genre with year:`, error);
    return [];
  }
};

export const getArtistsForGenres = async (genreIds, languageIds, yearRange, additionalOffset = 0) => {
  try {
    const genreMap = {
      1: 'pop',
      2: 'rock',
      3: 'hip-hop',
      4: 'rap',
      5: 'electronic',
      6: 'jazz',
      7: 'classical',
      8: 'r-n-b',
      9: 'country',
      10: 'latin',
      11: 'metal',
      12: 'indie',
      13: 'edm',
      14: 'reggae',
      15: 'blues',
      16: 'folk',
      17: 'soul',
      18: 'punk',
      19: 'funk',
      20: 'house',
      21: 'k-pop',
      22: 'chill',
      23: 'ambient',
      24: 'afrobeat'
    };

    const languageMapFull = {
      1: { code: 'US', lang: 'English', adj: 'American' },
      2: { code: 'ES', lang: 'Spanish', adj: 'Spanish' },
      12: { code: 'IL', lang: 'Hebrew', adj: 'Israeli' }
    };

    const selectedGenres = genreIds.map((id) => genreMap[id]).filter(Boolean);
    const selectedLanguageData = languageIds?.map((id) => languageMapFull[id]).filter(Boolean) || [];
    const currentOffset = additionalOffset;

    const getEraKeyword = (yearFrom, yearTo) => {
      if (yearFrom >= 1950 && yearTo <= 1959) return '1950s 50s';
      if (yearFrom >= 1960 && yearTo <= 1969) return '1960s 60s';
      if (yearFrom >= 1970 && yearTo <= 1979) return '1970s 70s';
      if (yearFrom >= 1980 && yearTo <= 1989) return '1980s 80s';
      if (yearFrom >= 1990 && yearTo <= 1999) return '1990s 90s';
      if (yearFrom >= 2000 && yearTo <= 2009) return '2000s';
      if (yearFrom >= 2010 && yearTo <= 2019) return '2010s';
      if (yearFrom >= 2020) return '2020s';
      return '';
    };

    const eraKeyword = getEraKeyword(yearRange.from, yearRange.to);

    let allPromises = [];

    if (selectedLanguageData.length > 0) {
      for (const langData of selectedLanguageData) {
        const { code, lang, adj } = langData;

        for (const genre of selectedGenres) {
          const genreWithEra = eraKeyword ? `${eraKeyword} ${genre}` : genre;
          allPromises.push(
            searchArtistsByCountryWithYear(code, lang, adj, genreWithEra, yearRange, 20, currentOffset)
          );
        }
      }
    } else {
      const genrePromises = selectedGenres.map((genre) => {
        const genreWithEra = eraKeyword ? `${eraKeyword} ${genre}` : genre;
        return searchArtistsByGenreWithYear(genreWithEra, yearRange, 20, currentOffset);
      });
      allPromises = allPromises.concat(genrePromises);
    }

    const results = await Promise.all(allPromises);
    const allArtists = results.flat();

    const uniqueArtists = Array.from(new Map(allArtists.map((a) => [a.id, a])).values());

    return uniqueArtists.sort((a, b) => b.popularity - a.popularity).slice(0, 50);
  } catch (error) {
    console.error('Error getting artists:', error);
    return [];
  }
};

export const searchArtistsByGenre = async (genre, limit = 20, offset = 0) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = 'https://api.spotify.com/v1/search';

    const response = await fetch(
      `${baseUrl}?q=${encodeURIComponent(`genre:"${genre}"`)}&type=artist&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    const data = await response.json();

    if (data.artists?.items) {
      return data.artists.items.map((artist) => ({
        id: artist.id,
        name: artist.name,
        genre,
        image: artist.images[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0
      }));
    }

    return [];
  } catch (error) {
    console.error(`Error searching generic genre ${genre}:`, error);
    return [];
  }
};
