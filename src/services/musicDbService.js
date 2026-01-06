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

    // --- SPRINT 1 LOGIC (Preserved for backward compatibility) ---
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
    },
    // --- SPRINT 2 NEW LOGIC (Task 4.2 & Smart Queries) ---
    // Handles partial preferences (Skip) and returns real track structure
    async generatePlaylist(preferences) {
        console.log("DB: Generating playlist with preferences:", preferences);

        const genreIds = preferences.genres || [];
        // Note: languages and years are passed but Last.fm API support for them is limited.
        // We simulate the "Smart Query" by prioritizing the Genre, which is mandatory.

        // 1. Logic: If genres are skipped (empty), fallback to 'pop'
        let tag = 'pop';
        if (genreIds.length > 0) {
            const randomGenreId = genreIds[Math.floor(Math.random() * genreIds.length)];
            tag = this.getGenreTag(randomGenreId);
        }

        try {
            // Fetch more tracks (limit=50) to allow for client-side filtering if needed later
            const response = await fetch(`${BASE_URL}?method=tag.gettoptracks&tag=${tag}&api_key=${API_KEY}&format=json&limit=50`);
            const data = await response.json();

            const rawTracks = data.tracks?.track || [];

            // Transform to "Real Track" Object for Player
            const tracks = rawTracks.map(t => ({
                id: `track_${t.mbid || t.name.replace(/\s/g, '')}_${Date.now().toString(36)}`, // Unique ID
                title: t.name,
                artist: t.artist.name,
                url: t.url, // Last.fm link
                previewUrl: null, // Last.fm doesn't provide audio previews, will need Spotify/iTunes fallback later
                image: t.image?.[2]?.['#text'] || 'https://placehold.co/300', // Large image
                duration: '0:30' // Placeholder
            }));

            return {
                name: `My ${tag.charAt(0).toUpperCase() + tag.slice(1)} Mix`,
                description: `Generated based on ${tag} and your preferences.`,
                tracks: tracks
            };

        } catch (error) {
            console.error("MusicDbService: Error generating playlist", error);
            return { name: "Error Mix", tracks: [] };
        }
    }
};

// Expose for Alexander's DBA Console Testing
if (typeof window !== 'undefined') {
    console.log("✅ DB SERVICE LOADED - You can now use window.MusicDbService");
    window.MusicDbService = MusicDbService;
}