const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

let spotifyToken = null;
let tokenExpiry = null;

export const getSpotifyToken = async () => {
   if (spotifyToken && tokenExpiry && Date.now() < tokenExpiry) {
      return spotifyToken;
   }

   try {
      const response = await fetch('https://accounts.spotify.com/api/token', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': 'Basic ' + btoa(SPOTIFY_CLIENT_ID + ':' + SPOTIFY_CLIENT_SECRET)
         },
         body: 'grant_type=client_credentials'
      });

      const data = await response.json();

      if (data.access_token) {
         spotifyToken = data.access_token;
         tokenExpiry = Date.now() + (data.expires_in * 1000);
         return spotifyToken;
      }

      throw new Error('Failed to get token');
   } catch (error) {
      console.error('Spotify token error:', error);
      throw error;
   }
};

const getLocalGenreTag = (genre, countryAdjective) => {
   const g = genre.toLowerCase();
   const c = countryAdjective.toLowerCase();

   if (g === 'rap' || g === 'hip-hop' || g === 'hip hop') {
      return `${c} hip hop`;
   }
   if (g === 'pop') {
      return `${c} pop`;
   }
   if (g === 'rock') {
      return `${c} rock`;
   }
   if (g === 'indie') {
      return `${c} indie`;
   }
   if (g === 'electronic' || g === 'edm') {
      return `${c} electronic`;
   }

   return `${c} ${g}`;
};

