const API_URL = 'http://localhost:3001/api';

export const BackendService = {
    async saveUser(user) {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });
            return await response.json();
        } catch (error) {
            console.error("Backend Error (Save User):", error);
            return null;
        }
    },

    async savePlaylist(playlistData) {
        try {
            const response = await fetch(`${API_URL}/playlists`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(playlistData)
            });
            return await response.json();
        } catch (error) {
            console.error("Backend Error (Save Playlist):", error);
            return null;
        }
    },

    async getAllUsers() {
        try {
            const response = await fetch(`${API_URL}/users`);
            return await response.json();
        } catch (error) {
            console.error("Backend Error (Get Users):", error);
            return [];
        }
    },

    async getAllPlaylists() {
        try {
            const response = await fetch(`${API_URL}/playlists`);
            return await response.json();
        } catch (error) {
            console.error("Backend Error (Get Playlists):", error);
            return [];
        }
    }
};