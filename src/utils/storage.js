const USER_KEY = 'pplay_user';
const PREF_KEY = 'pplay_preferences';
const PLAYLISTS_KEY = 'pplay_playlists';
const RATINGS_KEY = 'pplay_ratings';
const BLACKLIST_KEY = 'pplay_blacklist';

export const StorageService = {
   // --- User ---
   saveUserData(user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user));
   },

   getUserData() {
      const raw = localStorage.getItem(USER_KEY);
      return raw ? JSON.parse(raw) : null;
   },

   // --- Preferences (genres, languages, years, artists) ---
   savePreferences(partial) {
      const existing = this.getPreferences() || {};
      const merged = { ...existing, ...partial };
      localStorage.setItem(PREF_KEY, JSON.stringify(merged));
   },

   getPreferences() {
      const raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : null;
   },

   // --- Playlists ---
   savePlaylist(playlist) {
      const existing = this.getPlaylists();
      existing.push(playlist);
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(existing));
      console.log('💾 Playlist saved:', playlist);
   },

   getPlaylists() {
      const raw = localStorage.getItem(PLAYLISTS_KEY);
      return raw ? JSON.parse(raw) : [];
   },

   getLatestPlaylist() {
      const all = this.getPlaylists();
      return all.length > 0 ? all[all.length - 1] : null;
   },

   // --- Ratings & blacklist (לייקים / בלוקים) ---
   getRatings() {
      const raw = localStorage.getItem(RATINGS_KEY);
      return raw ? JSON.parse(raw) : {};
   },

   saveRating(id, status) {
      const ratings = this.getRatings();
      ratings[id] = status;
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
   },

   removeRating(id) {
      const ratings = this.getRatings();
      delete ratings[id];
      localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));
   },

   getBlacklist() {
      const raw = localStorage.getItem(BLACKLIST_KEY);
      return raw ? JSON.parse(raw) : [];
   },

   saveBlacklist(id) {
      const list = this.getBlacklist();
      if (!list.includes(id)) {
         list.push(id);
         localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
      }
   },

   removeFromBlacklist(id) {
      const list = this.getBlacklist().filter((x) => x !== id);
      localStorage.setItem(BLACKLIST_KEY, JSON.stringify(list));
   },

   // --- Export / Clear ---
   exportData() {
      return {
         user: this.getUserData(),
         preferences: this.getPreferences(),
         playlists: this.getPlaylists(),
         ratings: this.getRatings(),
         blacklist: this.getBlacklist()
      };
   },

   clearAllData() {
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(PREF_KEY);
      localStorage.removeItem(PLAYLISTS_KEY);
      localStorage.removeItem(RATINGS_KEY);
      localStorage.removeItem(BLACKLIST_KEY);
   }
};