export const searchArtistsByCountry = async (countryCode, languageName, countryAdjective, genre, limit = 20, offset = 0) => {
   try {
      const token = await getSpotifyToken();
      const strictGenreTag = getLocalGenreTag(genre, countryAdjective);
      const queries = [];
      const baseUrl = 'https://api.spotify.com/v1/search';

      // Query 1: Strict Genre Search
      const strictQuery = `genre:"${strictGenreTag}"`;
      queries.push(
         fetch(
            `${baseUrl}?q=${encodeURIComponent(strictQuery)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
         )
      );

      // Query 2: Broad Text Search
      const broadQuery = `${countryAdjective} ${genre}`;
      queries.push(
         fetch(
            `${baseUrl}?q=${encodeURIComponent(broadQuery)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
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

      const allItems = results.flatMap(r => r.artists?.items || []);

      const uniqueArtists = Array.from(
         new Map(allItems.map(a => [a.id, a])).values()
      ).filter(artist => {
         return artist && artist.name && artist.popularity !== undefined;
      });

      return uniqueArtists
         .sort((a, b) => b.popularity - a.popularity)
         .slice(0, limit)
         .map(artist => ({
            id: artist.id,
            name: artist.name,
            country: countryCode,
            language: languageName,
            genre: genre,
            image: artist.images[0]?.url || null,
            popularity: artist.popularity,
            followers: artist.followers?.total || 0
         }));

   } catch (error) {
      console.error(`Error searching artists for ${countryAdjective} ${genre}:`, error);
      return [];
   }
};

export const searchArtistsByCountryWithYear = async (countryCode, languageName, countryAdjective, genreWithEra, yearRange, limit = 20, offset = 0) => {
   try {
      const token = await getSpotifyToken();
      const queries = [];
      const baseUrl = 'https://api.spotify.com/v1/search';

      // Query 1: Genre with era keywords
      queries.push(
         fetch(
            `${baseUrl}?q=${encodeURIComponent(genreWithEra)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
         )
      );

      // Query 2: Country + genre + era
      queries.push(
         fetch(
            `${baseUrl}?q=${encodeURIComponent(`${countryAdjective} ${genreWithEra}`)}&type=artist&market=${countryCode}&limit=${limit}&offset=${offset}`,
            { headers: { 'Authorization': `Bearer ${token}` } }
         )
      );

      const responses = await Promise.all(queries);
      const results = await Promise.all(
         responses.map(async (res) => {
            if (!res.ok) return { artists: { items: [] } };
            return res.json();
         })
      );

      const allItems = results.flatMap(r => r.artists?.items || []);
      const uniqueArtists = Array.from(
         new Map(allItems.map(a => [a.id, a])).values()
      );

      return uniqueArtists
         .sort((a, b) => b.popularity - a.popularity)
         .slice(0, limit)
         .map(artist => ({
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
         {
            headers: { 'Authorization': `Bearer ${token}` }
         }
      );

      const data = await response.json();

      if (data.artists?.items) {
         return data.artists.items.map(artist => ({
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
         1: 'pop', 2: 'rock', 3: 'hip-hop', 4: 'rap', 5: 'electronic',
         6: 'jazz', 7: 'classical', 8: 'r-n-b', 9: 'country', 10: 'latin',
         11: 'metal', 12: 'indie', 13: 'edm', 14: 'reggae', 15: 'blues',
         16: 'folk', 17: 'soul', 18: 'punk', 19: 'funk', 20: 'house',
         21: 'k-pop', 22: 'chill', 23: 'ambient', 24: 'afrobeat'
      };

      const languageMapFull = {
         1: { code: 'US', lang: 'English', adj: 'American' },
         2: { code: 'ES', lang: 'Spanish', adj: 'Spanish' },
         3: { code: 'FR', lang: 'French', adj: 'French' },
         4: { code: 'DE', lang: 'German', adj: 'German' },
         5: { code: 'IT', lang: 'Italian', adj: 'Italian' },
         6: { code: 'BR', lang: 'Portuguese', adj: 'Brazilian' },
         7: { code: 'RU', lang: 'Russian', adj: 'Russian' },
         8: { code: 'CN', lang: 'Mandarin', adj: 'Chinese' },
         9: { code: 'JP', lang: 'Japanese', adj: 'Japanese' },
         10: { code: 'KR', lang: 'Korean', adj: 'Korean' },
         11: { code: 'SA', lang: 'Arabic', adj: 'Arabic' },
         12: { code: 'IL', lang: 'Hebrew', adj: 'Israeli' },
         13: { code: 'TR', lang: 'Turkish', adj: 'Turkish' },
         14: { code: 'IR', lang: 'Persian', adj: 'Persian' },
         15: { code: 'IN', lang: 'Hindi', adj: 'Indian' },
         16: { code: 'IN', lang: 'Punjabi', adj: 'Punjabi' },
         17: { code: 'PK', lang: 'Urdu', adj: 'Pakistani' },
         18: { code: 'BD', lang: 'Bengali', adj: 'Bengali' },
         19: { code: 'IN', lang: 'Tamil', adj: 'Tamil' },
         20: { code: 'TH', lang: 'Thai', adj: 'Thai' },
         21: { code: 'VN', lang: 'Vietnamese', adj: 'Vietnamese' },
         22: { code: 'ID', lang: 'Indonesian', adj: 'Indonesian' },
         23: { code: 'PH', lang: 'Filipino', adj: 'Filipino' },
         24: { code: 'MY', lang: 'Malay', adj: 'Malaysian' },
         25: { code: 'NL', lang: 'Dutch', adj: 'Dutch' },
         26: { code: 'SE', lang: 'Swedish', adj: 'Swedish' },
         27: { code: 'NO', lang: 'Norwegian', adj: 'Norwegian' },
         28: { code: 'DK', lang: 'Danish', adj: 'Danish' },
         29: { code: 'FI', lang: 'Finnish', adj: 'Finnish' },
         30: { code: 'PL', lang: 'Polish', adj: 'Polish' },
         31: { code: 'CZ', lang: 'Czech', adj: 'Czech' },
         32: { code: 'RO', lang: 'Romanian', adj: 'Romanian' },
         33: { code: 'GR', lang: 'Greek', adj: 'Greek' },
         34: { code: 'HU', lang: 'Hungarian', adj: 'Hungarian' },
         35: { code: 'UA', lang: 'Ukrainian', adj: 'Ukrainian' },
         36: { code: 'KE', lang: 'Swahili', adj: 'Swahili' },
         37: { code: 'ET', lang: 'Amharic', adj: 'Ethiopian' },
         38: { code: 'ZA', lang: 'Zulu', adj: 'Zulu' },
         39: { code: 'ZA', lang: 'Afrikaans', adj: 'Afrikaans' },
         40: { code: 'BR', lang: 'Portuguese (BR)', adj: 'Brazilian' },
         41: { code: 'MX', lang: 'Spanish (MX)', adj: 'Mexican' },
         42: { code: 'CA', lang: 'French (CA)', adj: 'Canadian' },
         43: { code: 'ES', lang: 'Catalan', adj: 'Catalan' },
         44: { code: 'ES', lang: 'Basque', adj: 'Basque' },
         45: { code: 'ES', lang: 'Galician', adj: 'Galician' },
         46: { code: 'RS', lang: 'Serbian', adj: 'Serbian' },
         47: { code: 'HR', lang: 'Croatian', adj: 'Croatian' },
         48: { code: 'BG', lang: 'Bulgarian', adj: 'Bulgarian' },
         49: { code: 'SK', lang: 'Slovak', adj: 'Slovak' },
         50: { code: 'LT', lang: 'Lithuanian', adj: 'Lithuanian' },
      };

      const selectedGenres = genreIds.map(id => genreMap[id]).filter(Boolean);
      const selectedLanguageData = languageIds?.map(id => languageMapFull[id]).filter(Boolean) || [];
      const currentOffset = additionalOffset;

      // Get era description for search
      const getEraKeyword = (yearFrom, yearTo) => {
         // Very old music
         if (yearTo < 1950) return 'classic vintage jazz blues early';

         // By decade
         if (yearFrom >= 1950 && yearTo <= 1959) return '1950s 50s fifties';
         if (yearFrom >= 1960 && yearTo <= 1969) return '1960s 60s sixties';
         if (yearFrom >= 1970 && yearTo <= 1979) return '1970s 70s seventies';
         if (yearFrom >= 1980 && yearTo <= 1989) return '1980s 80s eighties';
         if (yearFrom >= 1990 && yearTo <= 1999) return '1990s 90s nineties';
         if (yearFrom >= 2000 && yearTo <= 2009) return '2000s 00s';
         if (yearFrom >= 2010 && yearTo <= 2019) return '2010s';
         if (yearFrom >= 2020) return '2020s recent new';

         // Mixed ranges
         if (yearFrom < 2000 && yearTo < 2010) return 'classic retro';
         if (yearFrom >= 2000 && yearTo >= 2020) return 'modern contemporary';
         if (yearFrom < 1990) return 'vintage classic';

         return '';
      };

      const eraKeyword = getEraKeyword(yearRange.from, yearRange.to);

      let allPromises = [];

      if (selectedLanguageData.length > 0) {
         for (const langData of selectedLanguageData) {
            const { code, lang, adj } = langData;

            for (const genre of selectedGenres) {
               const genreWithEra = eraKeyword ? `${eraKeyword} ${genre}` : genre;
               allPromises.push(searchArtistsByCountryWithYear(code, lang, adj, genreWithEra, yearRange, 20, currentOffset));
            }
         }
      } else {
         const genrePromises = selectedGenres.map(genre => {
            const genreWithEra = eraKeyword ? `${eraKeyword} ${genre}` : genre;
            return searchArtistsByGenreWithYear(genreWithEra, yearRange, 20, currentOffset);
         });
         allPromises.push(...genrePromises);
      }

      const results = await Promise.all(allPromises);
      const allArtists = results.flat();

      const uniqueArtists = Array.from(
         new Map(allArtists.map(a => [a.id, a])).values()
      );

      // Filter by era based on popularity patterns
      const filteredByEra = uniqueArtists.filter(artist => {
         // Very old music (before 1970) - prefer lower popularity (classic artists)
         if (yearRange.to < 1970) {
            return artist.popularity < 80;
         }

         // Old music (before 2000) - exclude mega-stars
         if (yearRange.to < 2000) {
            return artist.popularity < 85;
         }

         // Very recent music (2020+) - prefer active artists
         if (yearRange.from >= 2020) {
            return artist.popularity > 50;
         }

         // For mixed ranges, accept all
         return true;
      });

      return filteredByEra
         .sort((a, b) => b.popularity - a.popularity)
         .slice(0, 50);

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
         {
            headers: { 'Authorization': `Bearer ${token}` }
         }
      );

      const data = await response.json();

      if (data.artists?.items) {
         return data.artists.items.map(artist => ({
            id: artist.id,
            name: artist.name,
            genre: genre,
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