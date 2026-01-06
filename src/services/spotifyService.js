// src/services/spotifyService.js

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

console.log("🔐 Spotify credentials:", {
  clientId: SPOTIFY_CLIENT_ID ? "✓" : "✗",
  clientSecret: SPOTIFY_CLIENT_SECRET ? "✓" : "✗",
});

let spotifyToken = null;
let tokenExpiry = null; // ms timestamp

// =====================================================
//   HELPERS
// =====================================================

const assertSpotifyCreds = () => {
  if (!SPOTIFY_CLIENT_ID || !SPOTIFY_CLIENT_SECRET) {
    // הודעה ברורה במקום 400 “מסתורי”
    throw new Error(
      "Missing Spotify credentials. Define VITE_SPOTIFY_CLIENT_ID and VITE_SPOTIFY_CLIENT_SECRET in .env and restart the dev server."
    );
  }
};

const safeMarket = (market) => {
  const m = String(market || "").trim().toUpperCase();
  return /^[A-Z]{2}$/.test(m) ? m : "US";
};

const mapTrack = (track) => ({
  id: track.id,
  title: track.name,
  artist: track.artists?.[0]?.name || "Unknown",
  artistId: track.artists?.[0]?.id || "",
  image: track.album?.images?.[0]?.url || null,
  album: track.album?.name || "",
  duration: Math.floor((track.duration_ms || 0) / 1000),
  popularity: track.popularity || 0,
  previewUrl: track.preview_url || null,
  spotifyUrl: track.external_urls?.spotify || null,
});

// =====================================================
//   TOKEN
// =====================================================

export const getSpotifyToken = async () => {
  // cache
  if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
    return spotifyToken;
  }

  assertSpotifyCreds();

  try {
    const auth = btoa(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`);

    const body = new URLSearchParams();
    body.set("grant_type", "client_credentials");

    const response = await fetch("https://accounts.spotify.com/api/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        Accept: "application/json",
        Authorization: `Basic ${auth}`,
      },
      body: body.toString(),
    });

    // אם יש שגיאה — נדפיס למה (זה מה שחסר לך כרגע)
    if (!response.ok) {
      const text = await response.text();
      console.error("❌ Spotify token request failed:", response.status, text);
      throw new Error(`Spotify token failed: ${response.status}`);
    }

    const data = await response.json();

    if (!data?.access_token) {
      console.error("❌ Spotify token response missing access_token:", data);
      throw new Error("Spotify token missing access_token");
    }

    spotifyToken = data.access_token;

    // ניקח מרווח קטן כדי לא ליפול על edge
    const expiresMs = (data.expires_in || 3600) * 1000;
    tokenExpiry = Date.now() + expiresMs - 5000;

    return spotifyToken;
  } catch (error) {
    console.error("❌ Token error:", error);
    throw error;
  }
};

// =====================================================
//   TRACK SEARCH / POPULAR / RECOMMENDATIONS
// =====================================================

export const searchTracks = async (query, market = "IL", limit = 50) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = "https://api.spotify.com/v1/search";

    const params = new URLSearchParams({
      q: query,
      type: "track",
      market: safeMarket(market),
      limit: String(limit),
    });

    const url = `${baseUrl}?${params.toString()}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ searchTracks failed:", response.status, text);
      return [];
    }

    const data = await response.json();
    const items = data.tracks?.items || [];

    return items
      .filter((t) => t && t.id && t.name)
      .map(mapTrack);
  } catch (error) {
    console.error("❌ searchTracks exception:", error);
    return [];
  }
};

export const getPopularTracksForCountry = async (countryCode = "IL", limit = 50) => {
  try {
    const market = safeMarket(countryCode);
    console.log(`🌍 Fetching popular tracks for ${market}`);

    const queries = ["top hits", "popular", "trending"];
    let allTracks = [];

    for (const q of queries) {
      const tracks = await searchTracks(q, market, 20);
      allTracks = allTracks.concat(tracks);
    }

    const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());

    return uniqueTracks
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("❌ getPopularTracksForCountry error:", error);
    return [];
  }
};

