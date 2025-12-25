// Simulating a robust Database Connection Service
// In a real app, this would connect to your backend or a service like Firebase/Supabase/Spotify

const API_KEY = 'b25b959554ed76058ac220b7b2e0a026'; // Public shared Last.fm demo key (often used for examples)
const BASE_URL = 'https://ws.audioscrobbler.com/2.0/';

export const MusicDbService = {

    // Map our internal genre IDs to Last.fm tag names
    getGenreTag(id) {
        const tags = {
            1: 'pop', 2: 'rock', 3: 'hip-hop', 4: 'rap', 5: 'electronic',
            6: 'jazz', 7: 'classical', 8: 'rnb', 9: 'country', 10: 'latin',
            11: 'metal', 12: 'indie', 13: 'edm', 14: 'reggae', 15: 'blues',
            16: 'folk', 17: 'soul', 18: 'punk', 19: 'funk', 20: 'house',
            21: 'k-pop', 22: 'lo-fi', 23: 'ambient', 24: 'afrobeat'
        };
        return tags[id] || 'pop';
    },

    async fetchRecommendations(genreIds) {
        if (!genreIds || genreIds.length === 0) return { tracks: [], artists: [] };

        // Pick a random genre from the user's selection to keep it fresh
        const randomGenreId = genreIds[Math.floor(Math.random() * genreIds.length)];
        const tag = this.getGenreTag(randomGenreId);

        try {
            // Parallel "DB" requests
            const [tracksResponse, artistsResponse] = await Promise.all([
                fetch(`${BASE_URL}?method=tag.gettoptracks&tag=${tag}&api_key=${API_KEY}&format=json&limit=10`),
                fetch(`${BASE_URL}?method=tag.gettopartists&tag=${tag}&api_key=${API_KEY}&format=json&limit=12`)
            ]);

            const tracksData = await tracksResponse.json();
            const artistsData = await artistsResponse.json();

            // Transform "DB" rows to our app's format
            const tracks = tracksData.tracks?.track.map(t => ({
                id: `track_${t.mbid || t.name.replace(/\s/g, '')}`,
                title: t.name,
                artist: t.artist.name,
                url: t.url,
                image: t.image?.[1]?.['#text'] // Medium size image
            })) || [];

            const artists = artistsData.topartists?.artist.map(a => ({
                name: a.name,
                id: `artist_${a.mbid || a.name.replace(/\s/g, '')}`,
                url: a.url,
                image: a.image?.[2]?.['#text'] // Large image
            })) || [];

            return { tracks, artists };

        } catch (error) {
            console.error("Database Connection Error:", error);
            // Fallback if API fails (so the app doesn't crash)
            return {
                tracks: [
                    { id: 'err_1', title: 'Connection Failed', artist: 'Please check internet' }
                ],
                artists: []
            };
        }
    }
};