// FILE: src/utils/storage.js
import '../services/musicDbService';

// =====================================================
//   STORAGE SERVICE - Fixed with Per-User Liked Songs
// =====================================================

const STORAGE_KEYS = {
  USERS: 'pplay_users',
  ACTIVE_USER: 'pplay_active_user',
  PREFERENCES: 'pplay_preferences',
  PLAYLISTS: 'pplay_playlists',
  LIKED_SONGS_PREFIX: 'pplay_liked_songs_',
  BLACKLIST: 'pplay_blacklist',
  ONBOARDING_IN_PROGRESS: 'pplay_onboarding_in_progress',
  CURRENT_STEP: 'pplay_current_step',
  LIBRARY_PLAYLISTS_PREFIX: 'pplay_library_',
};

const safeJsonParse = (str, fallback = null) => {
  try {
    return str ? JSON.parse(str) : fallback;
  } catch (e) {
    console.warn('Failed to parse JSON:', e);
    return fallback;
  }
};

const safeSetItem = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (e) {
    console.error('Failed to save to localStorage:', e);
    if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
      console.error('LocalStorage quota exceeded!');
    }
    return false;
  }
};

const getCurrentUserKey = () => {
  const user = safeJsonParse(localStorage.getItem(STORAGE_KEYS.ACTIVE_USER));
  return user?.email?.toLowerCase() || 'guest';
};

