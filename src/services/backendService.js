const API_URL = 'http://192.168.1.198:3001/api';
//change to localhost for testing on own machine or keep other machine alive

export const BackendService = {
    async loginUser(credentials) {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(credentials)
            });
            if (!response.ok) return { error: "Login failed" };
            return await response.json();
        } catch (error) {
            console.error("Login Error:", error);
            return { error: error.message };
        }
    },

    async saveUser(user) {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(user)
            });

            // ✅ IMPORTANT: If server says "Conflict" (409), return the error text
            if (response.status === 409) {
                return { error: "User already exists" };
            }

            return await response.json();
        } catch (error) {
            console.error("Save User Error:", error);
            return { error: error.message };
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