export const getArtistTopTracks = async (artistId, countryCode = "IL") => {
  try {
    const token = await getSpotifyToken();
    const market = safeMarket(countryCode);

    const url = `https://api.spotify.com/v1/artists/${artistId}/top-tracks?market=${market}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ getArtistTopTracks failed:", response.status, text);
      return [];
    }

    const data = await response.json();
    const items = data.tracks || [];

    return items
      .filter((t) => t && t.id && t.name)
      .map(mapTrack);
  } catch (error) {
    console.error("❌ getArtistTopTracks exception:", error);
    return [];
  }
};

export const getRecommendations = async (seedGenres, seedArtists = [], limit = 50, countryCode = "IL") => {
  try {
    const market = safeMarket(countryCode);

    let allTracks = [];

    for (const genre of (seedGenres || []).slice(0, 3)) {
      const tracks = await searchTracks(genre, market, 20);
      allTracks = allTracks.concat(tracks);
    }

    for (const artistId of (seedArtists || []).slice(0, 2)) {
      const artistTracks = await getArtistTopTracks(artistId, market);
      allTracks = allTracks.concat(artistTracks);
    }

    const uniqueTracks = Array.from(new Map(allTracks.map((t) => [t.id, t])).values());

    return uniqueTracks
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit);
  } catch (error) {
    console.error("❌ getRecommendations error:", error);
    return [];
  }
};

// =====================================================
//   ARTISTS SEARCH (למסכי ArtistSelection)
// =====================================================

const getLocalGenreTag = (genre, countryAdjective) => {
  const g = String(genre || "").toLowerCase();
  const c = String(countryAdjective || "").toLowerCase();

  if (g === "rap" || g === "hip-hop" || g === "hip hop") return `${c} hip hop`;
  if (g === "pop") return `${c} pop`;
  if (g === "rock") return `${c} rock`;
  if (g === "indie") return `${c} indie`;
  if (g === "electronic" || g === "edm") return `${c} electronic`;

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
    const market = safeMarket(countryCode);

    const strictGenreTag = getLocalGenreTag(genre, countryAdjective);
    const baseUrl = "https://api.spotify.com/v1/search";

    const strictQuery = `genre:"${strictGenreTag}"`;
    const broadQuery = `${countryAdjective} ${genre}`;

    const queries = [
      fetch(
        `${baseUrl}?q=${encodeURIComponent(strictQuery)}&type=artist&market=${market}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `${baseUrl}?q=${encodeURIComponent(broadQuery)}&type=artist&market=${market}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ];

    const responses = await Promise.all(queries);

    const results = await Promise.all(
      responses.map(async (res) => {
        if (!res.ok) return { artists: { items: [] } };
        return res.json();
      })
    );

    const allItems = results.flatMap((r) => r.artists?.items || []);

    const uniqueArtists = Array.from(new Map(allItems.map((a) => [a.id, a])).values()).filter(
      (artist) => artist && artist.name && artist.popularity !== undefined
    );

    return uniqueArtists
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        country: market,
        language: languageName,
        genre,
        image: artist.images?.[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0,
        spotifyUrl: artist.external_urls?.spotify || null,
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
    const market = safeMarket(countryCode);
    const baseUrl = "https://api.spotify.com/v1/search";

    const queries = [
      fetch(
        `${baseUrl}?q=${encodeURIComponent(genreWithEra)}&type=artist&market=${market}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
      fetch(
        `${baseUrl}?q=${encodeURIComponent(`${countryAdjective} ${genreWithEra}`)}&type=artist&market=${market}&limit=${limit}&offset=${offset}`,
        { headers: { Authorization: `Bearer ${token}` } }
      ),
    ];

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
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, limit)
      .map((artist) => ({
        id: artist.id,
        name: artist.name,
        country: market,
        language: languageName,
        genre: genreWithEra,
        image: artist.images?.[0]?.url || null,
        popularity: artist.popularity,
        followers: artist.followers?.total || 0,
        spotifyUrl: artist.external_urls?.spotify || null,
      }));
  } catch (error) {
    console.error("Error searching artists:", error);
    return [];
  }
};

