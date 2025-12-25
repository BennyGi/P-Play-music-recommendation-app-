const STORAGE_KEYS = {
   USER_DATA: 'music_app_user_data',
   PREFERENCES: 'music_app_preferences',
   PLAYLISTS: 'music_app_playlists',
   RATINGS: 'music_app_ratings',
   BLACKLIST: 'music_app_blacklist'
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

   saveRating(itemId, rating) {
      try {
         const ratings = this.getRatings() || {};
         ratings[itemId] = rating;
         localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
         console.log(`Rating saved for ${itemId}:`, rating);
         return true;
      } catch (error) {
         console.error('Error saving rating:', error);
         return false;
      }
   },

   removeRating(itemId) {
      try {
         const ratings = this.getRatings() || {};
         delete ratings[itemId];
         localStorage.setItem(STORAGE_KEYS.RATINGS, JSON.stringify(ratings));
         return true;
      } catch (error) {
         console.error('Error removing rating:', error);
         return false;
      }
   },

   getRatings() {
      try {
         const data = localStorage.getItem(STORAGE_KEYS.RATINGS);
         return data ? JSON.parse(data) : {};
      } catch (error) {
         console.error('Error loading ratings:', error);
         return {};
      }
   },

   saveBlacklist(itemId) {
      try {
         const blacklist = this.getBlacklist() || [];
         if (!blacklist.includes(itemId)) {
            blacklist.push(itemId);
            localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(blacklist));
            console.log('Added to blacklist:', itemId);
         }
         return true;
      } catch (error) {
         console.error('Error saving to blacklist:', error);
         return false;
      }
   },

   removeFromBlacklist(itemId) {
      try {
         const blacklist = this.getBlacklist() || [];
         const updatedList = blacklist.filter(id => id !== itemId);
         localStorage.setItem(STORAGE_KEYS.BLACKLIST, JSON.stringify(updatedList));
         return true;
      } catch (error) {
         console.error('Error removing from blacklist:', error);
         return false;
      }
   },

   getBlacklist() {
      try {
         const data = localStorage.getItem(STORAGE_KEYS.BLACKLIST);
         return data ? JSON.parse(data) : [];
      } catch (error) {
         console.error('Error loading blacklist:', error);
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
         playlists: this.getPlaylists(),
         ratings: this.getRatings(),
         blacklist: this.getBlacklist()
      };
   }
};