export const StorageService = {
  // =====================================================
  //   USER MANAGEMENT
  // =====================================================

  registerUser(userData) {
    const users = this.getAllUsers();
    const existingUser = users.find((u) => u.email.toLowerCase() === userData.email.toLowerCase());

    if (existingUser) {
      throw new Error('Email already registered');
    }

    users.push(userData);
    safeSetItem(STORAGE_KEYS.USERS, users);
    safeSetItem(STORAGE_KEYS.ACTIVE_USER, userData);

    return userData;
  },

  loginUser(email, password) {
    const users = this.getAllUsers();
    const user = users.find(
      (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
    );

    if (!user) {
      throw new Error('Invalid email or password');
    }

    safeSetItem(STORAGE_KEYS.ACTIVE_USER, user);
    return user;
  },

  logoutUser() {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_IN_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
  },

  getUserData() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.ACTIVE_USER));
  },

  getAllUsers() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.USERS), []);
  },

  // =====================================================
  //   SMART NAV (Returning users)
  // =====================================================

  hasAnyStoredLibraryPlaylists() {
    try {
      const users = this.getAllUsers();
      if (!users || users.length === 0) return false;

      for (const u of users) {
        const email = (u?.email || '').toLowerCase();
        if (!email) continue;
        const key = STORAGE_KEYS.LIBRARY_PLAYLISTS_PREFIX + email;
        const lib = safeJsonParse(localStorage.getItem(key), []);
        if (Array.isArray(lib) && lib.length > 0) return true;
      }
      return false;
    } catch (e) {
      console.warn('hasAnyStoredLibraryPlaylists failed:', e);
      return false;
    }
  },

  updateUser(updatedData) {
    const users = this.getAllUsers();
    const activeUser = this.getUserData();

    if (!activeUser) return null;

    const idx = users.findIndex((u) => u.email.toLowerCase() === activeUser.email.toLowerCase());

    if (idx !== -1) {
      users[idx] = { ...users[idx], ...updatedData };
      safeSetItem(STORAGE_KEYS.USERS, users);
      safeSetItem(STORAGE_KEYS.ACTIVE_USER, users[idx]);
      return users[idx];
    }

    return null;
  },

  // =====================================================
  //   PREFERENCES (Per-User via active user context)
  // =====================================================

  savePreferences(prefs) {
    const existing = this.getPreferences() || {};
    const merged = { ...existing, ...prefs };
    safeSetItem(STORAGE_KEYS.PREFERENCES, merged);
    return merged;
  },

  getPreferences() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.PREFERENCES));
  },

  clearPreferences() {
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
  },

  // =====================================================
  //   CURRENT PLAYLIST (Active/Playing)
  // =====================================================

  savePlaylist(playlist) {
    let playlists = this.getPlaylists();
    playlists = [playlist];
    safeSetItem(STORAGE_KEYS.PLAYLISTS, playlists);
    return playlist;
  },

  getPlaylists() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.PLAYLISTS), []);
  },

  getLatestPlaylist() {
    const playlists = this.getPlaylists();
    return playlists.length > 0 ? playlists[0] : null;
  },

  // =====================================================
  //   LIKED SONGS - NOW PER USER!
  // =====================================================

  _getLikedSongsKey() {
    return STORAGE_KEYS.LIKED_SONGS_PREFIX + getCurrentUserKey();
  },

  getLikedSongs() {
    const key = this._getLikedSongsKey();
    return safeJsonParse(localStorage.getItem(key), []);
  },

  saveLikedSongs(songs) {
    const key = this._getLikedSongsKey();
    safeSetItem(key, songs);
  },

  addLikedSong(song) {
    const songs = this.getLikedSongs();
    if (!songs.find((s) => s.id === song.id)) {
      songs.push(song);
      this.saveLikedSongs(songs);
    }
    return songs;
  },

  removeLikedSong(songId) {
    const songs = this.getLikedSongs().filter((s) => s.id !== songId);
    this.saveLikedSongs(songs);
    return songs;
  },

  clearLikedSongs() {
    const key = this._getLikedSongsKey();
    localStorage.removeItem(key);
  },

  // =====================================================
  //   LIBRARY PLAYLISTS - NOW PER USER!
  // =====================================================

  _getLibraryKey() {
    return STORAGE_KEYS.LIBRARY_PLAYLISTS_PREFIX + getCurrentUserKey();
  },

  getLibraryPlaylists() {
    const key = this._getLibraryKey();
    return safeJsonParse(localStorage.getItem(key), []);
  },

  setLibraryPlaylists(playlists) {
    const key = this._getLibraryKey();
    return safeSetItem(key, playlists);
  },

  saveToLibrary(playlist) {
    try {
      const existing = this.getLibraryPlaylists();
      const updated = [...existing, playlist];
      const key = this._getLibraryKey();
      return safeSetItem(key, updated);
    } catch (e) {
      console.error('Failed to save to library:', e);
      return false;
    }
  },

  removeFromLibrary(playlistId) {
    const existing = this.getLibraryPlaylists();
    const updated = existing.filter((p) => p.id !== playlistId);
    const key = this._getLibraryKey();
    return safeSetItem(key, updated);
  },

  updateLibraryPlaylist(playlistId, updates) {
    const existing = this.getLibraryPlaylists();
    const updated = existing.map((p) => (p.id === playlistId ? { ...p, ...updates } : p));
    const key = this._getLibraryKey();
    return safeSetItem(key, updated);
  },

  // =====================================================
  //   BLACKLIST
  // =====================================================

  getBlacklist() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.BLACKLIST), []);
  },

  saveBlacklist(item) {
    const list = this.getBlacklist();
    if (!list.includes(item)) {
      list.push(item);
      safeSetItem(STORAGE_KEYS.BLACKLIST, list);
    }
    return list;
  },

  removeFromBlacklist(item) {
    const list = this.getBlacklist().filter((i) => i !== item);
    safeSetItem(STORAGE_KEYS.BLACKLIST, list);
    return list;
  },

  // =====================================================
  //   ONBOARDING STATE
  // =====================================================

  setOnboardingInProgress(value) {
    safeSetItem(STORAGE_KEYS.ONBOARDING_IN_PROGRESS, value);
  },

  getOnboardingInProgress() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.ONBOARDING_IN_PROGRESS), false);
  },

  setCurrentStep(step) {
    safeSetItem(STORAGE_KEYS.CURRENT_STEP, step);
  },

  getCurrentStep() {
    return safeJsonParse(localStorage.getItem(STORAGE_KEYS.CURRENT_STEP));
  },

  clearCurrentStep() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);
  },

  // =====================================================
  //   DATA EXPORT / IMPORT / CLEAR
  // =====================================================

  exportData() {
    return {
      user: this.getUserData(),
      preferences: this.getPreferences(),
      playlists: this.getPlaylists(),
      libraryPlaylists: this.getLibraryPlaylists(),
      likedSongs: this.getLikedSongs(),
      blacklist: this.getBlacklist(),
      exportedAt: new Date().toISOString(),
    };
  },

  importData(data) {
    if (data.preferences) safeSetItem(STORAGE_KEYS.PREFERENCES, data.preferences);
    if (data.playlists) safeSetItem(STORAGE_KEYS.PLAYLISTS, data.playlists);
    if (data.libraryPlaylists) this.setLibraryPlaylists(data.libraryPlaylists);
    if (data.likedSongs) this.saveLikedSongs(data.likedSongs);
    if (data.blacklist) safeSetItem(STORAGE_KEYS.BLACKLIST, data.blacklist);
  },

  clearAllData() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_USER);
    localStorage.removeItem(STORAGE_KEYS.PREFERENCES);
    localStorage.removeItem(STORAGE_KEYS.PLAYLISTS);
    localStorage.removeItem(STORAGE_KEYS.BLACKLIST);
    localStorage.removeItem(STORAGE_KEYS.ONBOARDING_IN_PROGRESS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_STEP);

    const userKey = getCurrentUserKey();
    localStorage.removeItem(STORAGE_KEYS.LIKED_SONGS_PREFIX + userKey);
    localStorage.removeItem(STORAGE_KEYS.LIBRARY_PLAYLISTS_PREFIX + userKey);
  },

  // =====================================================
  //   STORAGE INFO (for debugging)
  // =====================================================

  getStorageInfo() {
    let totalSize = 0;
    const breakdown = {};

    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key.startsWith('pplay_')) {
        const item = localStorage.getItem(key);
        const size = item ? new Blob([item]).size : 0;
        breakdown[key] = {
          sizeBytes: size,
          sizeKB: (size / 1024).toFixed(2),
        };
        totalSize += size;
      }
    }

    return {
      totalBytes: totalSize,
      totalKB: (totalSize / 1024).toFixed(2),
      totalMB: (totalSize / (1024 * 1024)).toFixed(2),
      breakdown,
    };
  },
};

export default StorageService;
