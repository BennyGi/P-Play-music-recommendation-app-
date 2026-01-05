const USER_KEY = 'pplay_user';
const PREF_KEY = 'pplay_preferences';
const PLAYLISTS_KEY = 'pplay_playlists';
const RATINGS_KEY = 'pplay_ratings';
const BLACKLIST_KEY = 'pplay_blacklist';
const LIKED_SONGS_KEY = 'pplay_liked_songs';

const STEP_KEY = 'pplay_current_step';
const IN_PROGRESS_KEY = 'pplay_onboarding_in_progress';

export const StorageService = {
  saveUserData(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  getUserData() {
    const raw = localStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  savePreferences(partial) {
    const existing = this.getPreferences() || {};
    const merged = { ...existing, ...partial };
    localStorage.setItem(PREF_KEY, JSON.stringify(merged));
  },

  getPreferences() {
    const raw = localStorage.getItem(PREF_KEY);
    return raw ? JSON.parse(raw) : null;
  },

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
    localStorage.setItem(LIKED_SONGS_KEY, JSON.stringify(arr));
  },

  isLiked(id) {
    const liked = this.getLikedSongs();
    return liked.some((t) => t?.id === id);
  },

  toggleLike(track) {
    const liked = this.getLikedSongs();
    const id = track?.id;
    if (!id) return liked;

    const exists = liked.some((t) => t.id === id);

    const next = exists
      ? liked.filter((t) => t.id !== id)
      : [
          {
            id: track.id,
            title: track.title,
            artist: track.artist,
            image: track.image,
            url: track.url,
            previewUrl: track.previewUrl
          },
          ...liked
        ];

    this.saveLikedSongs(next);

    const ratings = this.getRatings();
    if (exists) delete ratings[id];
    else ratings[id] = 'like';
    localStorage.setItem(RATINGS_KEY, JSON.stringify(ratings));

    return next;
  },

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

  exportData() {
    return {
      user: this.getUserData(),
      preferences: this.getPreferences(),
      playlists: this.getPlaylists(),
      ratings: this.getRatings(),
      blacklist: this.getBlacklist(),
      likedSongs: this.getLikedSongs()
    };
  },

  clearAllData() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(PREF_KEY);
    localStorage.removeItem(PLAYLISTS_KEY);
    localStorage.removeItem(RATINGS_KEY);
    localStorage.removeItem(BLACKLIST_KEY);
    localStorage.removeItem(LIKED_SONGS_KEY);
    localStorage.removeItem(STEP_KEY);
    localStorage.removeItem(IN_PROGRESS_KEY);
  }
};