export const searchArtistsByGenreWithYear = async (genreWithEra, yearRange, limit = 20, offset = 0) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = "https://api.spotify.com/v1/search";

    const response = await fetch(
      `${baseUrl}?q=${encodeURIComponent(genreWithEra)}&type=artist&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ searchArtistsByGenreWithYear failed:", response.status, text);
      return [];
    }

    const data = await response.json();
    const items = data.artists?.items || [];

    return items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      genre: genreWithEra,
      image: artist.images?.[0]?.url || null,
      popularity: artist.popularity,
      followers: artist.followers?.total || 0,
      spotifyUrl: artist.external_urls?.spotify || null,
    }));
  } catch (error) {
    console.error("Error searching genre with year:", error);
    return [];
  }
};

export const getArtistsForGenres = async (genreIds, languageIds, yearRange, additionalOffset = 0) => {
  try {
    const genreMap = {
      1: "pop",
      2: "rock",
      3: "hip-hop",
      4: "rap",
      5: "electronic",
      6: "jazz",
      7: "classical",
      8: "r-n-b",
      9: "country",
      10: "latin",
      11: "metal",
      12: "indie",
      13: "edm",
      14: "reggae",
      15: "blues",
      16: "folk",
      17: "soul",
      18: "punk",
      19: "funk",
      20: "house",
      21: "k-pop",
      22: "chill",
      23: "ambient",
      24: "afrobeat",
    };

    const languageMapFull = {
      1: { code: "US", lang: "English", adj: "American" },
      2: { code: "ES", lang: "Spanish", adj: "Spanish" },
      12: { code: "IL", lang: "Hebrew", adj: "Israeli" },
    };

    const selectedGenres = (genreIds || []).map((id) => genreMap[id]).filter(Boolean);
    const selectedLanguageData = (languageIds || []).map((id) => languageMapFull[id]).filter(Boolean);
    const currentOffset = additionalOffset;

    const getEraKeyword = (yearFrom, yearTo) => {
      if (yearFrom >= 1950 && yearTo <= 1959) return "1950s 50s";
      if (yearFrom >= 1960 && yearTo <= 1969) return "1960s 60s";
      if (yearFrom >= 1970 && yearTo <= 1979) return "1970s 70s";
      if (yearFrom >= 1980 && yearTo <= 1989) return "1980s 80s";
      if (yearFrom >= 1990 && yearTo <= 1999) return "1990s 90s";
      if (yearFrom >= 2000 && yearTo <= 2009) return "2000s";
      if (yearFrom >= 2010 && yearTo <= 2019) return "2010s";
      if (yearFrom >= 2020) return "2020s";
      return "";
    };

    const eraKeyword = getEraKeyword(yearRange?.from, yearRange?.to);

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

    return uniqueArtists
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 50);
  } catch (error) {
    console.error("Error getting artists:", error);
    return [];
  }
};

export const searchArtistsByGenre = async (genre, limit = 20, offset = 0) => {
  try {
    const token = await getSpotifyToken();
    const baseUrl = "https://api.spotify.com/v1/search";

    const response = await fetch(
      `${baseUrl}?q=${encodeURIComponent(`genre:"${genre}"`)}&type=artist&limit=${limit}&offset=${offset}`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (!response.ok) {
      const text = await response.text();
      console.error("❌ searchArtistsByGenre failed:", response.status, text);
      return [];
    }

    const data = await response.json();
    const items = data.artists?.items || [];

    return items.map((artist) => ({
      id: artist.id,
      name: artist.name,
      genre,
      image: artist.images?.[0]?.url || null,
      popularity: artist.popularity,
      followers: artist.followers?.total || 0,
      spotifyUrl: artist.external_urls?.spotify || null,
    }));
  } catch (error) {
    console.error(`Error searching generic genre ${genre}:`, error);
    return [];
  }
};
