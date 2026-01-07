import '../services/musicDbService';

const CURRENT_USER_KEY = 'pplay_current_user';
const USERS_DB_KEY = 'pplay_users_db';
const PREF_KEY = 'pplay_preferences';
const PLAYLISTS_KEY = 'pplay_playlists';
const RATINGS_KEY = 'pplay_ratings';
const BLACKLIST_KEY = 'pplay_blacklist';
const LIKED_SONGS_KEY = 'pplay_liked_songs';
const PASSWORD_RESETS_KEY = 'pplay_password_resets';

const STEP_KEY = 'pplay_current_step';
const IN_PROGRESS_KEY = 'pplay_onboarding_in_progress';

export const StorageService = {
   // --- AUTH SYSTEM ---

   // Register: save new user to DB and log them in
   registerUser(userData) {
      const users = this.getAllUsers();

      // Check if email exists
      if (users.some(u => u.email === userData.email)) {
         throw new Error("User with this email already exists");
      }

      // Add to DB
      users.push(userData);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

      // Auto-login after registration
      this.saveCurrentUser(userData);
   },

   // Login: verify email and password
   loginUser(email, password) {
      const users = this.getAllUsers();
      const user = users.find(u => u.email === email && u.password === password);

      if (user) {
         this.saveCurrentUser(user);
         return user;
      }
      return null;
   },

   logoutUser() {
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(STEP_KEY);
      localStorage.removeItem(IN_PROGRESS_KEY);
   },

   getAllUsers() {
      try {
         const raw = localStorage.getItem(USERS_DB_KEY);
         return raw ? JSON.parse(raw) : [];
      } catch {
         return [];
      }
   },

   // --- PASSWORD RESET ---

   savePasswordResetToken(email, token) {
      const resets = this.getPasswordResets();
      // Remove old resets for this email
      const filteredResets = resets.filter(r => r.email !== email);
      filteredResets.push({
         email,
         token,
         expiry: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
         used: false
      });
      localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(filteredResets));
   },

   getPasswordResets() {
      try {
         const raw = localStorage.getItem(PASSWORD_RESETS_KEY);
         return raw ? JSON.parse(raw) : [];
      } catch {
         return [];
      }
   },

   validateResetToken(token) {
      const resets = this.getPasswordResets();
      const reset = resets.find(r => r.token === token && !r.used && r.expiry > Date.now());
      return reset || null;
   },

   resetPassword(token, newPassword) {
      const reset = this.validateResetToken(token);
      if (!reset) return false;

      // Update user password
      const users = this.getAllUsers();
      const userIndex = users.findIndex(u => u.email === reset.email);

      if (userIndex === -1) return false;

      users[userIndex].password = newPassword;
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));

      // Mark token as used
      const resets = this.getPasswordResets();
      const resetIndex = resets.findIndex(r => r.token === token);
      if (resetIndex !== -1) {
         resets[resetIndex].used = true;
         localStorage.setItem(PASSWORD_RESETS_KEY, JSON.stringify(resets));
      }

      return true;
   },

   // --- CURRENT SESSION MANAGEMENT ---

   saveCurrentUser(user) {
      if (!user) return;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
   },

   getUserData() {
      try {
         const raw = localStorage.getItem(CURRENT_USER_KEY);
         return raw ? JSON.parse(raw) : null;
      } catch (e) {
         console.error("Storage: Error parsing user data", e);
         return null;
      }
   },

   isAuthenticated() {
      return !!this.getUserData();
   },

   // --- PREFERENCES ---

   savePreferences(partial) {
      const existing = this.getPreferences() || {};
      const merged = { ...existing, ...partial };
      localStorage.setItem(PREF_KEY, JSON.stringify(merged));
   },

   getPreferences() {
      const raw = localStorage.getItem(PREF_KEY);
      return raw ? JSON.parse(raw) : null;
   },

   // --- PLAYLISTS ---

   savePlaylist(playlist) {
      const existing = this.getPlaylists();
      existing.push(playlist);
      localStorage.setItem(PLAYLISTS_KEY, JSON.stringify(existing));
   },

   getPlaylists() {
      const raw = localStorage.getItem(PLAYLISTS_KEY);
      return raw ? JSON.parse(raw) : [];
   },

   getLatestPlaylist() {
      const all = this.getPlaylists();
      return all.length > 0 ? all[all.length - 1] : null;
   },

   // --- RATINGS ---

   getRatings() {
      const raw = localStorage.getItem(RATINGS_KEY);
      return raw ? JSON.parse(raw) : {};
   },

   // --- BLACKLIST ---

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

   // --- LIKED SONGS ---

   getLikedSongs() {
      try {
         const raw = localStorage.getItem(LIKED_SONGS_KEY);
         if (!raw) return [];
         const parsed = JSON.parse(raw);
         return Array.isArray(parsed) ? parsed : [];
      } catch {
         return [];
      }
   },

   saveLikedSongs(arr) {
      if (!Array.isArray(arr)) return;
      localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(arr));
   },

   toggleLike(track) {
      const liked = this.getLikedSongs();
      const id = track?.id;
      if (!id) return liked;

      const exists = liked.some((t) => t.id === id);
      const next = exists
         ? liked.filter((t) => t.id !== id)
         : [{
            id: track.id,
            title: track.title,
            artist: track.artist,
            image: track.image,
            url: track.url,
            previewUrl: track.previewUrl,
            spotifyUrl: track.spotifyUrl
         }, ...liked];

      this.saveLikedSongs(next);
      return next;
   },

   // --- ONBOARDING STATE ---

   setCurrentStep(step) {
      localStorage.setItem(STEP_KEY, step);
   },

   getCurrentStep() {
      return localStorage.getItem(STEP_KEY);
   },

   clearCurrentStep() {
      localStorage.removeItem(STEP_KEY);
   },

   setOnboardingInProgress(flag) {
      localStorage.setItem(IN_PROGRESS_KEY, JSON.stringify(!!flag));
   },

   getOnboardingInProgress() {
      return JSON.parse(localStorage.getItem(IN_PROGRESS_KEY) || 'false');
   },

   clearOnboardingInProgress() {
      localStorage.removeItem(IN_PROGRESS_KEY);
   },

   // --- DATA EXPORT/CLEAR ---

   exportData() {
      return {
         user: this.getUserData(),
         preferences: this.getPreferences(),
         playlists: this.getPlaylists(),
         likedSongs: this.getLikedSongs()
      };
   },

   clearAllData() {
      localStorage.clear();
      console.log("Storage: All data cleared.");
   }
};

if (typeof window !== 'undefined') {
   window.StorageService = StorageService;
}