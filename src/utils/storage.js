const STORAGE_KEYS = {
   USER_DATA: 'music_app_user_data',
   PREFERENCES: 'music_app_preferences',
   PLAYLISTS: 'music_app_playlists'
};

export const StorageService = {
   saveUserData(userData) {
      try {
         localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
         console.log('User data saved:', userData);
         return true;
      } catch (error) {
         console.error('Error saving user data:', error);
         return false;
      }
   },

   getUserData() {
      try {
         const data = localStorage.getItem(STORAGE_KEYS.USER_DATA);
         return data ? JSON.parse(data) : null;
      } catch (error) {
         console.error('Error loading user data:', error);
         return null;
      }
   },

   savePreferences(preferences) {
      try {
         const existingPrefs = this.getPreferences() || {};
         const updatedPrefs = { ...existingPrefs, ...preferences };
         localStorage.setItem(STORAGE_KEYS.PREFERENCES, JSON.stringify(updatedPrefs));
         console.log('Preferences saved:', updatedPrefs);
         return true;
      } catch (error) {
         console.error('Error saving preferences:', error);
         return false;
      }
   },

   getPreferences() {
      try {
         const data = localStorage.getItem(STORAGE_KEYS.PREFERENCES);
         return data ? JSON.parse(data) : null;
      } catch (error) {
         console.error('Error loading preferences:', error);
         return null;
      }
   },

   savePlaylist(playlistData) {
      try {
         const playlists = this.getPlaylists() || [];
         const newPlaylist = {
            id: Date.now(),
            createdAt: new Date().toISOString(),
            ...playlistData
         };
         playlists.push(newPlaylist);
         localStorage.setItem(STORAGE_KEYS.PLAYLISTS, JSON.stringify(playlists));
         console.log('Playlist saved:', newPlaylist);
         return newPlaylist;
      } catch (error) {
         console.error('Error saving playlist:', error);
         return null;
      }
   },

   getPlaylists() {
      try {
         const data = localStorage.getItem(STORAGE_KEYS.PLAYLISTS);
         return data ? JSON.parse(data) : [];
      } catch (error) {
         console.error('Error loading playlists:', error);
         return [];
      }
   },

   getLatestPlaylist() {
      const playlists = this.getPlaylists();
      return playlists.length > 0 ? playlists[playlists.length - 1] : null;
   },

   clearAllData() {
      try {
         Object.values(STORAGE_KEYS).forEach(key => {
            localStorage.removeItem(key);
         });
         console.log('All data cleared');
         return true;
      } catch (error) {
         console.error('Error clearing data:', error);
         return false;
      }
   },

   exportData() {
      return {
         userData: this.getUserData(),
         preferences: this.getPreferences(),
         playlists: this.getPlaylists()
      };
   }
};