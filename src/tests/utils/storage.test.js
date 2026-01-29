/**
 * בדיקות אוטומציה ל-StorageService
 * 
 * מה הבדיקות האלה עושות:
 * 1. בודקות שהמשתמש יכול להירשם ולהתחבר
 * 2. בודקות שהעדפות נשמרות ונשלפות נכון
 * 3. בודקות שפלייליסטים נשמרים ונשלפים נכון
 * 4. בודקות ששירים אהובים נשמרים לפי משתמש
 * 5. בודקות שהכל מתנקה כשמתנתקים
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { StorageService } from '../../utils/storage';

describe('StorageService', () => {
  beforeEach(() => {
    // נקה את ה-localStorage לפני כל בדיקה
    localStorage.clear();
  });

  describe('User Management', () => {
    it('should register a new user', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User',
        birthDate: '2000-01-01',
        country: 'IL'
      };

      const registered = StorageService.registerUser(userData);
      expect(registered).toEqual(userData);
      expect(StorageService.getUserData()).toEqual(userData);
    });

    it('should not allow duplicate email registration', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      StorageService.registerUser(userData);
      
      expect(() => {
        StorageService.registerUser(userData);
      }).toThrow('Email already registered');
    });

    it('should login user with correct credentials', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      StorageService.registerUser(userData);
      StorageService.logoutUser();

      const loggedIn = StorageService.loginUser('test@example.com', 'password123');
      expect(loggedIn).toEqual(userData);
      expect(StorageService.getUserData()).toEqual(userData);
    });

    it('should reject login with wrong password', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      StorageService.registerUser(userData);
      StorageService.logoutUser();

      expect(() => {
        StorageService.loginUser('test@example.com', 'wrongpassword');
      }).toThrow('Invalid email or password');
    });

    it('should logout user and clear data', () => {
      const userData = {
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      };

      StorageService.registerUser(userData);
      StorageService.savePreferences({ genres: [1, 2] });
      StorageService.logoutUser();

      expect(StorageService.getUserData()).toBeNull();
      expect(StorageService.getPreferences()).toBeNull();
    });
  });

  describe('Preferences', () => {
    beforeEach(() => {
      StorageService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should save and retrieve preferences', () => {
      const prefs = {
        genres: [1, 2, 3],
        languages: [1, 12],
        years: { from: 2010, to: 2025 },
        artists: [{ id: 'artist1', name: 'Artist 1' }]
      };

      StorageService.savePreferences(prefs);
      const retrieved = StorageService.getPreferences();

      expect(retrieved.genres).toEqual([1, 2, 3]);
      expect(retrieved.languages).toEqual([1, 12]);
      expect(retrieved.years).toEqual({ from: 2010, to: 2025 });
      expect(retrieved.artists).toEqual([{ id: 'artist1', name: 'Artist 1' }]);
    });

    it('should merge preferences when saving', () => {
      StorageService.savePreferences({ genres: [1, 2] });
      StorageService.savePreferences({ languages: [1] });

      const prefs = StorageService.getPreferences();
      expect(prefs.genres).toEqual([1, 2]);
      expect(prefs.languages).toEqual([1]);
    });

    it('should clear preferences', () => {
      StorageService.savePreferences({ genres: [1, 2] });
      StorageService.clearPreferences();

      expect(StorageService.getPreferences()).toBeNull();
    });
  });

  describe('Playlists', () => {
    beforeEach(() => {
      StorageService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should save and retrieve playlist', () => {
      const playlist = {
        id: 'playlist1',
        name: 'My Playlist',
        tracks: [
          { id: 'track1', title: 'Song 1', artist: 'Artist 1' },
          { id: 'track2', title: 'Song 2', artist: 'Artist 2' }
        ],
        createdAt: new Date().toISOString()
      };

      StorageService.savePlaylist(playlist);
      const retrieved = StorageService.getLatestPlaylist();

      expect(retrieved.id).toBe('playlist1');
      expect(retrieved.name).toBe('My Playlist');
      expect(retrieved.tracks).toHaveLength(2);
    });

    it('should return null if no playlists exist', () => {
      expect(StorageService.getLatestPlaylist()).toBeNull();
    });
  });

  describe('Liked Songs', () => {
    beforeEach(() => {
      StorageService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should add liked song', () => {
      const song = {
        id: 'song1',
        title: 'Liked Song',
        artist: 'Artist'
      };

      const updated = StorageService.addLikedSong(song);
      expect(updated).toHaveLength(1);
      expect(updated[0].id).toBe('song1');
      expect(StorageService.getLikedSongs()).toHaveLength(1);
    });

    it('should not add duplicate liked songs', () => {
      const song = {
        id: 'song1',
        title: 'Liked Song',
        artist: 'Artist'
      };

      StorageService.addLikedSong(song);
      StorageService.addLikedSong(song);

      expect(StorageService.getLikedSongs()).toHaveLength(1);
    });

    it('should remove liked song', () => {
      const song = {
        id: 'song1',
        title: 'Liked Song',
        artist: 'Artist'
      };

      StorageService.addLikedSong(song);
      const updated = StorageService.removeLikedSong('song1');

      expect(updated).toHaveLength(0);
      expect(StorageService.getLikedSongs()).toHaveLength(0);
    });

    it('should store liked songs per user', () => {
      const song1 = { id: 'song1', title: 'Song 1', artist: 'Artist' };
      StorageService.addLikedSong(song1);

      // Logout and login as different user
      StorageService.logoutUser();
      StorageService.registerUser({
        email: 'user2@example.com',
        password: 'password123',
        name: 'User 2'
      });

      expect(StorageService.getLikedSongs()).toHaveLength(0);

      const song2 = { id: 'song2', title: 'Song 2', artist: 'Artist' };
      StorageService.addLikedSong(song2);

      expect(StorageService.getLikedSongs()).toHaveLength(1);
      expect(StorageService.getLikedSongs()[0].id).toBe('song2');
    });
  });

  describe('Library Playlists', () => {
    beforeEach(() => {
      StorageService.registerUser({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
    });

    it('should save playlist to library', () => {
      const playlist = {
        id: 'lib1',
        name: 'Library Playlist',
        tracks: []
      };

      StorageService.saveToLibrary(playlist);
      const library = StorageService.getLibraryPlaylists();

      expect(library).toHaveLength(1);
      expect(library[0].id).toBe('lib1');
    });

    it('should remove playlist from library', () => {
      const playlist = {
        id: 'lib1',
        name: 'Library Playlist',
        tracks: []
      };

      StorageService.saveToLibrary(playlist);
      StorageService.removeFromLibrary('lib1');

      expect(StorageService.getLibraryPlaylists()).toHaveLength(0);
    });
  });
});

